import pandas as pd
import re
from tsfresh import extract_features
from tsfresh.utilities.dataframe_functions import impute
from collections import defaultdict
from datetime import datetime
from dateutil.relativedelta import relativedelta
import lightgbm as lgb
import fitz 
import re
from repository import get_most_recent_6_months_instalment_payments, update_customer_credit_rating, get_customer_credit_limit, get_customer_outstanding_balance
import pdfplumber
import random
[0.33090824]
def predict(X):
    # Load the trained LightGBM model
    model = lgb.Booster(model_file='../best_lgb_model.txt') 
    default_likelihood = model.predict(X)
    credit_rating = (1-default_likelihood) * 1000
    return credit_rating

def map_payment_status(payment_status):
    status_mapping = {
        'A': -1,  # on time (0 or 1 Payment Overdue Cycle)
        'B': 2,   # 2 months overdue (30 to 59 days)
        'C': 3,   # 3 months overdue (60 to 89 days)
        'D': 4,   # 4+ months overdue (90+ days)
        'E': -2,  # Closed with no outstanding status, can skip or handle differently
        '*': 0,  # Facility not used or zero balance
        'G': 0,  # Voluntary closure with outstanding
        'H': 5,  # Involuntary closure with outstanding
        'R': 0,  # Closed, restructured loan
        'S': 0,  # Closed, negotiated settlement
        'W': 6,  # Default record
        'M': 0   # Account status not available
    }
    return [status_mapping[status] for status in payment_status]

def extract_payment_history_and_credit_utilisation_ratio_from_cci(file):
    AVERAGE_CREDIT_UTILISATION_RATIO = 2.3217
    payment_history = []
    # balance = 0
    # credit_limit = 10

    pdf_document = fitz.open(file, filetype="pdf")
    
    for page_num in range(pdf_document.page_count):
        page = pdf_document[page_num]
        text = page.get_text()
        start_section = ["Unsecured Credit Card by Age Groups", "Delinquency"]
        if all(substring in text for substring in start_section):
            lines = text.strip().split('\n')
            COLS = 8
            ROWS = 6
            recent_6_months = lines[-COLS*(ROWS+1):-COLS]

            months = []
            delinquency_data = []

            for i in range(0, len(recent_6_months), COLS):  # 8 elements per month (1 month + 7 delinquency rates)
                month = recent_6_months[i].strip()
                delinquency_rates = [float(x.strip().strip('%')) for x in recent_6_months[i+1:i+COLS]]  # Convert to float and remove '%'
                months.append(month)
                delinquency_data.append(delinquency_rates)

            # Calculate the average delinquency for each month
            average_delinquency_per_month = [sum(month_data) / len(month_data) for month_data in delinquency_data]

            for avg_delinquency in average_delinquency_per_month:
                # print(f"{month}: {avg_delinquency:.2f}%")
                
                random_float = random.random()
                print(random_float, avg_delinquency/100, random_float < avg_delinquency/100)
    
                status = get_status_this_month(payment_history, len(payment_history), 0, random_float < avg_delinquency/100)
                payment_history.append(status)
            
            # Convert months that only defaulted by 1 month to -1, so that it is consistent with CBS report
            for i, status in enumerate(payment_history):
                if status == 1:
                    payment_history[i] = -1
            

    pdf_document.close()

        
    return payment_history, AVERAGE_CREDIT_UTILISATION_RATIO

def get_status_this_month(payment_history, idx, defaulted_months, hasDefaultThisMonth):
    
    # Base case: if the customer didn't default this month, return -1
    if not hasDefaultThisMonth:
        return -1
        
    # Base case: payment history is empty and customer defaults
    if len(payment_history) == 0:
        return 1
    
    # If we've reached the start of the list (idx < 0) or customer paid on time last month (payment_history[idx-1] == -1)
    if idx <= 0 or payment_history[idx - 1] == -1:
        return defaulted_months + 1  # Add 1 for this month's default
    
    # If the customer defaulted in the previous month, increment the default count
    if payment_history[idx - 1] != -1:
        defaulted_months += 1
    
    # Cap at 6 defaults
    if defaulted_months >= 6:
        return 6
    
    # Recursively check the previous months
    return get_status_this_month(payment_history, idx - 1, defaulted_months, hasDefaultThisMonth)
    

    
