# BurnoutCheck

A React + FastAPI app that predicts burnout risk from daily work and lifestyle patterns using classical machine learning.

**Live demo:** [https://burnout-prediction.vercel.app/](https://burnout-prediction.vercel.app/)

> ⚠️ BurnoutCheck is an educational ML project. It is not a medical or psychological diagnosis tool.

---

## Final results (deployed model)

The deployed model is a **Soft Voting Ensemble** trained with tuned hyperparameters on **9 numeric features** (the 10th, `commits_per_day`, was dropped after a wrapper feature-selection experiment).

| Metric | Value |
|---|---:|
| Test F1 Macro | **0.8035** |
| Test Accuracy | **0.8076** |
| Per-class F1 (Low / Medium / High) | 0.78 / 0.82 / 0.82 |
| Confusion matrix — extreme errors (Low ↔ High) | 0 |
| Latency (local, p95) | < 35 ms |

F1 Macro is the headline metric because each burnout category matters equally. The model is not allowed to "cheat" by always predicting the majority Medium class.

---

## Why this exists

Burnout is hard to notice early. Workload, sleep, screen time, and recovery habits drift unhealthily over weeks before any symptom is named.

BurnoutCheck turns those daily patterns into a simple risk estimate:

```text
Low / Medium / High burnout risk + per-class probabilities
```

The goal is not to replace professional assessment. The goal is to show a complete classical-ML workflow that is understandable, testable, and deployable:

- exploratory data analysis
- leakage-safe preprocessing pipeline
- baseline training across 5 model families
- hyperparameter tuning (RandomizedSearchCV)
- wrapper-based feature selection
- soft-voting ensemble
- FastAPI backend + React frontend
- live deployment on Vercel + Hugging Face Spaces
- responsible-AI disclaimer

---

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS | deployed on **Vercel**
- **Backend:** FastAPI, Uvicorn, joblib | deployed on **Hugging Face Spaces** (Docker)
- **ML:** scikit-learn ≥ 1.3, pandas, NumPy
- **Base models:** Logistic Regression, SVM, Random Forest, Gaussian Naive Bayes, KNN
- **Ensemble:** Soft Voting (equal weights)

---

## Project structure

```text
burnout-prediction/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── models/
│   ├── final_model.pkl
│   ├── soft_voting_ensemble.pkl
│   ├── logistic_regression.pkl
│   ├── svm.pkl
│   ├── random_forest.pkl
│   ├── naive_bayes.pkl
│   ├── knn.pkl
│   ├── feature_columns.json      # 9-feature deployment order
│   └── model_metadata.json       # all reported metrics
├── dataset.csv                   # raw 7,000-row dataset
├── dataset_preprocessed.csv      # EDA reference (not used for training)
├── preprocess.ipynb              # EDA + filter feature selection
├── model.ipynb                   # training + tuning + wrapper selection
├── Dockerfile                    # backend image for HF Spaces
├── render.yaml                   # alternative deployment config
└── README.md
```

---

## Getting started

### 1. Clone

```bash
git clone https://github.com/Jerome-88/Burnout-prediction.git
cd Burnout-prediction
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`. Verify:

```bash
curl http://localhost:8000/api/health
```

### 3. Frontend

In a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/*` to the backend.

---

## How it works

```text
Daily work + lifestyle inputs (9 fields)
        ↓
sklearn Pipeline   (median imputer → standard scaler → classifier)
        ↓
Per-base-model class probabilities
        ↓
Soft Voting Ensemble (averages probabilities, equal weight)
        ↓
Final risk: Low / Medium / High  +  confidence  +  full breakdown
```

### Input features (9)

| Group | Features |
|---|---|
| Demographics       | `age`, `experience_years` |
| Workload           | `daily_work_hours`, `meetings_per_day` |
| Recovery           | `sleep_hours`, `exercise_hours` |
| Lifestyle          | `caffeine_intake`, `screen_time` |
| Engineering output | `bugs_per_day` |

### Dropped features (2)

| Feature | Why dropped |
|---|---|
| `stress_level`     | Filter step (EDA): correlation 0.90 with target → target leakage |
| `commits_per_day`  | Wrapper step (model.ipynb): correlation ≈ -0.01, lowest RF importance (~0.006). Dropping it lifts ensemble F1 by ~0.7 pts |

### Target

```text
burnout_level ∈ { Low (0), Medium (1), High (2) }
```

> ⚠️ The backend reads the exact inference feature order from `models/feature_columns.json` at startup. If you retrain with a different feature set, that file must match, otherwise the model receives misaligned inputs and silently produces bad predictions.

---

## Modeling methodology

Performed in `model.ipynb` (sections 1–16).

| Step | Tool / Setting |
|---|---|
| Hold-out split          | `train_test_split(test_size=0.2, random_state=42, stratify=y)` → 5,488 train / 1,372 test |
| Cross-validation        | `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`, scoring = `f1_macro` |
| Hyperparameter tuning   | `RandomizedSearchCV(n_iter=40)` per base model |
| Feature selection (wrapper) | Empirical comparison: 10 vs 9 vs 8 vs 7 features. 9 wins |
| Final ensemble          | `VotingClassifier(voting="soft")` over the 5 tuned base models |
| Reproducibility         | `RANDOM_STATE = 42` everywhere |

### Per-model test results (deployed config)

| Model | Test F1 Macro | Test Accuracy |
|---|---:|---:|
| **Soft Voting Ensemble** | **0.8035** | **0.8076** |
| Random Forest         | 0.7707 | 0.7770 |
| Logistic Regression   | 0.7766 | 0.7733 |
| KNN                   | 0.7611 | 0.7726 |
| SVM                   | 0.7754 | 0.7719 |
| Naive Bayes           | 0.7627 | 0.7675 |

The ensemble wins because each base model is biased in a predictable but opposite direction (LR/SVM push toward Low/High. KNN/RF collapse into Medium. Naive Bayes stays balanced). Averaging cancels the biases.

---

## API reference

Base URL (local): `http://localhost:8000`

### `GET /api/health`

Returns backend status and the deployed model configuration.

```bash
curl http://localhost:8000/api/health
```

Response includes: `models_loaded`, `missing_models`, `feature_order`, `final_model`.

### `POST /api/predict`

Returns predictions from every loaded model plus the ensemble.

**Request body** (all fields required):

| Field | Type | Range |
|---|---:|---:|
| `age`              | number | 18 – 65 |
| `experience_years` | number | 0 – 40  |
| `daily_work_hours` | number | 1 – 24  |
| `sleep_hours`      | number | 3 – 24  |
| `caffeine_intake`  | number | 0 – 10  |
| `bugs_per_day`     | number | 0 – 30  |
| `meetings_per_day` | number | 0 – 15  |
| `screen_time`      | number | 1 – 24  |
| `exercise_hours`   | number | 0 – 24  |

**Example:**

```json
{
  "age": 28,
  "experience_years": 4,
  "daily_work_hours": 9,
  "sleep_hours": 6,
  "caffeine_intake": 3,
  "bugs_per_day": 7,
  "meetings_per_day": 4,
  "screen_time": 10,
  "exercise_hours": 1
}
```

**Response shape:**

```json
{
  "Soft Voting Ensemble": {
    "prediction": "Medium",
    "confidence": 0.78,
    "probabilities": { "Low": 0.12, "Medium": 0.78, "High": 0.10 }
  },
  "Logistic Regression": { "...": "..." },
  "SVM":                 { "...": "..." },
  "Random Forest":       { "...": "..." },
  "Naive Bayes":         { "...": "..." },
  "KNN":                 { "...": "..." },
  "_meta": {
    "latency_ms": 42.7,
    "feature_order": [ "age", "experience_years", "..." ],
    "model_version": "tuned_9f"
  }
}
```

---

## Deployment

### Frontend — Vercel

`frontend/` is deployed at [burnout-prediction.vercel.app](https://burnout-prediction.vercel.app/).

Set the backend URL via Vercel environment variable:

```bash
VITE_API_BASE_URL=https://<your-hf-space>.hf.space
```

The frontend reads it from `import.meta.env.VITE_API_BASE_URL`. If unset, it falls back to the local Vite proxy at `/api/*`.

### Backend — Hugging Face Spaces (Docker)

`Dockerfile` at the repo root builds the backend image and exposes port 7860 (HF Spaces default). To deploy:

1. Create a new Space → SDK = **Docker**.
2. Push the repo (the Dockerfile is detected automatically).
3. Set `ALLOWED_ORIGINS` Space secret to your Vercel domain, e.g.:

```text
https://burnout-prediction.vercel.app,http://localhost:5173
```

### Alternative — Render

`render.yaml` is included as an alternative deployment config.

### CORS

The backend reads allowed origins from the `ALLOWED_ORIGINS` env var (comma-separated). Defaults to `http://localhost:5173,http://localhost:3000` for local development.

---

## Retraining the model

```text
preprocess.ipynb   →  EDA + filter feature selection (drop stress_level)
model.ipynb        →  baseline training + tuning + wrapper FS + final save
```

Recommended flow:

1. Open `preprocess.ipynb`, inspect data quality, run all cells.
2. Open `model.ipynb`, run all cells (sections 1–16).
3. Section 16 ("Save Final Models") refits every model with tuned hyperparameters on 9 features, rebuilds the ensemble, and writes:
   - `models/*.pkl`
   - `models/feature_columns.json`
   - `models/model_metadata.json` (test metrics, per-class reports, confusion matrices)
4. Restart the backend so it reloads the new artifacts.

> ⚠️ The backend loads model files only at startup. After re-training, restart the FastAPI process (or redeploy the Hugging Face Space).

### Model file size

The Random Forest + Voting Ensemble pickles can exceed 100 MB uncompressed (GitHub's per-file hard limit). Two mitigations are already applied in `model.ipynb`:

- `joblib.dump(..., compress=3)` on every save → typically 3–6× smaller
- Bounded RF hyperparameters in tuning (`min_samples_leaf >= 2`)

If your repo still hits the limit, add `models/*.pkl` to `.gitignore` and regenerate locally on each clone.

---

## Frontend behavior

1. User fills the burnout-risk form (9 inputs).
2. React POSTs to `/api/predict`.
3. FastAPI runs all 5 base models + the ensemble in parallel (`ThreadPoolExecutor`) and returns predictions, probabilities, and latency.
4. The UI shows:
   - final risk category
   - confidence score
   - probability distribution (Low / Medium / High bars)
   - model-by-model breakdown
   - measured latency
   - responsible-AI disclaimer

UI style: glassmorphism with a dynamic background that shifts based on the predicted risk level.

---

## Limitations

- **Self-reported inputs.** Users enter their own numbers (sleep, exercise, and caffeine are systematically noisy.)
- **Snapshot prediction.** Burnout develops gradually -> one-time inputs cannot capture trajectory.
- **No clinical validation.** Labels are not based on established instruments (MBI, OLBI). Output is educational, not diagnostic.
- **Synthetic-looking dataset.** Narrow ranges, near-uniform distributions, zero outliers | may not generalize to real organizational data.
- **Free-tier deployment.** Hugging Face Space free tier auto-sleeps, need to be restarted from cold start if inactive for long period of time. Subsequent requests p95 ≈ +100 ms.

---

## Common issues

### Backend not running

```bash
cd backend
uvicorn main:app --reload
```

### Frontend cannot reach backend

Check backend is up at `http://localhost:8000/api/health`, then restart `npm run dev`.

### Model files missing

The backend expects these inside `models/`:

```text
final_model.pkl
soft_voting_ensemble.pkl
feature_columns.json
model_metadata.json
```

If missing, rerun `model.ipynb` end-to-end.

---

## Contributors

| Name | Role |
|---|---|
| Dzaky Rizha Anargya       | EDA · Modeling · Analysis · Frontend · PPT |
| Jerome Maxcellino Budianto  | Idea · EDA · Modeling · Analysis · Deployment · PPT |
| Randy Salim                | User Testing · PPT |
| Rizal Dermawan Wally       |  |

Group 1 | LF01 | COMP6577001 Machine Learning

---

## License

Educational project. Dataset sourced from Kaggle ([asifxzaman/developer-burnout-prediction](https://www.kaggle.com/datasets/asifxzaman/developer-burnout-prediction)) under the dataset's license. Code released as-is for academic review.
