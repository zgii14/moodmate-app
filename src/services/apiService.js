import CONFIG from "../config";
// asynchronous function to call the backend API for mood prediction
const ApiService = {
  async makeRequest(endpoint, options = {}) {
    const sessionId = localStorage.getItem("moodmate-session-id");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (sessionId) {
      headers["x-session-id"] = sessionId;
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return { success: false, message: "Tidak dapat terhubung ke server." };
    }
  },

  // Fungsi untuk menyimpan data sesi setelah login berhasil
  setSessionData(sessionId, user) {
    localStorage.setItem("moodmate-session-id", sessionId);
    localStorage.setItem("moodmate-current-user", JSON.stringify(user));
    localStorage.setItem("moodmate-logged-in", "true");
  },

  // Endpoint untuk Login
  async login({ email, password }) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Endpoint untuk Register
  async register({ name, email, password }) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  // Endpoint untuk Logout
  async logout() {
    await this.makeRequest("/auth/logout", { method: "POST" });
    localStorage.removeItem("moodmate-session-id");
    localStorage.removeItem("moodmate-current-user");
    localStorage.removeItem("moodmate-logged-in");
  },

  async predictMood(text) {
    try {
      const sessionId = localStorage.getItem("moodmate-session-id"); // Ambil sessionId
      console.log("Session ID yang dikirim ke backend:", sessionId);

      const response = await fetch(`${CONFIG.BASE_URL}/predict-mood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId, // Tambahkan header ini
        },
        credentials: "include",
        body: JSON.stringify({ text }),
      });

      console.log("Backend API Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend API Response:", data);

      let moodName = null;

      if (data.label_name) {
        moodName = data.label_name.toLowerCase();
      } else if (data.mood) {
        moodName = data.mood.toLowerCase();
      } else if (data.label_index !== undefined) {
        const indexToMood = {
          0: "happy",
          1: "sad",
          2: "anger",
          3: "fear",
          4: "neutral",
          5: "love",
        };
        moodName = indexToMood[data.label_index] || "neutral";
      }

      if (!moodName) moodName = "neutral";

      return {
        mood: moodName,
        confidence: data.confidence ? Math.round(data.confidence) : 85,
        error: null,
      };
    } catch (error) {
      console.error("Backend API Error:", error);
      return {
        mood: null,
        error: {
          message: `Gagal menghubungi service: ${error.message}`,
          type: "connection_error",
        },
      };
    }
  },
  async getProfile() {
    const sessionId = localStorage.getItem("moodmate-session-id");
    const response = await fetch(
      "https://backend-moodmate.up.railway.app/api/auth/profile",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
      }
    );
    return await response.json();
  },
  async checkServerHealth() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/health`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        return data.status === "OK";
      }
      return false;
    } catch (error) {
      console.log("ML Server is not running:", error.message);
      return false;
    }
  },
};

export default ApiService;