def extract_payment_history_and_credit_utilisation_ratio_from_report(file):
    payment_history = [0]
    balance = 0
    credit_limit = 10

    # Load the PDF file
    pdf_document = fitz.open(stream=file.read(), filetype="pdf")
    

    # Iterate through each page to find the status section
    for page_num in range(pdf_document.page_count):
        page = pdf_document[page_num]
        text = page.get_text()


        start_section = ["Unsecured Credit Card", "Account Status History"]
        end_section = "HDB Loan" 

        # Check if the section we want is in this page
        if all(substring in text for substring in start_section):
            
            # Extract the part of the text between start_section and end_section
            section_start = text.find(start_section[0])
            section_end = text.find(end_section, section_start)
            relevant_text = text[section_start:section_end].strip()
            
            status_sequences = re.findall(r'[ABCD*GHRSW]*', relevant_text)
            
            for status_sequence in status_sequences:
                if len(status_sequence) == 12:
                    payment_history = list(status_sequence[:6])
                    continue
            
            balance_match = re.search(r'\d+\.\d+', relevant_text)
            if balance_match:
                balance_str = balance_match.group()
                balance = int(float(balance_str))
            else:
                raise Exception("No balance found in PDF")
            
        start_section = "Unsecured Credit Limit"
        end_section = "Applicant Type" 

        if start_section in text:
            section_start = text.find(start_section)
            section_end = text.find(end_section, section_start)
            relevant_text = text[section_start+len(start_section):section_end].strip()

            credit_limit = int(relevant_text.replace(",", ""))
        
    # Close the PDF document
    pdf_document.close()

    return map_payment_status(payment_history), balance/credit_limit

def get_credit_utilisation_ratio(customer_id):
    credit_limit = get_customer_credit_limit(customer_id)
    outstanding_balance = get_customer_outstanding_balance(customer_id)

    return outstanding_balance/credit_limit

def get_payment_history(db, customer_id):
    instalment_payments = get_most_recent_6_months_instalment_payments(db, customer_id)
    monthly_status = defaultdict(lambda: -2)  # Default to -2: no payment for the month
    earliest_date = datetime.now()
    for instalment in instalment_payments:
        due_date = instalment["due_date"]
        if due_date < earliest_date:
            earliest_date = due_date
        paid_date = instalment["paid_date"]

        if paid_date:
            # Calculate the number of months late
            months_late = (paid_date.year - due_date.year) * 12 + (paid_date.month - due_date.month)
            months_late = max(1, min(9, months_late)) if months_late > 0 else -1  # Cap at 9+ and on-time as -1
            if months_late == 1:
                months_late = -1 # 1 month late will be deemed as paid on time
        else:
            # Consider as missed without payment (worst case of 9 months late)
            difference = relativedelta(datetime.now(), instalment["due_date"])
            months =  difference.years * 12 + difference.months
            months_late = min(6,months)
            if months_late == 0:
                months_late = -1 # If payment is due this month, it's considered 0 month late

        # Get month and year as the key
        month_year = (due_date.year, due_date.month)

        # Update to worst (highest) late status for the month
        if months_late > monthly_status[month_year]:
            monthly_status[month_year] = months_late
    
    # Determine the time frame for the status list
    end_date = datetime.now()
    start_date =  earliest_date # For example, the last year
    total_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month) + 1

    # Initialize the status list with the default value
    status_list = [-2] * total_months

    # Fill the status list with actual statuses
    for month_diff in range(total_months):
        current_month = (start_date.year, start_date.month + month_diff)
        # If the month overflows, move to the next year
        if current_month[1] > 12:
            current_month = (current_month[0] + 1, 1)
        
        # Check if there is a recorded status for the current month
        if current_month in monthly_status:
            status_list[month_diff] = monthly_status[current_month]

    return status_list



def preprocess(credit_utilisation_ratio, payment_history):
    df = pd.DataFrame()

    # Calculate TOTAL_BILL and CREDIT_UTILISATION_RATIO
    df["ID"] = pd.Series(["0"])
    df['CREDIT_UTILISATION_RATIO'] = pd.Series([credit_utilisation_ratio])

    for i, status in enumerate(payment_history):
        df[f'PAY_{i}'] = status  # Create PAY_0, PAY_1, etc.

    # Dynamically identify all PAY columns
    pay_columns = [col for col in df.columns if col.startswith('PAY_')]
    
    # Melt the dataframe to create a long format for repayment statuses
    df_tsfresh = df.melt(id_vars=['ID'], value_vars=pay_columns, 
                          var_name='payment_period', value_name='repayment_status')

    # Convert payment_period to time
    df_tsfresh['time'] = df_tsfresh['payment_period'].str.replace('PAY_', '').astype(int)
    # df_tsfresh['time'] = 6 - df_tsfresh['time']  # Assuming PAY_0 is the most recent
    

    # Extract features using tsfresh
    extracted_features = extract_features(df_tsfresh, column_id='ID', column_sort='time', column_value='repayment_status')
    extracted_features = impute(extracted_features)
    extracted_features.reset_index(inplace=True)
    

    # Combine extracted features with original data
    df.reset_index(drop=True, inplace=True)
    extracted_features.reset_index(inplace=True)

    relevant_features_df = pd.read_csv('../relevant_features.csv')
    relevant_feature_names = relevant_features_df['features'].tolist()

    extracted_features = extracted_features[relevant_feature_names]
    combined_features = df.merge(extracted_features, left_index=True, right_index=True)
    combined_features = combined_features.drop(columns=['ID'])
    combined_features = combined_features.drop(columns=combined_features.filter(like='PAY_').columns)
    
    # Clean column names if necessary
    combined_features.columns = [re.sub(r'[^a-zA-Z0-9_]', '_', col) for col in combined_features.columns]
    return combined_features
