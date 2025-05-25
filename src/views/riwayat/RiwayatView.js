export default async function RiwayatView() {
  const storedData = JSON.parse(localStorage.getItem("catatan") || "[]");

  const data = storedData.length > 0 ? storedData : mockData;
  const currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  let isListView = false;
  let allData = [...data];
  let filteredData = [...data];

  function getDataByDate() {
    const dataByDate = {};
    filteredData.forEach((item) => {
      const dateKey = formatDateKey(item.tanggal);
      if (dateKey) {
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = [];
        }
        dataByDate[dateKey].push(item);
      }
    });
    return dataByDate;
  }

  function formatDateKey(dateString) {
    if (!dateString) return null;

    let date;
    if (dateString.includes(",")) {
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

      const parts = dateString.split(",")[1]?.trim().split(" ");
      if (parts && parts.length === 3) {
        const [tanggal, namaBulan, tahun] = parts;
        const bulan = bulanMap[namaBulan.toLowerCase()];
        if (bulan) {
          return `${tahun}-${bulan}-${tanggal.padStart(2, "0")}`;
        }
      }
    } else {
      date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      }
    }

    return null;
  }

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
      excited: "🤩",
    };
    return moodMap[mood?.toLowerCase()] || "📝";
  }

  function generateCalendar(month, year) {
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

    const dataByDate = getDataByDate();

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
        moodIcons = uniqueMoods
          .slice(0, 3)
          .map((mood) => getMoodIcon(mood))
          .join("");
        if (uniqueMoods.length > 3) moodIcons += "...";
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
                ? `<div class="text-xs absolute top-0 right-0 p-1" title="${dayData.length} catatan">${moodIcons}</div>`
                : ""
            }
          </button>
        </div>
      `;
    }

    calendar += "</div></div>";
    return calendar;
  }

  function generateListView() {
    if (filteredData.length === 0) {
      return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div class="p-4 border-b dark:border-gray-600">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Daftar Catatan</h3>
          </div>
          <div class="p-8 text-center text-gray-500 dark:text-gray-400">
            <i class="fas fa-search text-4xl mb-4"></i>
            <p>Tidak ada catatan yang ditemukan</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div class="p-4 border-b dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
            Daftar Catatan (${filteredData.length} items)
          </h3>
        </div>
        <div id="listContainer" class="divide-y divide-gray-200 dark:divide-gray-600">
          ${filteredData
            .map(
              (item, index) => `
            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors catatan-item cursor-pointer" 
                 onclick="viewSingleEntry(${index})" 
                 data-mood="${item.mood}" 
                 data-date="${formatDateKey(item.tanggal)}">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">${getMoodIcon(item.mood)}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-300">
                      ${
                        item.tanggal.includes(",")
                          ? item.tanggal
                          : new Date(item.tanggal).toLocaleDateString("id-ID", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                      }
                    </span>
                  </div>
                  <p class="text-gray-800 dark:text-white line-clamp-2">
                    ${item.catatan || "Tidak ada catatan"}
                  </p>
                  ${
                    item.aktivitas && item.aktivitas.length > 0
                      ? `
                    <div class="mt-2 flex flex-wrap gap-1">
                      ${item.aktivitas
                        .slice(0, 3)
                        .map(
                          (activity) => `
                        <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                          ${activity}
                        </span>
                      `
                        )
                        .join("")}
                      ${
                        item.aktivitas.length > 3
                          ? `<span class="text-xs text-gray-500">+${
                              item.aktivitas.length - 3
                            } lainnya</span>`
                          : ""
                      }
                    </div>
                  `
                      : ""
                  }
                </div>
                <div class="ml-4 flex flex-col items-end">
                  <button class="text-blue-500 hover:text-blue-700 text-sm">
                    <i class="fas fa-eye"></i> Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

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

  function filterData() {
    const searchTerm =
      document.getElementById("searchInput")?.value.toLowerCase() || "";
    const moodFilter = document.getElementById("moodFilter")?.value || "";
    const monthFilter = document.getElementById("monthFilter")?.value || "";

    console.log("Filter values:", { searchTerm, moodFilter, monthFilter }); 

    filteredData = allData.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        (item.catatan && item.catatan.toLowerCase().includes(searchTerm)) ||
        (item.aktivitas &&
          item.aktivitas.some((act) => act.toLowerCase().includes(searchTerm)));

      const matchesMood =
        !moodFilter || item.mood?.toLowerCase() === moodFilter.toLowerCase();

      let matchesMonth = true;
      if (monthFilter) {
        const dateKey = formatDateKey(item.tanggal);
        if (dateKey) {
          const month = dateKey.split("-")[1];
          matchesMonth = month === monthFilter;
        } else {
          matchesMonth = false;
        }
      }

      const result = matchesSearch && matchesMood && matchesMonth;
      console.log(
        `Item: ${item.catatan?.substring(
          0,
          30
        )}... - Search: ${matchesSearch}, Mood: ${matchesMood}, Month: ${matchesMonth}, Result: ${result}`
      ); 

      return result;
    });

    console.log(`Filtered data: ${filteredData.length} items`); // Debug log

    if (isListView) {
      document.getElementById("listView").innerHTML = generateListView();
    } else {
      document.getElementById("calendarView").innerHTML = generateCalendar(
        currentMonth,
        currentYear
      );
    }

    updateStats();
  }

  function updateStats() {
    const totalElement = document.querySelector('[data-stat="total"]');
    if (totalElement) {
      totalElement.textContent = filteredData.length;
    }

    const positiveElement = document.querySelector('[data-stat="positive"]');
    if (positiveElement) {
      const positiveCount = filteredData.filter((item) =>
        ["senang", "happy", "cinta", "love", "excited"].includes(
          item.mood?.toLowerCase()
        )
      ).length;
      positiveElement.textContent = positiveCount;
    }
  }

  const setupGlobalFunctions = () => {
    const searchInput = document.getElementById("searchInput");
    const moodFilter = document.getElementById("moodFilter");
    const monthFilter = document.getElementById("monthFilter");

    if (searchInput) {
      searchInput.addEventListener("input", debounce(filterData, 300));
    }

    if (moodFilter) {
      moodFilter.addEventListener("change", filterData);
    }

    if (monthFilter) {
      monthFilter.addEventListener("change", filterData);
    }

    window.toggleView = function () {
      isListView = !isListView;
      const calendarView = document.getElementById("calendarView");
      const listView = document.getElementById("listView");
      const toggleButton = document.getElementById("viewToggle");

      if (isListView) {
        calendarView.classList.add("hidden");
        listView.classList.remove("hidden");
        listView.innerHTML = generateListView();
        toggleButton.innerHTML =
          '<i class="fas fa-calendar"></i><span>Calendar View</span>';
      } else {
        calendarView.classList.remove("hidden");
        listView.classList.add("hidden");
        calendarView.innerHTML = generateCalendar(currentMonth, currentYear);
        toggleButton.innerHTML =
          '<i class="fas fa-list"></i><span>List View</span>';
      }
    };

    window.changeMonth = function (direction) {
      currentMonth += direction;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      document.getElementById("calendarView").innerHTML = generateCalendar(
        currentMonth,
        currentYear
      );
    };

    window.viewSingleEntry = function (index) {
      const entry = filteredData[index];
      if (entry) {
        localStorage.setItem("selectedEntry", JSON.stringify(entry));
        location.hash = "/hasil";
      }
    };

    window.showDayDetails = function (dateKey) {
      const dayEntries = filteredData.filter((item) => {
        const itemDateKey = formatDateKey(item.tanggal);
        return itemDateKey === dateKey;
      });

      if (dayEntries.length > 0) {
        if (dayEntries.length === 1) {
          localStorage.setItem("selectedEntry", JSON.stringify(dayEntries[0]));
          location.hash = "/hasil";
        } else {
          alert(`${dayEntries.length} catatan ditemukan pada tanggal ini`);
          localStorage.setItem("selectedEntry", JSON.stringify(dayEntries[0]));
          location.hash = "/hasil";
        }
      } else {
        alert("Tidak ada catatan pada tanggal ini.");
      }
    };

    filterData();
  };

  setTimeout(setupGlobalFunctions, 100);

  return `
    <section class="p-6 max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <i class="fas fa-calendar-alt"></i>
          <span>Riwayat Catatan</span>
        </h2>
        <div class="flex items-center space-x-3">
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input type="text" id="searchInput" placeholder="Cari catatan atau aktivitas..."
                class="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <svg class="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          <div class="flex gap-2">
            <select id="moodFilter"
              class="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Mood</option>
              <option value="senang">😊 Senang</option>
              <option value="sedih">😢 Sedih</option>
              <option value="biasa">😐 Biasa</option>
              <option value="marah">😠 Marah</option>
              <option value="takut">😰 Takut</option>
              <option value="cinta">💖 Cinta</option>
            </select>
            <select id="monthFilter"
              class="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div id="calendarView">${generateCalendar(
        currentMonth,
        currentYear
      )}</div>

      <!-- List View -->
      <div id="listView" class="hidden"></div>
      </div>
    </section>
  `;
}
