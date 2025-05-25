from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import TFAutoModelForSequenceClassification, AutoTokenizer
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np

app = FastAPI()

# Setup CORS (untuk development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
try:
    model_path = "app/model"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = TFAutoModelForSequenceClassification.from_pretrained(model_path)
    with open("app/model/label_encoder_final.pkl", "rb") as f:
        label_encoder = pickle.load(f)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {str(e)}")
    raise

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict(request: TextRequest):
    try:
        # Tokenisasi teks
        inputs = tokenizer(
            request.text,
            return_tensors="tf",
            truncation=True,
            padding=True,
            max_length=128
        )
        
        # Prediksi
        outputs = model(**inputs)
        probabilities = tf.nn.softmax(outputs.logits, axis=1).numpy()[0]
        predicted_index = np.argmax(probabilities)
        confidence = float(probabilities[predicted_index])
        mood = label_encoder.inverse_transform([predicted_index])[0]
        
        return {
            "success": True,
            "mood": mood,
            "confidence": round(confidence * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "OK", "model_loaded": model is not None}