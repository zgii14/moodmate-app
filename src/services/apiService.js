const ApiService = {
  async predictMood(text) {
    try {
      console.log("Sending request to ML API...");
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      console.log("ML API Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("ML API Response:", data);
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

      if (!moodName) {
        moodName = "neutral";
      }

      console.log("Processed mood name:", moodName);

      return {
        mood: moodName,
        confidence: data.confidence ? Math.round(data.confidence) : 85,
        error: null,
      };
    } catch (error) {
      console.error("ML API Error:", error);
      return {
        mood: null,
        error: {
          message: `Gagal menghubungi ML service: ${error.message}`,
          type: "connection_error",
        },
      };
    }
  },

  async checkServerHealth() {
    try {
      const response = await fetch("http://127.0.0.1:8000/health", {
        method: "GET",
        timeout: 5000,
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
