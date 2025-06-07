const Hapi = require("@hapi/hapi");
const Bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const { db } = require("./utilserver/firebaseAdmin.js"); // Pastikan ini sudah benar

let users = [];
let journalEntries = [];
let idCounter = 1;

// Helper
const generateId = () => `id_${Date.now()}_${idCounter++}`;
const getCurrentDate = () => new Date().toISOString();
const generateSessionId = () =>
  `firestore_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Firestore Session Helpers
const SESSION_COLLECTION = "sessions";

// Simpan session ke Firestore
async function saveSessionToFirestore(sessionId, sessionData) {
  await db.collection(SESSION_COLLECTION).doc(sessionId).set(sessionData);
}

// Ambil session dari Firestore
async function getSessionFromFirestore(sessionId) {
  const docSnap = await db.collection(SESSION_COLLECTION).doc(sessionId).get();
  return docSnap.exists ? docSnap.data() : null;
}

// Hapus session dari Firestore
async function deleteSessionFromFirestore(sessionId) {
  await db.collection(SESSION_COLLECTION).doc(sessionId).delete();
}

// Load data users & journals dari Firestore (bukan session)
const loadData = async () => {
  try {
    const userSnapshot = await db.collection("users").get();

    // PERBAIKAN: Kita mengambil data DAN ID dokumennya
    users = userSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    const journalSnapshot = await db.collection("journals").get();
    journalEntries = journalSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    console.log(
      `✅ Successfully loaded ${users.length} users and ${journalEntries.length} journals.`
    );

    // Update idCounter supaya tetap unik
    const allIds = [
      ...users.map((u) => u.id),
      ...journalEntries.map((j) => j.id),
    ];
    if (allIds.length > 0) {
      const maxId = Math.max(
        ...allIds.map((id) => {
          if (typeof id === "string") {
            const match = id.match(/id_\d+_(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }
          return 0;
        })
      );
      idCounter = maxId + 1;
    }
  } catch (error) {
    console.error("❌ Error loading data from Firestore:", error);
  }
};

// Simpan users ke Firestore (Fungsi ini mungkin tidak lagi diperlukan jika registrasi langsung ke DB)
const saveUsers = async () => {
  try {
    for (const user of users) {
      // Menggunakan email sebagai ID dokumen agar konsisten dengan frontend
      await db
        .collection("users")
        .doc(user.email)
        .set(
          {
            ...user,
            updatedAt: getCurrentDate(),
          },
          { merge: true }
        );
    }
    console.log("✅ Users state saved to Firestore");
  } catch (error) {
    console.error("❌ Error saving users to Firestore:", error);
  }
};

// Simpan journals ke Firestore
const saveJournals = async () => {
  try {
    for (const journal of journalEntries) {
      await db
        .collection("journals")
        .doc(journal.id)
        .set({
          ...journal,
          updatedAt: getCurrentDate(),
        });
    }
    console.log("✅ Journals saved to Firestore");
  } catch (error) {
    console.error("❌ Error saving journals to Firestore:", error);
  }
};
// Tambahkan di atas/before: const init = async () => {
// Session validator (ambil dari Firestore)
const validateSession = async (request) => {
  const sessionId = request.headers["x-session-id"];
  if (!sessionId) return null;
  const session = await getSessionFromFirestore(sessionId);
  console.log(
    "SessionId diterima:",
    sessionId,
    "Session ditemukan?",
    !!session
  );
  return session;
};
const init = async () => {
  await loadData();

  const server = Hapi.server({
    port: process.env.PORT || 9000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"], // Mengizinkan semua origin untuk development
        credentials: true,
        headers: [
          "Accept",
          "Content-Type",
          "If-None-Match",
          "X-Session-ID",
          "x-session-id",
        ],
        exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
        additionalExposedHeaders: ["Accept"],
        maxAge: 60,
        additionalHeaders: ["cache-control", "x-requested-with"],
      },
    },
  });

  // Health check

  // Health check
  server.route({
    method: "GET",
    path: "/api/health",
    handler: (request, h) => ({
      status: "OK",
      message: "MoodMate Auth API is running",
      timestamp: getCurrentDate(),
    }),
  });

  // Register
  server.route({
    method: "POST",
    path: "/api/auth/register",
    handler: async (request, h) => {
      try {
        const { name, email, password } = request.payload;

        const userRef = db.collection("users").doc(email);
        const docSnap = await userRef.get();

        if (docSnap.exists) {
          return h
            .response({ success: false, message: "Email sudah terdaftar" })
            .code(409);
        }

        const hashedPassword = await Bcrypt.hash(password, 10);

        const newUser = {
          name,
          email,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await userRef.set(newUser);

        // Menambahkan user baru ke array lokal agar konsisten tanpa perlu reload
        users.push({ ...newUser, id: email });

        return h
          .response({ success: true, message: "User berhasil didaftarkan" })
          .code(201);
      } catch (error) {
        console.error("!!! FATAL ERROR in /api/auth/register handler:", error);
        return h
          .response({
            success: false,
            message: "Terjadi kesalahan internal pada server.",
          })
          .code(500);
      }
    },
  });

  // Login
  // Ganti handler login Anda yang lama dengan yang ini
  // Login
  server.route({
    method: "POST",
    path: "/api/auth/login",
    handler: async (request, h) => {
      try {
        const { email, password } = request.payload;
        console.log(`[LOGIN] - Attempting login for email: ${email}`);

        const userRef = db.collection("users").doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          console.error(`[LOGIN] - Failure: User not found for email ${email}`);
          return h
            .response({ success: false, message: "Email atau password salah" })
            .code(401);
        }

        const userData = userDoc.data();
        console.log(`[LOGIN] - User found. Comparing password for ${email}...`);

        const isPasswordValid = await Bcrypt.compare(
          password,
          userData.password
        );

        if (!isPasswordValid) {
          console.error(
            `[LOGIN] - Failure: Invalid password for email ${email}`
          );
          return h
            .response({ success: false, message: "Email atau password salah" })
            .code(401);
        }

        const sessionId = generateSessionId();
        const sessionData = {
          userId: userDoc.id, // ID Dokumen adalah email
          email: userData.email,
          createdAt: getCurrentDate(),
        };
        await saveSessionToFirestore(sessionId, sessionData);

        console.log(`[LOGIN] - Success for email: ${email}`);

        return h
          .response({
            success: true,
            message: "Login berhasil",
            data: {
              sessionId: sessionId,
              user: {
                id: userDoc.id,
                name: userData.name,
                email: userData.email,
              },
            },
          })
          .header("X-Session-ID", sessionId);
      } catch (error) {
        console.error("!!! FATAL ERROR in /api/auth/login handler:", error);
        return h
          .response({
            success: false,
            message: "Terjadi kesalahan internal pada server.",
          })
          .code(500);
      }
    },
  });

  // Logout
  server.route({
    method: "POST",
    path: "/api/auth/logout",
    handler: async (request, h) => {
      const sessionId = request.headers["x-session-id"];
      if (sessionId) {
        await deleteSessionFromFirestore(sessionId);
      }
      return h
        .response({ success: true, message: "Logout berhasil" })
        .code(200);
    },
  });
  // Profile
  server.route({
    method: "GET",
    path: "/api/auth/profile",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session) {
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);
        }

        const userRef = db.collection("users").doc(session.email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          return h
            .response({ success: false, message: "User tidak ditemukan" })
            .code(404);
        }
        const userData = userDoc.data();

        return {
          success: true,
          message: "Profil berhasil diambil",
          data: {
            user: {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            },
          },
        };
      } catch (error) {
        console.error("!!! FATAL ERROR in /api/auth/profile handler:", error);
        return h
          .response({
            success: false,
            message: "Terjadi kesalahan internal pada server.",
          })
          .code(500);
      }
    },
  });

  server.route({
    method: "GET",
    path: "/api/auth/profile",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session) {
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);
        }

        // --- PERBAIKAN: Ambil data user langsung dari Firestore, bukan dari memori ---
        console.log(
          `[PROFILE] - Fetching profile for user ID/email: ${session.userId}`
        );

        // session.userId seharusnya berisi email pengguna
        const userRef = db.collection("users").doc(session.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          console.error(
            `[PROFILE] - Failure: User document not found for ID ${session.userId}`
          );
          return h
            .response({ success: false, message: "Data user tidak ditemukan" })
            .code(404);
        }

        const userData = userDoc.data();

        console.log(`[PROFILE] - Success: Profile found for ${session.userId}`);

        // Kirim kembali data yang bersih (tanpa password hash)
        return {
          success: true,
          message: "Profil berhasil diambil",
          data: {
            user: {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            },
          },
        };
      } catch (error) {
        console.error("!!! FATAL ERROR in /api/auth/profile handler:", error);
        return h
          .response({
            success: false,
            message: "Terjadi kesalahan internal pada server.",
          })
          .code(500);
      }
    },
  });

  server.route({
    method: "PUT",
    path: "/api/auth/change-password",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session) {
          return h
            .response({
              success: false,
              message: "Session tidak valid",
            })
            .code(401);
        }

        const userIndex = users.findIndex((u) => u.id === session.userId);
        if (userIndex === -1) {
          return h
            .response({
              success: false,
              message: "User tidak ditemukan",
            })
            .code(404);
        }

        const { currentPassword, newPassword } = request.payload;

        if (!currentPassword || currentPassword.trim().length === 0) {
          return h
            .response({
              success: false,
              message: "Password saat ini harus diisi",
            })
            .code(400);
        }

        if (!newPassword || newPassword.trim().length === 0) {
          return h
            .response({
              success: false,
              message: "Password baru harus diisi",
            })
            .code(400);
        }

        if (newPassword.length < 6) {
          return h
            .response({
              success: false,
              message: "Password baru minimal 6 karakter",
            })
            .code(400);
        }

        if (newPassword.length > 100) {
          return h
            .response({
              success: false,
              message: "Password baru maksimal 100 karakter",
            })
            .code(400);
        }

        const isCurrentPasswordValid = await Bcrypt.compare(
          currentPassword,
          users[userIndex].password
        );

        if (!isCurrentPasswordValid) {
          return h
            .response({
              success: false,
              message: "Password saat ini salah",
            })
            .code(400);
        }

        const isSamePassword = await Bcrypt.compare(
          newPassword,
          users[userIndex].password
        );

        if (isSamePassword) {
          return h
            .response({
              success: false,
              message: "Password baru tidak boleh sama dengan password lama",
            })
            .code(400);
        }

        const hashedNewPassword = await Bcrypt.hash(newPassword, 10);

        users[userIndex] = {
          ...users[userIndex],
          password: hashedNewPassword,
          updatedAt: getCurrentDate(),
        };

        await saveUsers();

        return {
          success: true,
          message: "Password berhasil diubah",
          data: {
            updatedAt: users[userIndex].updatedAt,
          },
        };
      } catch (error) {
        console.error("Change password error:", error);
        return h
          .response({
            success: false,
            message: "Gagal mengubah password",
          })
          .code(500);
      }
    },
  });

  server.route({
    method: "POST",
    path: "/api/journal",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session)
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);

        const { catatan, mood, aktivitas, detailAktivitas } = request.payload;
        if (!catatan || !mood)
          return h
            .response({ success: false, message: "Input tidak lengkap" })
            .code(400);

        const newJournalEntry = {
          userId: session.userId, // Menyimpan ID user yang membuat jurnal
          catatan,
          mood,
          aktivitas: aktivitas || [],
          detailAktivitas: detailAktivitas || {},
          createdAt: getCurrentDate(),
          updatedAt: getCurrentDate(),
        };

        const docRef = await db.collection("journals").add(newJournalEntry);

        return h
          .response({
            success: true,
            message: "Jurnal berhasil dibuat",
            data: { id: docRef.id, ...newJournalEntry },
          })
          .code(201);
      } catch (error) {
        console.error("!!! ERROR in /api/journal POST:", error);
        return h
          .response({ success: false, message: "Terjadi kesalahan internal" })
          .code(500);
      }
    },
  });

  // MENDAPATKAN SEMUA JURNAL PENGGUNA
  server.route({
    method: "GET",
    path: "/api/journal",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session)
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);

        const journalSnapshot = await db
          .collection("journals")
          .where("userId", "==", session.userId)
          .orderBy("createdAt", "desc")
          .get();

        const journals = journalSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return h.response({
          success: true,
          message: "Jurnal berhasil diambil",
          data: journals,
          total: journals.length,
        });
      } catch (error) {
        console.error("!!! ERROR in /api/journal GET:", error);
        return h
          .response({ success: false, message: "Terjadi kesalahan internal" })
          .code(500);
      }
    },
  });

  // MENDAPATKAN JURNAL SPESIFIK BERDASARKAN ID
  server.route({
    method: "GET",
    path: "/api/journal/{id}",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session)
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);

        const journalId = request.params.id;
        const journalRef = db.collection("journals").doc(journalId);
        const docSnap = await journalRef.get();

        if (!docSnap.exists) {
          return h
            .response({ success: false, message: "Jurnal tidak ditemukan" })
            .code(404);
        }

        const journalData = docSnap.data();
        // Pemeriksaan keamanan: pastikan user hanya bisa mengakses jurnal miliknya
        if (journalData.userId !== session.userId) {
          return h
            .response({ success: false, message: "Akses ditolak" })
            .code(403);
        }

        return h.response({
          success: true,
          data: { id: docSnap.id, ...journalData },
        });
      } catch (error) {
        console.error(`!!! ERROR in /api/journal/{id} GET:`, error);
        return h
          .response({ success: false, message: "Terjadi kesalahan internal" })
          .code(500);
      }
    },
  });

  // MENDAPATKAN JURNAL SPESIFIK BERDASARKAN ID
  server.route({
    method: "GET",
    path: "/api/journal/{id}",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session)
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);

        const journalId = request.params.id;
        const journalRef = db.collection("journals").doc(journalId);
        const docSnap = await journalRef.get();

        if (!docSnap.exists) {
          return h
            .response({ success: false, message: "Jurnal tidak ditemukan" })
            .code(404);
        }

        const journalData = docSnap.data();
        // Pemeriksaan keamanan: pastikan user hanya bisa mengakses jurnal miliknya
        if (journalData.userId !== session.userId) {
          return h
            .response({ success: false, message: "Akses ditolak" })
            .code(403);
        }

        return h.response({
          success: true,
          data: { id: docSnap.id, ...journalData },
        });
      } catch (error) {
        console.error(`!!! ERROR in /api/journal/{id} GET:`, error);
        return h
          .response({ success: false, message: "Terjadi kesalahan internal" })
          .code(500);
      }
    },
  });
  // MENGHAPUS JURNAL
  server.route({
    method: "DELETE",
    path: "/api/journal/{id}",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session)
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);

        const journalId = request.params.id;
        const journalRef = db.collection("journals").doc(journalId);
        const docSnap = await journalRef.get();

        if (!docSnap.exists) {
          return h
            .response({ success: false, message: "Jurnal tidak ditemukan" })
            .code(404);
        }

        // Pemeriksaan keamanan
        if (docSnap.data().userId !== session.userId) {
          return h
            .response({ success: false, message: "Akses ditolak" })
            .code(403);
        }

        await journalRef.delete();

        return h.response({
          success: true,
          message: "Jurnal berhasil dihapus",
        });
      } catch (error) {
        console.error(`!!! ERROR in /api/journal/{id} DELETE:`, error);
        return h
          .response({ success: false, message: "Terjadi kesalahan internal" })
          .code(500);
      }
    },
  });

  // Predict Mood
  server.route({
    method: "POST",
    path: "/api/predict-mood",
    handler: async (request, h) => {
      try {
        const session = await validateSession(request);
        if (!session) {
          return h
            .response({ success: false, message: "Session tidak valid" })
            .code(401);
        }

        console.log("Received prediction request:", request.payload);

        const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
        const mlResponse = await fetch(`${mlApiUrl}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: request.payload.text }),
        });

        const result = await mlResponse.json();
        if (!mlResponse.ok) {
          const errorMessage = result.detail || "ML service returned an error";
          throw new Error(errorMessage);
        }

        return result;
      } catch (error) {
        console.error("Prediction error:", error);
        return h
          .response({
            success: false,
            message: `Prediction failed: ${error.message}`,
          })
          .code(500);
      }
    },
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log("\nGraceful shutdown initiated...");
    try {
      await saveUsers();
      await saveJournals();
      console.log("All data saved successfully");
      await server.stop();
      console.log("Server stopped");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  };
  await server.start();
  console.log("✅ Backend server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err);
  process.exit(1);
});

init();
