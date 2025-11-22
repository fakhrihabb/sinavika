"""
Flask microservice for ML fraud detection
Serves predictions from trained Random Forest model

Run: python ml_service.py
API: POST http://localhost:5001/predict
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js

# Load trained model and artifacts
MODEL_PATH = 'fraud_detection_model.pkl'
ENCODERS_PATH = 'label_encoders.pkl'
FEATURES_PATH = 'feature_names.pkl'

model = None
encoders = None
feature_names = None

def load_model_artifacts():
    """Load model, encoders, and feature names"""
    global model, encoders, feature_names

    try:
        print("📂 Loading model artifacts...")

        if not os.path.exists(MODEL_PATH):
            print(f"⚠️  Model file not found: {MODEL_PATH}")
            print("⚠️  Please train the model first: python train_fraud_model.py")
            return False

        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print(f"✅ Loaded model from {MODEL_PATH}")

        with open(ENCODERS_PATH, 'rb') as f:
            encoders = pickle.load(f)
        print(f"✅ Loaded encoders from {ENCODERS_PATH}")

        with open(FEATURES_PATH, 'rb') as f:
            feature_names = pickle.load(f)
        print(f"✅ Loaded feature names from {FEATURES_PATH}")

        return True

    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'version': '1.0.0'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Fraud detection prediction endpoint

    Request body:
    {
      "claim_id": "CLM-2025-1234",
      "hospital_code": "RS001",
      "doctor_id": "DR001",
      "patient_age": 45,
      "patient_gender": "L",
      "icd10_code": "J18.9",
      "procedures": "99.04,87.44",
      "num_procedures": 2,
      "care_class": "2",
      "los_days": 3,
      "tarif_inacbg": 4850000,
      "tarif_rs": 5234000
    }
    """

    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded. Please train the model first.'
        }), 503

    try:
        data = request.get_json()

        # Validate required fields
        required_fields = [
            'hospital_code', 'doctor_id', 'icd10_code',
            'patient_gender', 'care_class', 'tarif_inacbg', 'tarif_rs'
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        # Extract and encode features
        features = prepare_features(data)

        # Make prediction
        fraud_probability = model.predict_proba([features])[0][1]  # Probability of fraud
        fraud_prediction = model.predict([features])[0]  # Binary prediction

        risk_score = int(fraud_probability * 100)
        risk_level = get_risk_level(risk_score)

        # Get feature importance for this prediction (top contributing features)
        feature_contributions = get_feature_contributions(features)

        return jsonify({
            'success': True,
            'prediction': {
                'is_fraud': bool(fraud_prediction),
                'fraud_probability': float(fraud_probability),
                'risk_score': risk_score,
                'risk_level': risk_level,
                'top_risk_factors': feature_contributions[:5],  # Top 5
                'recommendation': get_recommendation(risk_level, risk_score)
            }
        })

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def prepare_features(data):
    """Prepare feature vector from input data"""

    # Calculate derived features
    tarif_rs = float(data['tarif_rs'])
    tarif_inacbg = float(data['tarif_inacbg'])
    los_days = int(data.get('los_days', 1))
    num_procedures = int(data.get('num_procedures', 0))

    tariff_ratio = tarif_rs / tarif_inacbg if tarif_inacbg > 0 else 1.0
    tariff_difference = tarif_rs - tarif_inacbg
    tariff_diff_percentage = ((tarif_rs - tarif_inacbg) / tarif_inacbg * 100) if tarif_inacbg > 0 else 0
    tariff_per_day = tarif_rs / los_days if los_days > 0 else tarif_rs
    procedure_intensity = num_procedures / los_days if los_days > 0 else num_procedures

    # Encode categorical variables
    hospital_encoded = safe_encode(encoders['hospital'], data['hospital_code'])
    doctor_encoded = safe_encode(encoders['doctor'], data['doctor_id'])
    icd10_encoded = safe_encode(encoders['icd10'], data['icd10_code'])
    gender_encoded = safe_encode(encoders['gender'], data['patient_gender'])
    care_class_encoded = safe_encode(encoders['care_class'], data['care_class'])

    # Binary flags
    is_high_cost = int(tariff_ratio > 1.3)
    is_long_stay = int(los_days > 5)
    has_procedures = int(num_procedures > 0)

    # Build feature vector (must match training feature order!)
    features = [
        # Tariff features
        tariff_ratio,
        tariff_diff_percentage,
        tariff_difference,
        tarif_inacbg,
        tarif_rs,
        tariff_per_day,

        # Clinical features
        los_days,
        num_procedures,
        procedure_intensity,
        int(data.get('patient_age', 50)),

        # Provider features (use defaults if not provided)
        int(data.get('provider_claims_count', 1)),
        float(data.get('provider_high_cost_rate', 0.0)),

        # Encoded categoricals
        hospital_encoded,
        doctor_encoded,
        icd10_encoded,
        gender_encoded,
        care_class_encoded,

        # Binary flags
        is_high_cost,
        is_long_stay,
        has_procedures
    ]

    return features

def safe_encode(encoder, value):
    """Safely encode categorical value, return 0 if unknown"""
    try:
        return encoder.transform([value])[0]
    except:
        # Unknown category, return 0 (most common class)
        return 0

def get_feature_contributions(features):
    """Get top contributing features for this prediction"""

    # Get feature importances from trained model
    importances = model.feature_importances_

    # Combine with actual feature values
    contributions = []
    for i, (fname, fvalue, importance) in enumerate(zip(feature_names, features, importances)):
        contributions.append({
            'feature': fname,
            'value': float(fvalue),
            'importance': float(importance),
            'contribution_score': float(fvalue * importance)  # Simple heuristic
        })

    # Sort by contribution score
    contributions.sort(key=lambda x: abs(x['contribution_score']), reverse=True)

    return contributions

def get_risk_level(risk_score):
    """Determine risk level from score"""
    if risk_score >= 80:
        return 'critical'
    elif risk_score >= 60:
        return 'high'
    elif risk_score >= 40:
        return 'medium'
    else:
        return 'low'

def get_recommendation(risk_level, risk_score):
    """Get recommendation based on risk level"""
    recommendations = {
        'critical': {
            'action': 'REJECT_OR_INVESTIGATE',
            'message': f'Klaim memiliki risiko fraud sangat tinggi ({risk_score}%). Investigasi mendalam atau penolakan disarankan.',
            'priority': 'URGENT'
        },
        'high': {
            'action': 'DETAILED_REVIEW',
            'message': f'Klaim memiliki risiko fraud tinggi ({risk_score}%). Review mendetail diperlukan.',
            'priority': 'HIGH'
        },
        'medium': {
            'action': 'STANDARD_REVIEW',
            'message': f'Klaim memiliki risiko sedang ({risk_score}%). Review standar dengan perhatian.',
            'priority': 'NORMAL'
        },
        'low': {
            'action': 'APPROVE_WITH_MONITORING',
            'message': f'Klaim memiliki risiko rendah ({risk_score}%). Proses standar.',
            'priority': 'LOW'
        }
    }

    return recommendations.get(risk_level, recommendations['low'])

if __name__ == '__main__':
    print("🚀 Starting ML Fraud Detection Service")
    print("="*60)

    # Load model
    if load_model_artifacts():
        print("\n✅ Service ready!")
        print("📡 Listening on http://localhost:5001")
        print("\nEndpoints:")
        print("  GET  /health  - Health check")
        print("  POST /predict - Fraud prediction")
        print("\n" + "="*60 + "\n")

        app.run(host='0.0.0.0', port=5001, debug=False)
    else:
        print("\n❌ Failed to start service. Please train the model first:")
        print("   python train_fraud_model.py")
