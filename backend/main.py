from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

app = FastAPI(title="BurnoutCheck API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURE_COLS = [
    "age", "experience_years", "daily_work_hours", "sleep_hours",
    "caffeine_intake", "bugs_per_day", "commits_per_day",
    "meetings_per_day", "screen_time", "exercise_hours",
]
LABELS = ["Low", "Medium", "High"]
MODEL_DIR = Path(__file__).parent.parent / "models"

MODEL_FILES = {
    "Logistic Regression": "logistic_regression",
    "SVM":                 "svm",
    "Random Forest":       "random_forest",
    "Naive Bayes":         "naive_bayes",
    "KNN":                 "knn",
}

models: dict = {}
for name, fname in MODEL_FILES.items():
    p = MODEL_DIR / f"{fname}.pkl"
    if p.exists():
        models[name] = joblib.load(p)
    else:
        print(f"Warning: {p} not found — skipping {name}")


class InputData(BaseModel):
    age: float
    experience_years: float
    daily_work_hours: float
    sleep_hours: float
    caffeine_intake: float
    bugs_per_day: float
    commits_per_day: float
    meetings_per_day: float
    screen_time: float
    exercise_hours: float


def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - x.max())
    return e / e.sum()


def get_proba(model, X: pd.DataFrame) -> np.ndarray:
    """Return class probabilities. Falls back to softmax(decision_function) for SVM."""
    try:
        return model.predict_proba(X)[0]
    except AttributeError:
        return _softmax(model.decision_function(X)[0])


@app.get("/health")
def health():
    return {"status": "ok", "models": list(models.keys())}


@app.post("/predict")
def predict(data: InputData):
    X = pd.DataFrame(
        [[getattr(data, col) for col in FEATURE_COLS]],
        columns=FEATURE_COLS,
    )

    results: dict = {}
    all_proba: list = []

    for name, model in models.items():
        proba = get_proba(model, X)
        all_proba.append(proba)
        pred_idx = int(np.argmax(proba))
        results[name] = {
            "prediction":    LABELS[pred_idx],
            "confidence":    round(float(proba[pred_idx]) * 100, 1),
            "probabilities": {LABELS[i]: round(float(proba[i]) * 100, 1) for i in range(3)},
        }

    ens_proba = np.mean(all_proba, axis=0)
    ens_idx   = int(np.argmax(ens_proba))
    results["Ensemble"] = {
        "prediction":    LABELS[ens_idx],
        "confidence":    round(float(ens_proba[ens_idx]) * 100, 1),
        "probabilities": {LABELS[i]: round(float(ens_proba[i]) * 100, 1) for i in range(3)},
    }

    return results
