from __future__ import annotations

import json
import os
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="BurnoutCheck API",
    description="Classical Machine Learning API for burnout risk prediction.",
    version="1.0.0",
)

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
METADATA_PATH = MODEL_DIR / "model_metadata.json"
FEATURE_PATH = MODEL_DIR / "feature_columns.json"

DEFAULT_FEATURE_COLS = [
    "age",
    "experience_years",
    "daily_work_hours",
    "sleep_hours",
    "caffeine_intake",
    "bugs_per_day",
    "commits_per_day",
    "meetings_per_day",
    "screen_time",
    "exercise_hours",
]
DEFAULT_LABELS = ["Low", "Medium", "High"]


def load_json(path: Path, fallback):
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return fallback


MODEL_METADATA = load_json(METADATA_PATH, {})
FEATURE_COLS: List[str] = load_json(FEATURE_PATH, DEFAULT_FEATURE_COLS)
LABELS: List[str] = MODEL_METADATA.get("labels", DEFAULT_LABELS)

MODEL_FILES = {
    "Final Model": "final_model",
    "Soft Voting Ensemble": "soft_voting_ensemble",
    "Logistic Regression": "logistic_regression",
    "SVM": "svm",
    "Random Forest": "random_forest",
    "Naive Bayes": "naive_bayes",
    "KNN": "knn",
}

models: Dict[str, object] = {}
missing_models: List[str] = []

for name, fname in MODEL_FILES.items():
    path = MODEL_DIR / f"{fname}.pkl"
    if path.exists():
        models[name] = joblib.load(path)
    else:
        missing_models.append(name)

if not models:
    raise RuntimeError("No model files were found. Train the models first and save them in the models/ directory.")

_executor = ThreadPoolExecutor(max_workers=len(models))


class InputData(BaseModel):
    age: float = Field(..., ge=18, le=65, description="User age in years")
    experience_years: float = Field(..., ge=0, le=40, description="Years of work/programming experience")
    daily_work_hours: float = Field(..., ge=1, le=24, description="Average daily work hours")
    sleep_hours: float = Field(..., ge=3, le=24, description="Average daily sleep hours")
    caffeine_intake: float = Field(..., ge=0, le=10, description="Average caffeine cups per day")
    bugs_per_day: float = Field(..., ge=0, le=30, description="Average bugs handled per day")
    meetings_per_day: float = Field(..., ge=0, le=15, description="Average meetings per day")
    screen_time: float = Field(..., ge=1, le=24, description="Average total screen time per day")
    exercise_hours: float = Field(..., ge=0, le=24, description="Average exercise hours per day")


def _softmax(x: np.ndarray) -> np.ndarray:
    values = np.asarray(x, dtype=float)
    exp_values = np.exp(values - np.max(values))
    return exp_values / exp_values.sum()


def _get_model_classes(model) -> np.ndarray:
    if hasattr(model, "classes_"):
        return model.classes_
    if hasattr(model, "named_steps"):
        final_step = list(model.named_steps.values())[-1]
        if hasattr(final_step, "classes_"):
            return final_step.classes_
    return np.array(range(len(LABELS)))


def _align_proba_to_labels(model, proba: np.ndarray) -> np.ndarray:
    classes = list(_get_model_classes(model))
    aligned = np.zeros(len(LABELS), dtype=float)
    for idx, class_value in enumerate(classes):
        aligned[int(class_value)] = float(proba[idx])
    return aligned


def get_proba(model, X: np.ndarray) -> np.ndarray:
    """Return probabilities aligned to LABELS order: Low, Medium, High."""
    if hasattr(model, "predict_proba"):
        raw_proba = model.predict_proba(X)[0]
    elif hasattr(model, "decision_function"):
        raw_proba = _softmax(model.decision_function(X)[0])
    else:
        prediction = int(model.predict(X)[0])
        raw_proba = np.zeros(len(LABELS), dtype=float)
        raw_proba[prediction] = 1.0
    return _align_proba_to_labels(model, raw_proba)


def format_prediction(model_name: str, proba: np.ndarray) -> dict:
    pred_idx = int(np.argmax(proba))
    return {
        "model": model_name,
        "prediction": LABELS[pred_idx],
        "confidence": round(float(proba[pred_idx]) * 100, 1),
        "probabilities": {
            LABELS[i]: round(float(proba[i]) * 100, 1) for i in range(len(LABELS))
        },
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "models_loaded": list(models.keys()),
        "missing_models": missing_models,
        "feature_columns": FEATURE_COLS,
        "final_model_from_training": MODEL_METADATA.get("final_model"),
    }


def _infer(args: tuple) -> tuple[str, dict]:
    name, model, X = args
    return name, format_prediction(name, get_proba(model, X))


@app.post("/api/predict")
def predict(data: InputData):
    if not models:
        raise HTTPException(status_code=500, detail="No ML models are available.")

    start_time = time.perf_counter()
    input_dict = data.model_dump()

    try:
        X = np.array([[input_dict[col] for col in FEATURE_COLS]])
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=f"Missing required feature: {exc}") from exc

    results: dict = {}

    # The Final Model is the model selected in model_metadata.json. Individual models are still returned
    # for transparency and demo explanation.
    for name, result in _executor.map(_infer, [(n, m, X) for n, m in models.items()]):
        results[name] = result

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
    results["_meta"] = {
        "latency_ms": latency_ms,
        "feature_order": FEATURE_COLS,
        "final_model_from_training": MODEL_METADATA.get("final_model", "Not available"),
        "disclaimer": "Educational ML demonstration only. This is not a medical or psychological diagnosis.",
    }

    return results
