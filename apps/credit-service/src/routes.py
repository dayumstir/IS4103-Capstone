from flask import Blueprint, request, jsonify
from models import db
from service import get_payment_history, get_credit_utilisation_ratio, preprocess, predict, extract_payment_history_and_credit_utilisation_ratio_from_report, extract_payment_history_and_credit_utilisation_ratio_from_cci
from repository import update_customer_credit_rating, get_lowest_credit_tier
import os 

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
        return jsonify({"credit_score": credit_score}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/admin-update-credit-rating", methods=["POST"])
def admin_update_credit_rating():
    try:
        data = request.get_json()
        credit_utilisation_ratio = data.get("creditUtilisationRatio")
        payment_history = data.get("paymentHistory")
        X = preprocess(credit_utilisation_ratio, payment_history)
        credit_score = int(predict(X)[0])
        return jsonify({"credit_score": credit_score}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/upload-cci", methods=["POST"])
def upload_cci():
    try:
        files = request.files['file']
        file_path = os.path.join("../", files.filename)
        files.save(file_path)
        return jsonify({"message": files.filename + " uploaded successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/get-first-credit-rating", methods=["POST"])
def get_first_credit_rating():
    credit_rating = 0
    try:
        data = request.form
        customer_id = data.get("customer_id")
        if customer_id == "" or customer_id is None:
            return jsonify({"error": "customer_id is required"}), 401

        payment_history = []
        credit_utilisation_ratio = 0

        # Check if user past payment history is provided
        if len(request.files)==0:
            containsCCI = False
            file_path = "../"
            for filename in os.listdir("../"):
                if "CONSUMER-CREDIT-INDEX" in filename:
                    file_path += filename
                    containsCCI =  True
            if not containsCCI:
                return jsonify({"error": "No Consumer Credit Index found"}), 400
            
            payment_history , credit_utilisation_ratio = extract_payment_history_and_credit_utilisation_ratio_from_cci(file_path) # Most recent 6 months
            X = preprocess(credit_utilisation_ratio, payment_history)
            credit_rating = predict(X)
            credit_tier = get_lowest_credit_tier(db)
            credit_rating = min(credit_rating[0],credit_tier.max_credit_score)
        else:
            for file in request.files.values():
                payment_history,  credit_utilisation_ratio = extract_payment_history_and_credit_utilisation_ratio_from_report(file) # Most recent 6 months
            X = preprocess(credit_utilisation_ratio, payment_history)
            credit_rating = predict(X)[0]

        update_customer_credit_rating(db, customer_id, credit_rating)
       
        return jsonify({"credit_score": int(credit_rating)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500