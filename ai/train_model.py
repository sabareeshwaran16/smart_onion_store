import sys
import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# -----------------------------
# 1. Load dataset
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "onion_dataset.csv"

if not DATASET_PATH.exists():
    print(f"Dataset not found at {DATASET_PATH}")
    print("Run:  python dataset/generate_dataset.py  first.")
    sys.exit(1)

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully")
print("Rows:", len(df))
print("Columns:", list(df.columns))


# -----------------------------
# 2. Input features (correct column names from dataset)
# -----------------------------

features = [
    "temperature",
    "humidity",
    "gas_value",
    "storage_days"
]

X = df[features]


# -----------------------------
# 3. Prediction targets (correct column names from dataset)
# -----------------------------

targets = [
    "shelf_life_remaining",
    "rot_risk",
    "sprouting_risk",
    "spoilage_risk",
    "weight_loss_pct"
]


# -----------------------------
# 4. Create model directory
# -----------------------------

model_dir = Path(__file__).resolve().parent / "models"
model_dir.mkdir(exist_ok=True)


# -----------------------------
# 5. Train each model individually
# -----------------------------

for target in targets:

    print("\n==============================")
    print("Training:", target)
    print("==============================")

    y = df[target]

    # 80% training / 20% testing
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42
    )

    # Random Forest
    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )

    # Train
    model.fit(X_train, y_train)

    # Predict
    y_pred = model.predict(X_test)

    # Metrics
    mae = mean_absolute_error(y_test, y_pred)

    rmse = mean_squared_error(
        y_test,
        y_pred
    ) ** 0.5

    r2 = r2_score(y_test, y_pred)

    print(f"MAE  : {mae:.4f}")
    print(f"RMSE : {rmse:.4f}")
    print(f"R2   : {r2:.4f}")

    # Save model
    model_name = f"{target}_model.pkl"
    model_path = model_dir / model_name

    joblib.dump(model, model_path)

    print("Saved:", model_path)

print("\n================================")
print("ALL MODELS TRAINED SUCCESSFULLY")
print("================================")
