# MoodMate Project

MoodMate adalah aplikasi untuk prediksi mood berbasis teks menggunakan teknologi Machine Learning. Proyek ini terdiri dari tiga komponen utama: Frontend (Vanilla JavaScript), Backend API (Node.js dengan Hapi.js), dan ML API (Python dengan FastAPI).

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Backend API    │───▶│    ML API       │
│ (Vanilla JS)    │    │   (Node.js)      │    │   (Python)      │
│ Port: 8080      │    │   Port: 9000     │    │   Port: 8000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Pastikan Anda telah menginstal:

- **Node.js** (v14+ recommended)
- **npm** atau **yarn**
- **Python** (v3.8+ recommended)
- **pip** (Python package manager)

## 🚀 Cara Menjalankan Proyek

Anda perlu membuka **3 terminal** untuk menjalankan semua komponen secara bersamaan.

### Terminal 1: Backend API Server

```bash
# Masuk ke direktori server
cd server

# Install dependencies
npm install

# Jalankan server
npm start
```

**Output yang diharapkan:**

```
🚀 MoodMate Auth API Server running on http://localhost:9000
📋 Available Endpoints:
   - Health Check: GET /api/health
   - Register: POST /api/auth/register
   - Login: POST /api/auth/login
   - Profile: GET /api/auth/profile
   - Predict Mood: POST /api/predict-mood
```

### Terminal 2: ML API Server

```bash
# Masuk ke direktori ml-api
cd ml-api

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Upgrade pip (opsional tapi disarankan)
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install tf-keras (diperlukan untuk kompatibilitas)
pip install tf-keras

# Jalankan ML API server
uvicorn app.main:app --reload --port 8080
```

**⚠️ Catatan Penting untuk ML API:**

- Jika Anda mendapat error tentang Keras 3, pastikan menjalankan: `pip install tf-keras`
- Loading model pertama kali akan memakan waktu beberapa saat
- Port default diubah ke 8080 untuk menghindari konflik

**Output yang diharapkan:**

```
INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
✅ Model loaded successfully
INFO:     Application startup complete.
```

### Terminal 3: Frontend Development Server

```bash
# Masuk ke direktori root proyek (atau direktori frontend jika terpisah)
cd moodmate

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

**Output yang diharapkan:**

```
webpack compiled successfully
Local: http://localhost:8080
```

## 🔧 Konfigurasi

### Backend Configuration

File: `server/server.js`

- **Port:** 9000

### Frontend Configuration

File: `config.js`

- **Backend URL:** `http://localhost:9000/api`
- **Default Port:** 8080

### ML API Configuration

- **Port:** 8080 (diubah dari default 8000)
- **Model Path:** `app/model`

## 📊 Testing API

### Test Backend Health Check

```bash
curl http://localhost:9000/api/health
```

### Test ML API

```bash
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"Hari ini saya sangat senang sekali"}'
```

### Test Registration

```bash
curl -X POST http://localhost:9000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📁 Struktur Proyek

```
moodmate/
├── server/                 # Backend API
│   ├── server.js          # Main server file
│   └── package.json
├── ml-api/                # ML API
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   └── model/         # Trained model files
│   ├── requirements.txt
│   └── venv/              # Virtual environment
├── src/                   # Frontend source
├── dist/                  # Frontend build output
├── config.js              # Frontend configuration
├── webpack.dev.js         # Webpack dev config
└── package.json           # Frontend dependencies
```

## 🚪 Endpoints API

### Backend API (Port 9000)

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires JWT)
- `POST /api/predict-mood` - Predict mood (requires JWT)

### ML API (Port 8080)

- `POST /predict` - Predict mood from text

## 💡 Tips Development

1. **Hot Reload**: Semua server mendukung hot reload - perubahan code akan otomatis restart server
2. **Logging**: Check console output untuk debugging
3. **Model Loading**: ML model loading memakan waktu ~10-30 detik pertama kali

## 📞 Support

Jika mengalami masalah, pastikan:

1. Semua dependencies terinstall dengan benar
2. Port tidak bentrok dengan aplikasi lain
3. Semua 3 service berjalan bersamaan
4. Check console output untuk error details
# moodMate
