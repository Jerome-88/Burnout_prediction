# BurnoutCheck

A React + FastAPI app that predicts burnout risk from daily work and lifestyle patterns using classical machine learning.

> ⚠️ Note: BurnoutCheck is an educational ML project. It is not a medical or psychological diagnosis tool.

## Why this exists

Burnout can be hard to notice early, especially when workload, sleep, screen time, and recovery habits slowly become unhealthy.

This project turns those daily patterns into a simple risk estimate:

```text
Low / Medium / High burnout risk
```

The goal is not to replace professional assessment. The goal is to show a complete ML workflow that is understandable, testable, and deployable:

- data preprocessing
- model training
- model comparison
- saved inference pipeline
- FastAPI backend
- React frontend
- responsible AI disclaimer

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** FastAPI, Uvicorn
- **ML:** Scikit-learn, Pandas, NumPy, Joblib
- **Models:** Logistic Regression, SVM, Random Forest, Naive Bayes, KNN, Soft Voting Ensemble

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
│   ├── feature_columns.json
│   └── model_metadata.json
├── dataset.csv
├── dataset_preprocessed.csv
├── preprocess.ipynb
├── model.ipynb
└── README.md
```

## Getting started

### 1. Clone the project

```bash
git clone <your-repository-url>
cd burnout-prediction
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

For Windows:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at:

```text
http://localhost:8000
```

Check if the API is alive:

```bash
curl http://localhost:8000/health
```

### 3. Start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## How it works

BurnoutCheck uses a multiclass classification pipeline.

```text
Daily work and lifestyle inputs
        ↓
Saved Scikit-learn model pipelines
        ↓
Class probabilities
        ↓
Low / Medium / High burnout risk
```

The app uses these input features:

```text
age
experience_years
daily_work_hours
sleep_hours
caffeine_intake
bugs_per_day
commits_per_day
meetings_per_day
screen_time
exercise_hours
```

The target column is:

```text
burnout_level
```

The labels are:

```text
Low
Medium
High
```

`stress_level` is intentionally dropped from the final feature set because it is too close to the target and may introduce leakage-like behavior.

> ⚠️ Note: The backend reads the exact inference feature order from `models/feature_columns.json`. If you retrain the model with different features, update this file too.

## Model results

The current final model is the **Soft Voting Ensemble**.

The latest saved metadata reports:

| Model | Test F1 Macro | Test Accuracy |
|---|---:|---:|
| Soft Voting Ensemble | 0.7946 | 0.7988 |
| Logistic Regression | 0.7781 | 0.7748 |
| Naive Bayes | 0.7649 | 0.7697 |
| Random Forest | 0.7629 | 0.7711 |
| SVM | 0.7625 | 0.7587 |
| KNN | 0.7560 | 0.7690 |

F1 Macro is used as the main metric because each burnout category matters, not only the majority class.

## API reference

### `GET /health`

Returns backend status, loaded models, missing models, feature order, and final model metadata.

Example:

```bash
curl http://localhost:8000/health
```

### `POST /predict`

Returns predictions from all available models.

Request body:

| Field | Type | Range |
|---|---:|---:|
| `age` | number | 18–65 |
| `experience_years` | number | 0–40 |
| `daily_work_hours` | number | 1–24 |
| `sleep_hours` | number | 3–24 |
| `caffeine_intake` | number | 0–10 |
| `bugs_per_day` | number | 0–30 |
| `commits_per_day` | number | 0–50 |
| `meetings_per_day` | number | 0–20 |
| `screen_time` | number | 1–24 |
| `exercise_hours` | number | 0–8 |

Example:

```json
{
  "age": 22,
  "experience_years": 2,
  "daily_work_hours": 9,
  "sleep_hours": 6,
  "caffeine_intake": 3,
  "bugs_per_day": 7,
  "commits_per_day": 5,
  "meetings_per_day": 4,
  "screen_time": 10,
  "exercise_hours": 1
}
```

## Configuration

### Frontend API URL

During local development, Vite proxies frontend requests from:

```text
/api
```

to:

```text
http://localhost:8000
```

This is configured in:

```text
frontend/vite.config.js
```

For deployment, set the backend URL with:

```bash
VITE_API_BASE_URL=https://your-backend-url.com
```

The frontend reads it from:

```js
import.meta.env.VITE_API_BASE_URL
```

If no value is provided, it falls back to an empty string and uses the local Vite proxy.

### Backend CORS

The backend currently allows requests from:

```text
http://localhost:5173
http://localhost:3000
```

Update this list in `backend/main.py` if you deploy the frontend to another domain.

## Retraining the model

The training workflow is stored in the notebooks:

```text
preprocess.ipynb
model.ipynb
```

Recommended flow:

1. Open `preprocess.ipynb`.
2. Inspect the raw dataset and preprocessing steps.
3. Open `model.ipynb`.
4. Run all cells.
5. Confirm that new model files are saved into `models/`.
6. Restart the backend.

The backend loads model files only when it starts.

> ⚠️ Note: If you change the feature list, make sure `models/feature_columns.json` matches the new model input order. Wrong feature order can silently produce bad predictions.

## Frontend behavior

The frontend is built around a single prediction flow:

1. User fills the burnout risk form.
2. React sends the input to `/api/predict`.
3. FastAPI returns model predictions and probabilities.
4. The UI shows:
   - final risk category
   - confidence score
   - probability distribution
   - model-by-model breakdown
   - latency
   - responsible AI disclaimer

The UI uses a glassmorphism style with dynamic backgrounds based on the predicted risk level.

## Common issues

### Backend is not running

If the frontend shows a server error, start the backend:

```bash
cd backend
uvicorn main:app --reload
```

### Frontend cannot reach the backend

Make sure the backend is running at:

```text
http://localhost:8000
```

Then restart the frontend:

```bash
cd frontend
npm run dev
```

### Model files are missing

The backend expects model files inside:

```text
models/
```

Required files include:

```text
final_model.pkl
feature_columns.json
model_metadata.json
```

If they are missing, rerun `model.ipynb`.

## Contributing

This is a student ML project, so keep changes focused and easy to review.

Good contribution areas:

- improve form validation
- improve result explanation
- add more model diagnostics
- clean notebook markdown
- add deployment instructions
- improve accessibility

Before opening a pull request:

```bash
cd backend
python -m compileall .
```

```bash
cd frontend
npm run build
```