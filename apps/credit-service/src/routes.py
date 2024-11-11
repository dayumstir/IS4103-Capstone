from flask import Blueprint, request, jsonify
from models import db
from service import get_payment_history, get_credit_utilisation_ratio, preprocess, predict, extract_payment_history_and_credit_utilisation_ratio_from_report, extract_payment_history_and_credit_utilisation_ratio_from_cci
from repository import update_customer_credit_rating

bp = Blueprint('main', __name__)



@bp.route("/update-credit-rating", methods=["POST"])
def update_credit_rating():
    try:
        data = request.get_json()
        customer_id = data.get("customer_id")

        payment_history = get_payment_history(db, customer_id) # Most recent 6 months
        credit_utilisation_ratio = get_credit_utilisation_ratio(customer_id)
        X = preprocess(credit_utilisation_ratio, payment_history)
        credit_score = predict(X)
        credit_score = int(credit_score[0])
        update_customer_credit_rating(db, customer_id, credit_score)
        return jsonify({"credit_rating": credit_score}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/get-first-credit-rating", methods=["POST"])
def get_first_credit_rating():
    try:
        payment_history = []
        credit_utilisation_ratio = 0
        # Check if user past payment history is provided
        if len(request.files)==0:
            file_path = "../CONSUMER-CREDIT-INDEX-Q2-2024.pdf"
            payment_history , credit_utilisation_ratio = extract_payment_history_and_credit_utilisation_ratio_from_cci(file_path) # Most recent 6 months
        else:
            for file in request.files.values():
                payment_history,  credit_utilisation_ratio = extract_payment_history_and_credit_utilisation_ratio_from_report(file) # Most recent 6 months
        

        X = preprocess(credit_utilisation_ratio, payment_history)
        credit_rating = predict(X)
        return jsonify({"credit_rating": credit_rating[0]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500