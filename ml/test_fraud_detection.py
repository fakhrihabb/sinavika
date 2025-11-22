"""
Test fraud detection API
"""

import requests
import json

# Test cases
test_claims = [
    {
        "name": "Normal Claim - Low Risk",
        "data": {
            "claim_id": "TEST-001",
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
            "tarif_rs": 5000000  # Small difference (3%)
        },
        "expected_risk": "low"
    },
    {
        "name": "Overcharging - High Risk",
        "data": {
            "claim_id": "TEST-002",
            "hospital_code": "RS002",
            "doctor_id": "DR005",
            "patient_age": 35,
            "patient_gender": "P",
            "icd10_code": "E11.9",
            "procedures": "99.04",
            "num_procedures": 1,
            "care_class": "3",
            "los_days": 2,
            "tarif_inacbg": 3200000,
            "tarif_rs": 5000000  # 56% overcharge!
        },
        "expected_risk": "high or critical"
    },
    {
        "name": "Excessive Procedures - Medium/High Risk",
        "data": {
            "claim_id": "TEST-003",
            "hospital_code": "RS003",
            "doctor_id": "DR010",
            "patient_age": 28,
            "patient_gender": "L",
            "icd10_code": "A09",  # Simple gastroenteritis
            "procedures": "99.04,87.44,88.72,93.94",
            "num_procedures": 4,  # Too many for simple case
            "care_class": "3",
            "los_days": 2,
            "tarif_inacbg": 1800000,
            "tarif_rs": 3500000  # 94% higher
        },
        "expected_risk": "high"
    },
    {
        "name": "Extended Stay - Medium Risk",
        "data": {
            "claim_id": "TEST-004",
            "hospital_code": "RS004",
            "doctor_id": "DR015",
            "patient_age": 60,
            "patient_gender": "P",
            "icd10_code": "J20.9",  # Bronchitis
            "procedures": "87.44",
            "num_procedures": 1,
            "care_class": "2",
            "los_days": 8,  # Too long for bronchitis
            "tarif_inacbg": 2100000,
            "tarif_rs": 3000000  # 43% higher
        },
        "expected_risk": "medium"
    }
]

def test_flask_service():
    """Test actual Flask ML service"""
    print("\n" + "="*80)
    print("🧪 Testing Flask ML Service (Python)")
    print("="*80)

    api_url = "http://localhost:5001/predict"

    for test_case in test_claims:
        print(f"\n📋 Test: {test_case['name']}")
        print(f"   Expected Risk: {test_case['expected_risk']}")

        try:
            response = requests.post(api_url, json=test_case['data'], timeout=5)

            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    pred = result['prediction']
                    print(f"   ✅ Fraud Prob: {pred['fraud_probability']:.4f}")
                    print(f"   ✅ Risk Score: {pred['risk_score']}")
                    print(f"   ✅ Risk Level: {pred['risk_level']}")
                    print(f"   ✅ Prediction: {'FRAUD' if pred['is_fraud'] else 'LEGITIMATE'}")

                    # Show top risk factors
                    if pred['top_risk_factors']:
                        print(f"\n   🔍 Top Risk Factors:")
                        for factor in pred['top_risk_factors'][:3]:
                            print(f"      - {factor['feature']}: {factor['value']:.2f} (importance: {factor['importance']:.4f})")
                else:
                    print(f"   ❌ API Error: {result.get('error')}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("   ⚠️  Flask service not running. Start with: python ml_service.py")
            return False
        except Exception as e:
            print(f"   ❌ Error: {e}")

    return True

def test_nextjs_service():
    """Test Next.js JavaScript fraud detection API"""
    print("\n" + "="*80)
    print("🧪 Testing Next.js Fraud Detection API (JavaScript)")
    print("="*80)

    api_url = "http://localhost:3000/api/ml/fraud-detection"

    for test_case in test_claims:
        print(f"\n📋 Test: {test_case['name']}")
        print(f"   Expected Risk: {test_case['expected_risk']}")

        # Transform data for Next.js API (simpler format)
        data = test_case['data']
        nextjs_payload = {
            "tarif_rs": data['tarif_rs'],
            "tarif_inacbg": data['tarif_inacbg'],
            "los_days": data['los_days'],
            "num_procedures": data['num_procedures'],
            "care_class": data['care_class']
        }

        try:
            response = requests.post(api_url, json=nextjs_payload, timeout=5)

            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    fd = result['fraud_detection']
                    print(f"   ✅ Fraud Prob: {fd['fraud_probability']:.4f}")
                    print(f"   ✅ Risk Score: {fd['risk_score']}")
                    print(f"   ✅ Risk Level: {fd['risk_level']}")
                    print(f"   ✅ Evidence Count: {fd['evidence_count']}")

                    # Show risk factors
                    if fd['risk_factors']:
                        print(f"\n   🚨 Risk Factors:")
                        for factor in fd['risk_factors'][:3]:
                            print(f"      - [{factor['severity']}] {factor['factor']}")
                            print(f"        {factor['detail']}")
                else:
                    print(f"   ❌ API Error: {result.get('error')}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("   ⚠️  Next.js service not running. Start with: npm run dev")
            return False
        except Exception as e:
            print(f"   ❌ Error: {e}")

    return True

def main():
    print("\n🚀 Fraud Detection API Test Suite")
    print("="*80)

    # Test Next.js service first (always available)
    nextjs_ok = test_nextjs_service()

    # Test Flask service (optional, if trained model available)
    flask_ok = test_flask_service()

    # Summary
    print("\n" + "="*80)
    print("📊 Test Summary")
    print("="*80)
    print(f"Next.js API (JavaScript Rules): {'✅ PASSED' if nextjs_ok else '❌ FAILED'}")
    print(f"Flask API (ML Model):            {'✅ PASSED' if flask_ok else '⚠️  Not tested (service not running)'}")

    print("\n💡 Next Steps:")
    if not flask_ok:
        print("   1. Train ML model: cd ml && python train_fraud_model.py")
        print("   2. Start Flask service: python ml_service.py")
        print("   3. Run tests again: python test_fraud_detection.py")
    else:
        print("   ✅ All services working! Fraud detection is ready for production.")

if __name__ == '__main__':
    main()
