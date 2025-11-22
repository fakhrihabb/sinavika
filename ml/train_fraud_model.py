"""
Train fraud detection model using Random Forest
Features: tariff ratio, LOS, procedures, provider history, etc.
"""

import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_recall_curve,
    roc_curve
)
import matplotlib.pyplot as plt
import seaborn as sns

# Configuration
RANDOM_STATE = 42
TEST_SIZE = 0.2

def load_and_prepare_data(csv_path='claims_fraud_dataset.csv'):
    """Load dataset and prepare features"""
    print("📂 Loading dataset...")
    df = pd.read_csv(csv_path)

    print(f"✅ Loaded {len(df)} records")
    print(f"📊 Fraud rate: {df['is_fraud'].mean()*100:.2f}%")

    return df

def engineer_features(df):
    """Create additional features for better prediction"""

    # Encode categorical variables
    le_hospital = LabelEncoder()
    le_doctor = LabelEncoder()
    le_icd10 = LabelEncoder()
    le_gender = LabelEncoder()
    le_care_class = LabelEncoder()

    df['hospital_encoded'] = le_hospital.fit_transform(df['hospital_code'])
    df['doctor_encoded'] = le_doctor.fit_transform(df['doctor_id'])
    df['icd10_encoded'] = le_icd10.fit_transform(df['icd10_code'])
    df['gender_encoded'] = le_gender.fit_transform(df['patient_gender'])
    df['care_class_encoded'] = le_care_class.fit_transform(df['care_class'])

    # Additional engineered features
    df['is_high_cost'] = (df['tariff_ratio'] > 1.3).astype(int)
    df['is_long_stay'] = (df['los_days'] > 5).astype(int)
    df['has_procedures'] = (df['num_procedures'] > 0).astype(int)
    df['tariff_per_day'] = df['tarif_rs'] / df['los_days']
    df['procedure_intensity'] = df['num_procedures'] / df['los_days']

    # Save encoders for later use
    encoders = {
        'hospital': le_hospital,
        'doctor': le_doctor,
        'icd10': le_icd10,
        'gender': le_gender,
        'care_class': le_care_class
    }

    return df, encoders

def select_features(df):
    """Select features for model training"""

    feature_columns = [
        # Tariff-related features (most important)
        'tariff_ratio',
        'tariff_diff_percentage',
        'tariff_difference',
        'tarif_inacbg',
        'tarif_rs',
        'tariff_per_day',

        # Clinical features
        'los_days',
        'num_procedures',
        'procedure_intensity',
        'patient_age',

        # Provider features
        'provider_claims_count',
        'provider_high_cost_rate',

        # Categorical encoded
        'hospital_encoded',
        'doctor_encoded',
        'icd10_encoded',
        'gender_encoded',
        'care_class_encoded',

        # Binary flags
        'is_high_cost',
        'is_long_stay',
        'has_procedures'
    ]

    X = df[feature_columns]
    y = df['is_fraud']

    return X, y, feature_columns

def train_model(X_train, y_train):
    """Train Random Forest Classifier"""

    print("\n🎯 Training Random Forest model...")

    # Initialize model with optimized hyperparameters
    model = RandomForestClassifier(
        n_estimators=200,         # Number of trees
        max_depth=15,             # Maximum depth
        min_samples_split=10,     # Minimum samples to split
        min_samples_leaf=5,       # Minimum samples per leaf
        max_features='sqrt',      # Features to consider for split
        class_weight='balanced',  # Handle class imbalance
        random_state=RANDOM_STATE,
        n_jobs=-1                 # Use all CPU cores
    )

    # Train model
    model.fit(X_train, y_train)

    print("✅ Model trained successfully!")

    return model

def evaluate_model(model, X_train, y_train, X_test, y_test, feature_names):
    """Evaluate model performance"""

    print("\n📊 Model Evaluation")
    print("="*60)

    # Cross-validation on training set
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
    print(f"\n🔄 Cross-Validation ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

    # Predictions
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    y_pred_proba_test = model.predict_proba(X_test)[:, 1]

    # Training metrics
    print("\n📈 Training Set Performance:")
    print(f"Accuracy: {(y_pred_train == y_train).mean():.4f}")

    # Test metrics
    print("\n📉 Test Set Performance:")
    print(f"Accuracy: {(y_pred_test == y_test).mean():.4f}")
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_pred_proba_test):.4f}")

    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred_test,
                                target_names=['Legitimate', 'Fraud'],
                                digits=4))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred_test)
    print("\n📊 Confusion Matrix:")
    print(f"True Negatives:  {cm[0, 0]}")
    print(f"False Positives: {cm[0, 1]}")
    print(f"False Negatives: {cm[1, 0]}")
    print(f"True Positives:  {cm[1, 1]}")

    # Feature Importance
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)

    print("\n🔍 Top 10 Most Important Features:")
    print(feature_importance.head(10).to_string(index=False))

    return y_pred_proba_test, feature_importance

def save_model_and_artifacts(model, encoders, feature_names, feature_importance):
    """Save trained model and artifacts"""

    print("\n💾 Saving model and artifacts...")

    # Save model
    with open('fraud_detection_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("✅ Model saved: fraud_detection_model.pkl")

    # Save encoders
    with open('label_encoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)
    print("✅ Encoders saved: label_encoders.pkl")

    # Save feature names
    with open('feature_names.pkl', 'wb') as f:
        pickle.dump(feature_names, f)
    print("✅ Feature names saved: feature_names.pkl")

    # Save feature importance
    feature_importance.to_csv('feature_importance.csv', index=False)
    print("✅ Feature importance saved: feature_importance.csv")

def main():
    """Main training pipeline"""

    print("🚀 Fraud Detection Model Training Pipeline")
    print("="*60)

    # 1. Load data
    df = load_and_prepare_data()

    # 2. Engineer features
    df, encoders = engineer_features(df)

    # 3. Select features
    X, y, feature_names = select_features(df)

    print(f"\n📊 Dataset shape: {X.shape}")
    print(f"Features: {len(feature_names)}")
    print(f"Samples: {len(X)}")

    # 4. Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y  # Maintain class distribution
    )

    print(f"\nTrain set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    print(f"Train fraud rate: {y_train.mean()*100:.2f}%")
    print(f"Test fraud rate: {y_test.mean()*100:.2f}%")

    # 5. Train model
    model = train_model(X_train, y_train)

    # 6. Evaluate model
    y_pred_proba, feature_importance = evaluate_model(
        model, X_train, y_train, X_test, y_test, feature_names
    )

    # 7. Save artifacts
    save_model_and_artifacts(model, encoders, feature_names, feature_importance)

    print("\n✅ Training pipeline completed successfully!")
    print("\nYou can now use the model for fraud detection in production.")

if __name__ == '__main__':
    main()
