// utilserver/firebaseAdmin.js

const admin = require('firebase-admin');
const path = require('path');

// Variabel untuk menampung instance Firestore
let db;

try {
  // Cek apakah variabel GOOGLE_CREDENTIALS_JSON ada (untuk produksi di Railway)
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    console.log("Initializing Firebase Admin with credentials from environment variable...");
    
    // Ambil string JSON dari environment variable
    const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

    // Inisialisasi Firebase jika belum ada
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK for Production initialized successfully.");
    }
  } else {
    // Fallback untuk development lokal (membaca dari file)
    console.log("GOOGLE_CREDENTIALS_JSON not found. Initializing Firebase Admin with local file...");
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath); // Lebih mudah pakai require

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK for Local Dev initialized successfully.");
    }
  }

  // Setelah inisialisasi, ambil instance Firestore
  db = admin.firestore();

} catch (error) {
    console.error("❌ FATAL: Failed to initialize Firebase Admin SDK:", error);
    // Hentikan proses jika Firebase gagal diinisialisasi, karena aplikasi tidak bisa berjalan.
    process.exit(1); 
}

// Ekspor hanya 'db' agar bisa digunakan di file lain
module.exports = { db };
