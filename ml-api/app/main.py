# main.py - Final Production-Ready Version

# --- 1. Imports ---
# Import semua library yang dibutuhkan
import os
import pickle
import requests
import tensorflow as tf
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import TFAutoModelForSequenceClassification, AutoTokenizer
from fastapi.middleware.cors import CORSMiddleware

# --- 2. Konfigurasi dan Variabel Global ---
# Mendefinisikan lokasi penyimpanan (cache) di dalam container agar file tidak diunduh berulang kali
CACHE_DIR = "model_cache"

# Mengambil konfigurasi dari Environment Variables yang akan kita set di Railway
# Ini adalah ID model Anda di Hugging Face Hub, contoh: "Zagiii/model_capstone"
HF_MODEL_ID = os.getenv("HF_MODEL_ID")
# Ini adalah URL lengkap ke file label_encoder.pkl Anda di Cloudflare R2
LABEL_ENCODER_URL = os.getenv("LABEL_ENCODER_URL")

# --- 3. Inisialisasi Aplikasi dan Variabel Model ---
# Inisialisasi aplikasi FastAPI dengan judul dan deskripsi
app = FastAPI(title="MoodMate ML API", description="API untuk prediksi mood berbasis teks.")

# Variabel ini akan diisi saat aplikasi startup.
# Dibuat sebagai variabel global agar bisa diakses oleh endpoint /predict.
model = None
tokenizer = None
label_encoder = None

# --- 4. Fungsi Helper untuk Mengunduh File ---
def download_file(url: str, destination: str):
    """Fungsi untuk mengunduh file dari URL dan menyimpannya ke destinasi."""
    print(f"Downloading file from {url}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Cek jika ada error HTTP (spt 404, 500)
        
        with open(destination, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✅ File downloaded successfully to {destination}.")
    except requests.exceptions.RequestException as e:
        # Menangkap error jaringan atau HTTP
        raise RuntimeError(f"Failed to download file from {url}. Error: {e}")

# --- 5. Logika Startup Aplikasi ---
@app.on_event("startup")
async def startup_event():
    """
    Fungsi ini akan dijalankan sekali saat aplikasi FastAPI pertama kali start.
    Tugasnya adalah mengunduh (jika perlu) dan memuat semua model ke memori.
    """
    global model, tokenizer, label_encoder
    
    # Pastikan direktori cache ada
    os.makedirs(CACHE_DIR, exist_ok=True)
    
    # Validasi bahwa environment variable sudah di-set di Railway
    if not HF_MODEL_ID:
        raise ValueError("Environment variable HF_MODEL_ID tidak di-set!")
    if not LABEL_ENCODER_URL:
        raise ValueError("Environment variable LABEL_ENCODER_URL tidak di-set!")
    
    # --- Memuat Model Utama dari Hugging Face Hub ---
    print(f"Loading model '{HF_MODEL_ID}' from Hugging Face Hub...")
    # Library 'transformers' akan secara otomatis mengunduh dan menyimpan model di cache_dir
    tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_ID, cache_dir=CACHE_DIR)
    model = TFAutoModelForSequenceClassification.from_pretrained(HF_MODEL_ID, cache_dir=CACHE_DIR)
    print("✅ Transformers Model & Tokenizer loaded.")

    # --- Memuat Label Encoder dari Cloudflare R2 ---
    label_encoder_path = os.path.join(CACHE_DIR, "label_encoder.pkl")
    # Cek apakah file sudah ada, jika belum, unduh terlebih dahulu
    if not os.path.exists(label_encoder_path):
        download_file(LABEL_ENCODER_URL, label_encoder_path)
        
    print(f"Loading Label Encoder from {label_encoder_path}...")
    with open(label_encoder_path, "rb") as f:
        label_encoder = pickle.load(f)
    print("✅ Label Encoder loaded.")
    print("🚀 Application startup complete. Ready to serve predictions.")

# --- 6. Middleware CORS ---
# Mengizinkan frontend untuk mengakses API ini dari domain yang berbeda
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://moodmate.up.railway.app"],  # Ganti * jadi domain frontend kamu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 7. Pydantic Model (Skema Data Input) ---
class TextRequest(BaseModel):
    """Mendefinisikan skema data yang diharapkan dari request body."""
    text: str

# --- 8. Endpoints API ---
@app.get("/health", summary="Cek status API dan model")
async def health_check():
    """Endpoint untuk health check, berguna untuk monitoring."""
    is_ready = all([model, tokenizer, label_encoder])
    return {
        "status": "OK" if is_ready else "Loading",
        "detail": "API is ready to serve predictions." if is_ready else "Model is loading, please wait."
    }

@app.post("/predict", summary="Prediksi mood dari teks")
async def predict(request: TextRequest):
    """Endpoint utama untuk melakukan prediksi mood."""
    # Memberi respon yang sesuai jika model belum selesai loading
    if not all([model, tokenizer, label_encoder]):
        raise HTTPException(status_code=503, detail="Model is not ready yet, please try again in a moment.")
    
    try:
        # Proses tokenisasi
        inputs = tokenizer(request.text, return_tensors="tf", truncation=True, padding=True, max_length=128)
        
        # Mendapatkan output dari model
        outputs = model(**inputs)
        
        # Mengolah output menjadi probabilitas dan prediksi
        probabilities = tf.nn.softmax(outputs.logits, axis=1).numpy()[0]
        predicted_index = np.argmax(probabilities)
        confidence = float(probabilities[predicted_index])
        
        # Mengubah index prediksi menjadi label mood
        mood = label_encoder.inverse_transform([predicted_index])[0]
        
        return {
            "success": True,
            "mood": mood,
            "confidence": round(confidence * 100, 2)
        }
    except Exception as e:
        # Menangkap error tak terduga saat proses prediksi
        print(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred during prediction: {e}")
