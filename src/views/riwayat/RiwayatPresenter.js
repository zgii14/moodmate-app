export default function RiwayatPresenter() {
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let originalData = [];

  function init() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", debounce(filterData, 300));
    }

    const moodFilter = document.getElementById("moodFilter");
    const monthFilter = document.getElementById("monthFilter");

    if (moodFilter) moodFilter.addEventListener("change", filterData);
    if (monthFilter) monthFilter.addEventListener("change", filterData);

    document.addEventListener("keydown", handleKeyboardShortcuts);
    if (searchInput) {
      searchInput.focus();
    }

    loadOriginalData();
  }
  function checkMoodMatch(itemMood, filterMood) {
    if (!itemMood || !filterMood) return true;

    const moodMapping = {
      senang: ["senang", "happy"],
      sedih: ["sedih", "sad"],
      marah: ["marah", "anger"],
      takut: ["takut", "fear"],
      biasa: ["biasa", "neutral"],
      cinta: ["cinta", "love"],
    };

    const normalizedItemMood = itemMood.toLowerCase();
    const normalizedFilterMood = filterMood.toLowerCase();

    console.log("Checking mood match:", {
      itemMood: normalizedItemMood,
      filterMood: normalizedFilterMood,
    }); 

    if (normalizedItemMood === normalizedFilterMood) {
      console.log("Direct mood match found"); 
      return true;
    }

    for (const [key, values] of Object.entries(moodMapping)) {
      if (
        values.includes(normalizedFilterMood) &&
        values.includes(normalizedItemMood)
      ) {
        console.log("Mapped mood match found:", key); 
        return true;
      }
    }

    console.log("No mood match found"); 
    return false;
  }

  function checkMonthMatch(itemDate, filterMonth) {
    if (!itemDate || !filterMonth) return true;

    console.log("Checking month match:", { itemDate, filterMonth }); 

    try {
      let itemMonth;

      if (itemDate.includes("-") && itemDate.split("-").length === 3) {
        const dateParts = itemDate.split("-");
        itemMonth = dateParts[1]; 
      }
      else if (itemDate.includes(",")) {
        const bulanMap = {
          januari: "01",
          februari: "02",
          maret: "03",
          april: "04",
          mei: "05",
          juni: "06",
          juli: "07",
          agustus: "08",
          september: "09",
          oktober: "10",
          november: "11",
          desember: "12",
        };

        const parts = itemDate.split(",")[1]?.trim().split(" ");
        if (parts && parts.length === 3) {
          const namaBulan = parts[1].toLowerCase();
          itemMonth = bulanMap[namaBulan] || null;
        }
      }
      else {
        const date = new Date(itemDate);
        if (!isNaN(date.getTime())) {
          itemMonth = String(date.getMonth() + 1).padStart(2, "0");
        }
      }

      // Normalize filter month to match format
      const normalizedFilterMonth = String(filterMonth).padStart(2, "0");

      console.log("Month comparison:", { itemMonth, normalizedFilterMonth }); // Debug log

      const matches = itemMonth === normalizedFilterMonth;
      console.log("Month match result:", matches); // Debug log

      return matches;
    } catch (error) {
      console.warn("Error parsing date:", itemDate, error);
      return false;
    }
  }

  // FIXED: Fungsi untuk update calendar view
  function updateCalendarView(data) {
    const calendarContainer = document.getElementById("calendarView");
    if (!calendarContainer) return;

    // Group data by date dengan handling format tanggal yang berbeda
    const dataByDate = {};
    data.forEach((item) => {
      const dateKey = normalizeDate(item.tanggal);
      if (dateKey) {
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = [];
        }
        dataByDate[dateKey].push(item);
      }
    });

    // Regenerate calendar with filtered data
    calendarContainer.innerHTML = generateCalendar(
      currentMonth,
      currentYear,
      dataByDate
    );
  }

  // ADDED: Fungsi untuk normalize tanggal ke format YYYY-MM-DD
  function normalizeDate(dateStr) {
    if (!dateStr) return null;

    try {
      // Format "YYYY-MM-DD"
      if (dateStr.includes("-") && dateStr.split("-").length === 3) {
        return dateStr;
      }

      // Format "Hari, DD Bulan YYYY"
      if (dateStr.includes(",")) {
        const bulanMap = {
          januari: "01",
          februari: "02",
          maret: "03",
          april: "04",
          mei: "05",
          juni: "06",
          juli: "07",
          agustus: "08",
          september: "09",
          oktober: "10",
          november: "11",
          desember: "12",
        };

        const parts = dateStr.split(",")[1]?.trim().split(" ");
        if (parts && parts.length === 3) {
          const [tanggal, namaBulan, tahun] = parts;
          const bulan = bulanMap[namaBulan.toLowerCase()];
          if (bulan) {
            return `${tahun}-${bulan}-${tanggal.padStart(2, "0")}`;
          }
        }
      }

      // Try parsing as Date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      return null;
    } catch (error) {
      console.warn("Error normalizing date:", dateStr, error);
      return null;
    }
  }

  // UPDATED: Fungsi untuk update list view
  function updateListView(data) {
    const listContainer = document.getElementById("listContainer");
    if (!listContainer) return;

    if (data.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-gray-500 dark:text-gray-400">
          <i class="fas fa-search text-4xl mb-4"></i>
          <p>Tidak ada catatan yang ditemukan</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = data
      .map(
        (item) => `
      <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors catatan-item" data-mood="${
        item.mood
      }" data-date="${item.tanggal}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">${getMoodIcon(item.mood)}</span>
              <span class="text-sm text-gray-500 dark:text-gray-300">${formatDisplayDate(
                item.tanggal
              )}</span>
            </div>
            <p class="text-gray-800 dark:text-white">${item.catatan}</p>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  // ADDED: Fungsi untuk format tanggal untuk display
  function formatDisplayDate(dateStr) {
    try {
      // Jika sudah dalam format yang readable, return as is
      if (dateStr.includes(",")) {
        return dateStr;
      }

      // Convert dari format YYYY-MM-DD ke format readable
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      return dateStr;
    } catch (error) {
      return dateStr;
    }
  }

  // UPDATED: Fungsi untuk generate calendar
  function generateCalendar(month, year, dataByDate = {}) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const currentDate = new Date();

    let calendar = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <button onclick="changeMonth(-1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${
            monthNames[month]
          } ${year}</h3>
          <button onclick="changeMonth(1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-2">
          ${["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
            .map(
              (d) =>
                `<div class="p-2 text-center font-medium text-gray-600 dark:text-gray-300">${d}</div>`
            )
            .join("")}
        </div>

        <div class="grid grid-cols-7 gap-1">
    `;

    for (let i = 0; i < firstDay; i++) {
      calendar += '<div class="p-2"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const dayData = dataByDate[dateKey];
      const hasData = dayData && dayData.length > 0;
      const isToday =
        day === currentDate.getDate() &&
        month === currentDate.getMonth() &&
        year === currentDate.getFullYear();

      let moodIcons = "";
      if (hasData) {
        const uniqueMoods = [...new Set(dayData.map((item) => item.mood))];
        moodIcons = uniqueMoods.map((mood) => getMoodIcon(mood)).join("");
      }

      calendar += `
        <div class="relative">
          <button 
            onclick="showDayDetails('${dateKey}')"
            class="w-full p-2 h-12 rounded-lg border transition-all duration-200 
              ${
                isToday
                  ? "bg-blue-500 text-white font-bold border-blue-600"
                  : hasData
                  ? "bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-white"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white border-gray-200 dark:border-gray-600"
              }"
          >
            <div class="text-sm">${day}</div>
            ${
              moodIcons
                ? `<div class="text-xs absolute top-0 right-0 p-1">${moodIcons}</div>`
                : ""
            }
          </button>
        </div>
      `;
    }

    calendar += "</div></div>";
    return calendar;
  }

  // FIXED: Fungsi untuk mengubah bulan - clear month filter when manually navigating
  window.changeMonth = function (direction) {
    currentMonth += direction;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    } else if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }

    // Clear month filter when manually navigating
    const monthFilter = document.getElementById("monthFilter");
    if (monthFilter) {
      monthFilter.value = "";
    }

    filterData(); // Re-apply filters after changing month
  };

  // Fungsi untuk toggle view
  window.toggleView = function () {
    const calendarView = document.getElementById("calendarView");
    const listView = document.getElementById("listView");
    const toggleButton = document.getElementById("viewToggle");

    if (calendarView && listView && toggleButton) {
      if (calendarView.classList.contains("hidden")) {
        // Switch to calendar view
        calendarView.classList.remove("hidden");
        listView.classList.add("hidden");
        toggleButton.innerHTML = `
          <i class="fas fa-list"></i>
          <span>List View</span>
        `;
        filterData(); // Apply current filters to calendar view
      } else {
        // Switch to list view
        calendarView.classList.add("hidden");
        listView.classList.remove("hidden");
        toggleButton.innerHTML = `
          <i class="fas fa-calendar-alt"></i>
          <span>Calendar View</span>
        `;
        filterData(); // Apply current filters to list view
      }
    }
  };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    if (e.key === "Escape") {
      const modal = document.getElementById("dayModal");
      if (modal && !modal.classList.contains("hidden")) {
        closeDayModal();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      toggleView();
    }
  }

  // UPDATED: Fungsi untuk menampilkan modal dengan semua catatan harian
  window.showDayDetails = function (dateKey) {
    const allData = JSON.parse(localStorage.getItem("catatan") || "[]");

    const selected = allData.filter((entry) => {
      const normalizedDate = normalizeDate(entry.tanggal);
      return normalizedDate === dateKey;
    });

    if (selected.length > 0) {
      showDayModal(dateKey, selected);
    } else {
      alert("Tidak ada catatan valid pada tanggal ini.");
    }
  };

  // Fungsi untuk menampilkan modal dengan semua catatan harian
  function showDayModal(dateKey, entries) {
    // Hapus modal yang sudah ada
    const existingModal = document.getElementById("dayModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Format tanggal untuk display
    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Buat modal HTML
    const modalHTML = `
      <div id="dayModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold mb-2">📅 Catatan Harian</h2>
                <p class="text-blue-100">${formattedDate}</p>
                <p class="text-sm text-blue-200">${
                  entries.length
                } catatan ditemukan</p>
              </div>
              <button onclick="closeDayModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                ×
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 max-h-[calc(90vh-150px)] overflow-y-auto">
            <div class="space-y-6">
              ${entries
                .map(
                  (entry, index) => `
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <span class="text-3xl">${getMoodIcon(entry.mood)}</span>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                          Catatan #${index + 1}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          ${getMoodText(entry.mood)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onclick="viewFullEntry(${JSON.stringify(entry).replace(
                        /"/g,
                        "&quot;"
                      )})"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </div>
                  
                  <div class="mb-4">
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                      ${entry.catatan || "Tidak ada catatan"}
                    </p>
                  </div>

                  ${
                    entry.aktivitas && entry.aktivitas.length > 0
                      ? `
                    <div class="mb-3">
                      <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Aktivitas:</p>
                      <div class="flex flex-wrap gap-2">
                        ${entry.aktivitas
                          .map(
                            (activity) => `
                          <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                            ${activity}
                          </span>
                        `
                          )
                          .join("")}
                      </div>
                    </div>
                  `
                      : ""
                  }

                  ${
                    entry.confidence
                      ? `
                    <div class="mt-3 pt-3 border-t dark:border-gray-600">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Tingkat Keyakinan AI:</span>
                        <span class="font-medium text-gray-800 dark:text-white">${Math.round(
                          entry.confidence
                        )}%</span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style="width: ${Math.min(
                          Math.round(entry.confidence),
                          100
                        )}%"></div>
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
            <button 
              onclick="closeDayModal()" 
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button 
              onclick="location.hash='/journal'" 
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Tulis Catatan Baru
            </button>
          </div>
        </div>
      </div>
    `;

    // Tambahkan modal ke DOM
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Prevent background scroll
    document.body.style.overflow = "hidden";
  }

  // Fungsi untuk menutup modal
  window.closeDayModal = function () {
    const modal = document.getElementById("dayModal");
    if (modal) {
      modal.remove();
      document.body.style.overflow = "auto";
    }
  };

  // Fungsi untuk melihat detail lengkap satu catatan
  window.viewFullEntry = function (entry) {
    // Simpan entry yang dipilih dan redirect ke halaman hasil
    localStorage.setItem("selectedEntry", JSON.stringify(entry));
    closeDayModal();
    location.hash = "/hasil";
  };

  // Helper function untuk mendapatkan emoji mood
  function getMoodIcon(mood) {
    const moodMap = {
      happy: "😊",
      sad: "😢",
      anger: "😠",
      fear: "😰",
      neutral: "😐",
      love: "💖",
      senang: "😊",
      sedih: "😢",
      marah: "😠",
      takut: "😰",
      biasa: "😐",
      cinta: "💖",
    };

    return moodMap[mood?.toLowerCase()] || "📝";
  }

  // Helper function untuk mendapatkan text mood
  function getMoodText(mood) {
    const moodMap = {
      happy: "Senang",
      sad: "Sedih",
      anger: "Marah",
      fear: "Takut/Cemas",
      neutral: "Netral",
      love: "Penuh Cinta",
      senang: "Senang",
      sedih: "Sedih",
      marah: "Marah",
      takut: "Takut",
      biasa: "Biasa",
      cinta: "Penuh Cinta",
    };

    return moodMap[mood?.toLowerCase()] || "Tidak Diketahui";
  }

  // Event listener untuk menutup modal dengan ESC atau klik background
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeDayModal();
    }
  });

  // Close modal when clicking background
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "dayModal") {
      closeDayModal();
    }
  });

  return {
    init,
    refreshData: () => {
      location.reload();
    },
    exportData: () => {
      const data = JSON.parse(localStorage.getItem("catatan") || "[]");
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "riwayat-catatan.json";
      link.click();
    },
  };
}
