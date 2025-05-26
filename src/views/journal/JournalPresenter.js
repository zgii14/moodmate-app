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

export default function JournalPresenter() {
  const today = new Date();
  const tanggalElement = document.getElementById("tanggal-hari");
  if (tanggalElement) {
    tanggalElement.textContent = today.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const aktivitasList = [
    { nama: "Membaca", icon: "📖" },
    { nama: "Olahraga", icon: "🏋️" },
    { nama: "Belanja", icon: "🛒" },
    { nama: "Film", icon: "🎬" },
    { nama: "Santai", icon: "🛋️" },
    { nama: "Kencan", icon: "💖" },
    { nama: "Keluarga", icon: "👨‍👩‍👧‍👦" },
    { nama: "Menggambar", icon: "🎨" },
    { nama: "Musik", icon: "🎵" },
    { nama: "Jalan-jalan", icon: "🚶" },
    { nama: "Game", icon: "🎮" },
    { nama: "Makan sehat", icon: "🥗" },
    { nama: "Memasak", icon: "👨‍🍳" },
    { nama: "Berkebun", icon: "🌱" },
    { nama: "Yoga", icon: "🧘" },
    { nama: "Berbelanja", icon: "🛍️" },
  ];

  const container = document.getElementById("aktivitas-container");
  if (container) {
    container.innerHTML = "";

    aktivitasList.forEach((item, index) => {
      const div = document.createElement("div");
      div.innerHTML = `<span class="text-2xl mb-2 block">${item.icon}</span><span class="text-sm">${item.nama}</span>`;
      div.className =
        "cursor-pointer bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-300";

      div.setAttribute("data-activity", item.nama);
      div.setAttribute("data-selected", "false");

      div.addEventListener("click", function () {
        const isSelected = this.getAttribute("data-selected") === "true";

        if (isSelected) {
          this.classList.remove(
            "bg-blue-300",
            "dark:bg-blue-600",
            "border-blue-500",
            "scale-105"
          );
          this.classList.add("bg-gray-100", "dark:bg-gray-700");
          this.setAttribute("data-selected", "false");
        } else {
          this.classList.remove("bg-gray-100", "dark:bg-gray-700");
          this.classList.add(
            "bg-blue-300",
            "dark:bg-blue-600",
            "border-blue-500",
            "scale-105"
          );
          this.setAttribute("data-selected", "true");
        }

        console.log(
          `Activity ${item.nama} ${isSelected ? "deselected" : "selected"}`
        );
      });

      container.appendChild(div);
    });
  }

  const moodItems = document.querySelectorAll(".mood-item");
  let selectedMood = "";

  moodItems.forEach((item) => {
    item.addEventListener("click", () => {
      moodItems.forEach((m) => {
        m.classList.remove("bg-white", "shadow-lg", "scale-110");
      });
      item.classList.add("bg-white", "shadow-lg", "scale-110");
      selectedMood = item.dataset.mood;
    });
  });

  function getSelectedActivities() {
    if (!container) return [];

    const selectedDivs = container.querySelectorAll('[data-selected="true"]');
    const selectedActivities = Array.from(selectedDivs).map((div) =>
      div.getAttribute("data-activity")
    );

    console.log("Selected activities:", selectedActivities);
    return selectedActivities;
  }

  function saveJournalEntry(newEntry) {
    const data = JSON.parse(localStorage.getItem("catatan") || "[]");
    data.push(newEntry);
    localStorage.setItem("catatan", JSON.stringify(data));
    console.log("Saved journal entry:", newEntry);
  }

  document.getElementById("simpan-btn")?.addEventListener("click", async () => {
    const catatan = document.getElementById("catatan").value.trim();

    if (!catatan) {
      showNotification("Tulis catatan terlebih dahulu! 📝", "error");
      return;
    }

    const saveBtn = document.getElementById("simpan-btn");
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "Memeriksa server ML...";
    saveBtn.disabled = true;

    try {
      const isServerRunning = await ApiService.checkServerHealth();

      if (!isServerRunning) {
        showNotification(
          "❌ Server ML tidak dapat diakses! Pastikan server ML sedang berjalan di http://127.0.0.1:8000",
          "error"
        );
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        return;
      }

      saveBtn.textContent = "Menganalisis mood...";

      const { mood, confidence, error } = await ApiService.predictMood(catatan);

      if (error) {
        console.error("API Error:", error);
        showNotification(
          `❌ Gagal memprediksi mood: ${error.message}. Pastikan server ML sedang berjalan!`,
          "error"
        );
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        return;
      }

      if (!mood) {
        throw new Error("Mood prediction returned empty result");
      }

      console.log("Predicted mood:", mood, "Confidence:", confidence);
      showNotification(
        `✅ Mood berhasil diprediksi: ${mood} (${confidence}%)`,
        "success"
      );

      await saveFinalEntry(catatan, mood, confidence);
    } catch (error) {
      console.error("Error predicting mood:", error);
      showNotification(
        "❌ Terjadi kesalahan saat menghubungi server ML. Pastikan server sedang berjalan!",
        "error"
      );
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  });

  async function saveFinalEntry(catatan, mood, confidence = null) {
    const selected = getSelectedActivities();

    const tanggal = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const processedMood = mood ? mood.toLowerCase() : "neutral";

    const newEntry = {
      tanggal,
      catatan,
      aktivitas: selected,
      mood: processedMood,
      confidence,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString(),
      text: catatan,
      activities: selected,
      predictedByAI: confidence !== null,
      rawMoodData: { mood, confidence },
    };

    console.log("Final entry to save:", newEntry);
    saveJournalEntry(newEntry);

    showNotification("✅ Catatan berhasil disimpan! ✨", "success");

    const saveBtn = document.getElementById("simpan-btn");
    const originalText = "Simpan Catatan";

    setTimeout(() => {
      document.getElementById("catatan").value = "";

      const selectedDivs = container.querySelectorAll('[data-selected="true"]');
      selectedDivs.forEach((div) => {
        div.classList.remove(
          "bg-blue-300",
          "dark:bg-blue-600",
          "border-blue-500",
          "scale-105"
        );
        div.classList.add("bg-gray-100", "dark:bg-gray-700");
        div.setAttribute("data-selected", "false");
      });

      saveBtn.textContent = originalText;
      saveBtn.disabled = false;

      const savedData = JSON.parse(localStorage.getItem("catatan") || "[]");
      const lastEntry = savedData[savedData.length - 1];
      console.log("Verifying saved data before redirect:", lastEntry);

      if (lastEntry && lastEntry.timestamp === newEntry.timestamp) {
        location.hash = "/hasil";
      } else {
        console.error("Data verification failed, redirecting anyway...");
        location.hash = "/hasil";
      }
    }, 1500);
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full max-w-md ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);

    setTimeout(() => {
      notification.classList.add("translate-x-full");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}
