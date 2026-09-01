import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

def train_and_save_model():
    csv_path = os.path.join(os.path.dirname(__file__), "data", "Carbon_Emission.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"Loaded dataset with {len(df)} rows and {len(df.columns)} columns.")

    # Fill missing Vehicle Type (which is NaN for walk/bicycle/public transport) with 'None'
    df['Vehicle Type'] = df['Vehicle Type'].fillna('None')

    # Features and Target
    X = df.drop(columns=['CarbonEmission'])
    y = df['CarbonEmission']

    # Categorical and Numerical column separation
    categorical_cols = X.select_dtypes(include=['object', 'string']).columns.tolist()
    numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()

    print(f"Categorical features ({len(categorical_cols)}): {categorical_cols}")
    print(f"Numeric features ({len(numeric_cols)}): {numeric_cols}")

    # Build Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', 'passthrough', numeric_cols)
        ]
    )

    # Full Model Pipeline
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
    ])

    # Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Regressor model...")
    model_pipeline.fit(X_train, y_train)

    # Evaluate Model Performance
    y_pred = model_pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n--- Model Evaluation Results ---")
    print(f"R² Score: {r2:.4f} ({r2*100:.2f}% Variance Explained)")
    print(f"Mean Absolute Error (MAE): {mae:.2f} kg CO2e")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f} kg CO2e")

    # Save Pipeline artifact
    model_dir = os.path.join(os.path.dirname(__file__), "app")
    os.makedirs(model_dir, exist_ok=True)
    model_save_path = os.path.join(model_dir, "kaggle_carbon_model.pkl")
    
    joblib.dump(model_pipeline, model_save_path)
    print(f"\nTrained model successfully saved to: {model_save_path}")

if __name__ == "__main__":
    train_and_save_model()
