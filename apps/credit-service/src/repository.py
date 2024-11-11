from flask import jsonify
from sqlalchemy import text
from models import Customer, InstalmentPayment, InstalmentPaymentStatus
from sqlalchemy import func
from datetime import datetime
from dateutil.relativedelta import relativedelta

# def retrieve_customer(db, customer_id):
#     try:
#         result = db.session.execute(text('SELECT * FROM "Customer" c WHERE c.customer_id = :customer_id'), 
#                                      {'customer_id': customer_id})

#         tables = [row[0] for row in result] 
#         return jsonify({"tables": tables})
#     except Exception as e:
#         return str(e)
    
def get_customer_credit_limit(customer_id):
    customer = Customer.query.get(customer_id)
    return customer.credit_tier.credit_limit

def get_customer_outstanding_balance(customer_id):
    today = datetime.now()
    outstanding_balance = InstalmentPayment.query.with_entities(func.sum(InstalmentPayment.amount_due)).filter(
        InstalmentPayment.status == InstalmentPaymentStatus.UNPAID,
        InstalmentPayment.due_date <= today,
        InstalmentPayment.transaction.has(customer_id=customer_id)
    ).scalar()
    return outstanding_balance

    
def update_customer_credit_rating(db, customer_id, credit_score):
    customer = Customer.query.get(customer_id)
    customer.credit_score = credit_score
    db.session.commit()
    print("Commited")


from datetime import datetime, timedelta

def get_most_recent_6_months_instalment_payments(db, customer_id):
    try:
        customer = Customer.query.get(customer_id)
        instalment_payments = []
        
        six_months_ago = datetime.now() - relativedelta(months=6)
        
        for transaction in customer.transactions:
            # Filter instalment payments that are within the last 6 months
            recent_payments = [
                payment for payment in transaction.instalment_payments
                if payment.due_date >= six_months_ago
            ]
            instalment_payments.extend(recent_payments)
        
        return serialise(instalment_payments)
    except Exception as e:
        return str(e)


def serialise(instalment_payments):
    return [
            {
                "instalment_payment_id": payment.instalment_payment_id,
                "amount_due": payment.amount_due,
                "late_payment_amount_due": payment.late_payment_amount_due,
                "status": payment.status.name,  # Assuming Enum has name attribute
                "due_date": payment.due_date,
                "paid_date": payment.paid_date,
                "instalment_number": payment.instalment_number,
                "amount_deducted_from_wallet": payment.amount_deducted_from_wallet,
                "amount_discount_from_voucher": payment.amount_discount_from_voucher,
                "amount_deducted_from_cashback_wallet": payment.amount_deducted_from_cashback_wallet,
            }
            for payment in instalment_payments
        ]