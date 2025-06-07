import CONFIG from "../config";
// asynchronous function to call the backend API for mood prediction
const ApiService = {
  async login(email, password) {
    const response = await fetch(
      "https://backend-moodmate.up.railway.app/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    const data = await response.json();
    if (data.success) {
      // Simpan sessionId dan user ke localStorage
      localStorage.setItem("moodmate-session-id", data.data.sessionId);
      localStorage.setItem("moodmate-current-user", data.data.user.email);
    }
    return data;
  },
  async register(name, email, password) {
    const response = await fetch(
      "https://backend-moodmate.up.railway.app/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }
    );
    return await response.json();
  },
  async logout() {
    const sessionId = localStorage.getItem("moodmate-session-id");
    await fetch("https://backend-moodmate.up.railway.app/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
    });
    localStorage.removeItem("moodmate-session-id");
    localStorage.removeItem("moodmate-current-user");
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
