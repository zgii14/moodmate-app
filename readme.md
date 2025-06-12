# MoodMate Project

MoodMate adalah aplikasi untuk prediksi mood berbasis teks menggunakan teknologi Machine Learning. Proyek ini terdiri dari tiga komponen utama: Frontend (Vanilla.js), Backend API (Node.js dengan Hapi.js), dan ML API (Python dengan FastAPI).

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Backend API    │───▶│    ML API       │
│ (Vanilla.js)    │    │   (Hapi.js)      │    │   (Python)      │
│ Port: 8080      │    │   Port: 9000     │    │   Port: 8000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Pastikan Anda telah menginstal:

- **Node.js** (v14+ recommended)
- **npm** atau **yarn**
- **Python** (v3.8+ recommended)
- **pip** (Python package manager)

## 📋 Available Endpoints:
   - Health Check: GET /api/health
   - Register: POST /api/auth/register
   - Login: POST /api/auth/login
   - Profile: GET /api/auth/profile
   - Update Profile: PUT /api/auth/profile
   - Change Password: PUT /api/auth/change-password
   - Logout: POST /api/auth/logout
   - Upload Profile Photo: PUT /api/auth/profile-photo
   - Delete Profile Photo: DELETE /api/auth/profile-photo
   - Predict Mood: POST /api/predict-mood
   - Create Journal: POST /api/journal
   - Get Journals: GET /api/journal
   - Get Journal by ID: GET /api/journal/{id}
   - Update Journal: PUT /api/journal/{id}
   - Delete Journal: DELETE /api/journal/{id}
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
│   ├── requirements.txt
│   └── venv/              # Virtual environment
├── src/                   # Frontend source
├── dist/                  # Frontend build output
├── config.js              # Frontend configuration
├── webpack.dev.js         # Webpack dev config
└── package.json           # Frontend dependencies
```

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
