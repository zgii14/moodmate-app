import CONFIG from "../config";
// asynchronous function to call the backend API for mood prediction
const ApiService = {
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
