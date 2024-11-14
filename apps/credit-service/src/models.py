import enum
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, Float, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime

db = SQLAlchemy()

class InstalmentPaymentStatus(enum.Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"

class CustomerStatus(enum.Enum):
    PENDING_EMAIL_VERIFICATION = "PENDING_EMAIL_VERIFICATION"
    PENDING_PHONE_VERIFICATION = "PENDING_PHONE_VERIFICATION"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"

class TransactionStatus(enum.Enum):
    FULLY_PAID = "FULLY_PAID"
    IN_PROGRESS = "IN_PROGRESS"

class InstalmentPayment(db.Model):
    __tablename__ = 'InstalmentPayment'
    
    instalment_payment_id = db.Column(String, primary_key=True, default=db.text('gen_random_uuid()'))
    amount_due = db.Column(Float, nullable=False)
    late_payment_amount_due = db.Column(Float, nullable=False)
    status = db.Column(Enum(InstalmentPaymentStatus), nullable=False)
    due_date = db.Column(DateTime, nullable=False)
    paid_date = db.Column(DateTime, nullable=True)
    instalment_number = db.Column(Integer, nullable=False)  
    
    amount_deducted_from_wallet = db.Column(Float, nullable=True)
    amount_discount_from_voucher = db.Column(Float, nullable=True)
    amount_deducted_from_cashback_wallet = db.Column(Float, nullable=True)
    
    # Relationships
    transaction_id = db.Column(String, ForeignKey('Transaction.transaction_id'), nullable=False)
    transaction = relationship("Transaction", back_populates="instalment_payments")

    def __repr__(self):
        return f'<InstalmentPayment {self.instalment_payment_id}>'
    

class Transaction(db.Model):
    __tablename__ = 'Transaction'  # Specify the table name

    transaction_id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))  # Automatically generate a unique ID
    amount = db.Column(db.Float, nullable=False)  # Amount of the transaction
    date_of_transaction = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # Date of the transaction
    status = db.Column(Enum(TransactionStatus), nullable=False)  # Assuming TransactionStatus is an enum
    fully_paid_date = db.Column(db.DateTime, nullable=True)  # Date when fully paid
    reference_no = db.Column(db.String, default="")  # Reference number, default is an empty string
    cashback_percentage = db.Column(db.Float, default=0)  # Cashback percentage, default is 0

    # Relationships
    customer_id = db.Column(db.String, db.ForeignKey('Customer.customer_id'), nullable=False)  # Foreign key to Customer
    customer = db.relationship('Customer', back_populates='transactions')  # Relationship with Customer

    instalment_payments = db.relationship('InstalmentPayment', back_populates='transaction', lazy='dynamic')  # Relationship with InstalmentPayment

    def __repr__(self):
        return f'<Transaction {self.transaction_id} - Amount: {self.amount}>'

class Customer(db.Model):
    __tablename__ = 'Customer'  # Specify the table name

    customer_id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))  # Automatically generate a unique ID
    name = db.Column(db.String, nullable=False)  # Customer's name
    profile_picture = db.Column(db.LargeBinary)  # Profile picture stored as bytes
    email = db.Column(db.String, unique=True, nullable=False)  # Unique email for the customer
    password = db.Column(db.String, nullable=False)  # Customer's password
    contact_number = db.Column(db.String, nullable=False)  # Customer's contact number
    address = db.Column(db.String, nullable=False)  # Customer's address
    date_of_birth = db.Column(db.DateTime, nullable=False)  # Customer's date of birth
    status = db.Column(Enum(CustomerStatus), nullable=False)  # Assuming Status is an enum
    wallet_balance = db.Column(db.Float, default=0)  # Wallet balance, default is 0
    credit_score = db.Column(db.Integer, default=0)  # Credit score, default is 0

    # Relationships
    transactions = db.relationship('Transaction', back_populates='customer', lazy='dynamic')  # Relationship with Transaction
    credit_tier_id = db.Column(String, ForeignKey('CreditTier.credit_tier_id'), nullable=False)
    credit_tier = relationship("CreditTier", back_populates="customers")


    def __repr__(self):
        return f'<Customer {self.name} - Email: {self.email}>'
    
class CreditTier(db.Model):
    __tablename__ = 'CreditTier'

    credit_tier_id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))
    name = db.Column(String, unique=True, nullable=False)
    min_credit_score = db.Column(Integer, nullable=False)
    max_credit_score = db.Column(Integer, nullable=False)
    credit_limit = db.Column(Integer, nullable=False)

    # Relationships
    customers = relationship("Customer", back_populates="credit_tier")