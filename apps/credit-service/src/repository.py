from models import Customer, InstalmentPayment, InstalmentPaymentStatus, CreditTier
from sqlalchemy import func
from datetime import datetime
from dateutil.relativedelta import relativedelta
    
def get_customer_credit_limit(customer_id):
    customer = Customer.query.get(customer_id)
    credit_tiers = CreditTier.query.filter(
        CreditTier.min_credit_score <= customer.credit_score,
        CreditTier.max_credit_score >= customer.credit_score
    ).all()
    if len(credit_tiers) > 1:
        raise Exception("More than 1 credit tier exists in database")
    if len(credit_tiers) == 0:
        raise Exception("Customer credit score does not belong to any credit tier in database")
    return credit_tiers[0].credit_limit

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
    
def get_lowest_credit_tier(db):
    credit_tiers = CreditTier.query.all()
    if len(credit_tiers) == 0 :
        raise Exception("No credit tier exists in database")
    lowest = credit_tiers[0]
    for credit_tier in credit_tiers:
        if credit_tier.credit_limit < lowest.credit_limit:
            lowest = credit_tier
    return lowest

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