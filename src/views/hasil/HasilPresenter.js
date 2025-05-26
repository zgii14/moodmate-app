export default function JournalResultPresenter() {
  console.log("HasilPresenter initialized");

  setTimeout(() => {
    initializeResultPage();
  }, 300);

  function initializeResultPage() {
    const allData = JSON.parse(localStorage.getItem("catatan") || "[]");

    const selectedFromHistory = localStorage.getItem("selectedEntry");
    let latestEntry = null;

    if (selectedFromHistory) {
      latestEntry = JSON.parse(selectedFromHistory);
      localStorage.removeItem("selectedEntry");
    } else {
      latestEntry = allData[allData.length - 1];
    }

    if (!latestEntry) {
      location.hash = "/journal";
      return;
    }

    waitForDOMElements()
      .then(() => {
        displayResults(latestEntry);
        setupEventListeners();
      })
      .catch(() => {
        setTimeout(() => {
          displayResults(latestEntry);
          setupEventListeners();
        }, 1000);
      });
  }

  function waitForDOMElements() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20;

      const checkElements = () => {
        const requiredElements = [
          "tanggal-hasil",
          "emoji",
          "moodText",
          "moodDescription",
          "moodBox",
          "catatanPreview",
        ];

        const allElementsReady = requiredElements.every((id) => {
          const element = document.getElementById(id);
          const ready = element !== null;
          if (!ready) {
            console.log(`Element ${id} not ready yet`);
          }
          return ready;
        });

        if (allElementsReady) {
          console.log("All DOM elements are ready!");
          resolve();
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            console.warn("Some DOM elements not ready after max attempts");
            reject(new Error("DOM elements not ready"));
          } else {
            setTimeout(checkElements, 100);
          }
        }
      };

      checkElements();
    });
  }

  function displayResults(entry) {
    console.log("Displaying results for entry:", entry);

    try {
      setElementText("tanggal-hasil", entry.tanggal || "Hari ini");

      const moodData = getMoodData(entry.mood);
      console.log("Mood data:", moodData);

      setElementText("emoji", moodData.emoji);

      setElementText("moodText", moodData.text);

      setElementText("moodDescription", moodData.description);

      const moodBox = document.getElementById("moodBox");
      if (moodBox) {
        moodBox.className = `mood-result-box ${moodData.bgClass} rounded-lg p-8 mb-6`;
        console.log("Mood box class set:", moodData.bgClass);
      }

      if (entry.predictedByAI && entry.confidence) {
        const aiInfoElement = document.getElementById("aiInfo");
        if (aiInfoElement) {
          const normalizedConfidence = validateAndNormalizeConfidence(
            entry.confidence
          );
          aiInfoElement.classList.remove("hidden");
          console.log(
            "AI info displayed with normalized confidence:",
            normalizedConfidence
          );
        }
      }

      setElementText("catatanPreview", entry.catatan || "Tidak ada catatan");

      const selectedActivities = getSelectedActivities(entry);
      if (selectedActivities.length > 0) {
        displayActivities(selectedActivities);
      } else {
        console.log("No activities selected");
        hideActivitiesSection();
      }

      const confidence = validateAndNormalizeConfidence(
        entry.confidence || calculateConfidence(entry.mood, entry.catatan)
      );
      setTimeout(() => {
        animateConfidenceBar(confidence);
      }, 500);

      console.log("All results displayed successfully!");
    } catch (error) {
      console.error("Error displaying results:", error);

      setElementText("tanggal-hasil", "Hari ini");
      setElementText("emoji", "😐");
      setElementText("moodText", "Netral");
      setElementText("moodDescription", "Analisis mood tidak dapat dimuat");
      setElementText(
        "catatanPreview",
        entry.catatan || "Catatan tidak dapat dimuat"
      );
    }
  }

  function getSelectedActivities(entry) {
    console.log("Getting selected activities from entry:", entry);

    let activities = [];

    if (entry.aktivitas && Array.isArray(entry.aktivitas)) {
      activities = entry.aktivitas;
    } else if (entry.activities && Array.isArray(entry.activities)) {
      activities = entry.activities;
    } else if (
      entry.selectedActivities &&
      Array.isArray(entry.selectedActivities)
    ) {
      activities = entry.selectedActivities;
    }

    const validActivities = activities.filter(
      (activity) =>
        activity && typeof activity === "string" && activity.trim().length > 0
    );

    console.log("Valid selected activities:", validActivities);
    return validActivities;
  }

  function validateAndNormalizeConfidence(confidence) {
    console.log("Raw confidence value:", confidence, typeof confidence);

    let numConfidence =
      typeof confidence === "string" ? parseFloat(confidence) : confidence;

    // Validasi nilai
    if (isNaN(numConfidence) || numConfidence < 0) {
      console.warn("Invalid confidence value, using default 60");
      return 60;
    }

    if (numConfidence > 100) {
      console.warn("Confidence > 100, normalizing...");
      if (numConfidence > 1000) {
        return 75;
      }
      if (numConfidence <= 1000) {
        return Math.min(numConfidence / 10, 99);
      }
    }

    const finalConfidence = Math.round(numConfidence);
    console.log("Normalized confidence:", finalConfidence);

    return finalConfidence;
  }

  function setElementText(elementId, text) {
    try {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = text;
        console.log(`Set ${elementId}:`, text);
      } else {
        console.warn(`Element ${elementId} not found`);
      }
    } catch (error) {
      console.error(`Error setting ${elementId}:`, error);
    }
  }

  function displayActivities(activities) {
    const aktivitasSection = document.getElementById("aktivitasSection");
    const aktivitasTerpilih = document.getElementById("aktivitasTerpilih");

    if (aktivitasSection && aktivitasTerpilih && activities.length > 0) {
      aktivitasSection.classList.remove("hidden");
      aktivitasTerpilih.innerHTML = activities
        .map(
          (activity) =>
            `<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">${activity}</span>`
        )
        .join("");
      console.log("Activities displayed:", activities);
    }
  }

  function hideActivitiesSection() {
    const aktivitasSection = document.getElementById("aktivitasSection");
    if (aktivitasSection) {
      aktivitasSection.classList.add("hidden");
    }
  }

  function animateConfidenceBar(confidence) {
    const confidenceBar = document.getElementById("confidenceBar");
    const confidenceText = document.getElementById("confidenceText");

    if (confidenceBar && confidenceText) {
      const safeConfidence = Math.min(Math.max(confidence, 0), 100);

      confidenceBar.style.width = safeConfidence + "%";
      confidenceText.textContent = `${safeConfidence}% akurat berdasarkan analisis`;
      console.log(
        "Confidence bar animated with safe value:",
        safeConfidence + "%"
      );
    }
  }

  function setupEventListeners() {
    console.log("Setting up event listeners");

    // Share button
    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", handleShare);
      console.log("Share button listener added");
    }
  }

  function handleShare() {
    const moodTextElement = document.getElementById("moodText");
    const moodText = moodTextElement
      ? moodTextElement.textContent
      : "mood tidak diketahui";
    const shareText = `Hari ini aku merasa ${moodText}! 😊 #MoodMate #JournalHarian`;

    if (navigator.share) {
      navigator.share({
        title: "Mood Hari Ini",
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        showNotification("Teks mood berhasil disalin!", "success");
      });
    }
  }

  function getMoodData(mood) {
    console.log("Getting mood data for:", mood);

    const moodMap = {
      anger: {
        emoji: "😠",
        text: "Marah",
        description: "Kamu sedang kesal. Coba tarik napas dan tenangkan diri.",
        bgClass:
          "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
      },
      happy: {
        emoji: "😊",
        text: "Senang",
        description: "Hari yang menyenangkan! Kamu terlihat bahagia dan puas.",
        bgClass:
          "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20",
      },
      sad: {
        emoji: "😢",
        text: "Sedih",
        description:
          "Hari yang menyedihkan. Tidak apa-apa untuk merasa sedih, besok akan lebih baik.",
        bgClass:
          "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      },
      fear: {
        emoji: "😰",
        text: "Takut",
        description:
          "Kamu merasa cemas atau takut. Ingat bahwa ini akan berlalu.",
        bgClass:
          "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      },
      neutral: {
        emoji: "😐",
        text: "Netral",
        description:
          "Hari yang biasa saja. Tidak apa-apa, besok bisa lebih baik!",
        bgClass:
          "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
      },
      love: {
        emoji: "💖",
        text: "Penuh Cinta",
        description:
          "Harimu dipenuhi dengan cinta dan kasih sayang. Betapa indahnya!",
        bgClass:
          "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
      },
    };

    let normalizedMood = "neutral";
    if (mood && typeof mood === "string") {
      normalizedMood = mood.trim().toLowerCase();
    }

    const result = moodMap[normalizedMood] || moodMap["neutral"];

    console.log("Mood mapping result:", result);
    console.log("Used mood key:", mood, "normalized:", normalizedMood);

    return result;
  }

  function calculateConfidence(mood, catatan) {
    if (!catatan) return 60;

    const words = catatan.toLowerCase().split(" ").length;

    const moodKeywords = {
      happy: [
        "senang",
        "bahagia",
        "ceria",
        "gembira",
        "puas",
        "bangga",
        "lega",
        "bersyukur",
      ],
      sad: [
        "sedih",
        "kecewa",
        "terpuruk",
        "murung",
        "hancur",
        "putus asa",
        "menyedihkan",
      ],
      anger: [
        "marah",
        "kesal",
        "jengkel",
        "benci",
        "geram",
        "dongkol",
        "sewot",
        "emosi",
      ],
      fear: [
        "takut",
        "cemas",
        "khawatir",
        "was-was",
        "panik",
        "gelisah",
        "tegang",
        "gugup",
      ],
      love: [
        "cinta",
        "sayang",
        "rindu",
        "romantis",
        "mesra",
        "kasih",
        "afeksi",
        "kencan",
        "pacaran",
      ],
      neutral: ["biasa", "normal", "standar", "lumayan", "oke", "netral"],
    };

    let matchingWords = 0;
    let relevantWords = [];

    const normalizedMood = mood ? mood.toLowerCase() : "neutral";
    if (moodKeywords[normalizedMood]) {
      relevantWords = moodKeywords[normalizedMood];
    }

    relevantWords.forEach((word) => {
      if (catatan.toLowerCase().includes(word)) matchingWords++;
    });

    const baseConfidence = 60;
    const lengthFactor = Math.min(words * 2, 20);
    const matchFactor = Math.min(matchingWords * 5, 15);

    const finalConfidence = Math.min(
      baseConfidence + lengthFactor + matchFactor,
      98
    );

    console.log("Confidence calculation:", {
      mood: normalizedMood,
      words,
      matchingWords,
      lengthFactor,
      matchFactor,
      finalConfidence,
    });

    return finalConfidence;
  }

  function adjustConfidenceBasedOnTextLength(confidence, textLength) {
    if (textLength < 10) {
      return Math.max(confidence - 15, 45);
    }
    // Teks sedang = confidence normal
    else if (textLength < 50) {
      return Math.max(confidence - 5, 55);
    } else {
      return Math.min(confidence + Math.random() * 10, 92);
    }
  }
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
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
