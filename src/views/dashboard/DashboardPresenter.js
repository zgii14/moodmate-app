import Chart from 'chart.js/auto';

export default function DashboardPresenter() {
  const catatan = JSON.parse(localStorage.getItem("catatan") || "[]");
  const moodToNumber = { sedih: 1, netral: 2, senang: 3 };
  const moodToIcon = { sedih: '😢', netral: '😐', senang: '😊' };
  const moodToText = { sedih: 'Sedih', netral: 'Netral', senang: 'Senang' };
  
  let currentPeriod = 7;
  let chart = null;

  const tips = [
    "Mulai hari dengan gratitude - tuliskan 3 hal yang Anda syukuri hari ini!",
    "Lakukan pernapasan dalam 5 menit untuk menenangkan pikiran.",
    "Berikan senyuman kepada orang lain, itu akan kembali kepada Anda.",
    "Luangkan waktu 10 menit untuk berjalan di luar ruangan.",
    "Dengarkan musik favorit Anda untuk meningkatkan mood.",
    "Hubungi teman atau keluarga yang lama tidak Anda ajak bicara.",
    "Lakukan satu hal kecil yang membuat Anda bahagia hari ini."
  ];

  function updateStats() {
    document.getElementById("totalLogs").textContent = catatan.length;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasEntry = catatan.some(item => item.tanggal === dateStr);
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    document.getElementById("streak").textContent = streak;

    const moodCounts = { negatif: 0, netral: 0, positif: 0 };
    catatan.forEach(item => {
      if (moodCounts.hasOwnProperty(item.mood)) {
        moodCounts[item.mood]++;
      }
    });

    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominantMood && dominantMood[1] > 0) {
      document.getElementById("dominantMood").textContent = moodToText[dominantMood[0]];
      document.getElementById("dominantMoodIcon").innerHTML = `<span class="text-2xl">${moodToIcon[dominantMood[0]]}</span>`;
    }

    const today_str = new Date().toISOString().split('T')[0];
    const todayEntry = catatan.find(item => item.tanggal === today_str);
    if (todayEntry) {
      document.getElementById("todayMood").textContent = moodToText[todayEntry.mood];
      document.getElementById("todayMoodIcon").innerHTML = `<span class="text-2xl">${moodToIcon[todayEntry.mood]}</span>`;
    }

    const last7Days = catatan.filter(item => {
      const itemDate = new Date(item.tanggal);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo;
    });

    const weeklyCounts = { positif: 0, netral: 0, negatif: 0 };
    last7Days.forEach(item => {
      if (weeklyCounts.hasOwnProperty(item.mood)) {
        weeklyCounts[item.mood]++;
      }
    });

    document.getElementById("positiveCount").textContent = `${weeklyCounts.positif} hari`;
    document.getElementById("neutralCount").textContent = `${weeklyCounts.netral} hari`;
    document.getElementById("negativeCount").textContent = `${weeklyCounts.negatif} hari`;

    let achievementText = "Terus semangat mencatat!";
    if (streak >= 7) achievementText = "🎉 Streak 7 hari! Luar biasa!";
    if (streak >= 30) achievementText = "🏆 Streak 30 hari! Anda konsisten!";
    if (catatan.length >= 50) achievementText = "📚 50+ catatan! Anda rajin sekali!";
    document.getElementById("achievementText").textContent = achievementText;

    const tipIndex = new Date().getDate() % tips.length;
    document.getElementById("dailyTip").textContent = tips[tipIndex];
  }

  function updateChart(days = 7) {
    const ctx = document.getElementById("moodChart").getContext("2d");
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      labels.push(currentDate.toLocaleDateString('id-ID', { 
        weekday: 'short', 
        day: 'numeric' 
      }));
      
      const entry = catatan.find(item => item.tanggal === dateStr);
      if (entry) {
        const value = moodToNumber[entry.mood];
        data.push(value);
        backgroundColors.push(
          value === 1 ? 'rgba(239, 68, 68, 0.8)' :  
          value === 2 ? 'rgba(245, 158, 11, 0.8)' : 
          'rgba(34, 197, 94, 0.8)'  
        );
      } else {
        data.push(0);
        backgroundColors.push('rgba(156, 163, 175, 0.3)');
      }
    }

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Mood Harian',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                if (value === 0) return 'Tidak ada catatan';
                return {1: 'Mood Sedih 😢', 2: 'Mood Netral 😐', 3: 'Mood Senang 😊'}[value] || '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 3.5,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return {1: '😢', 2: '😐', 3: '😊'}[value] || '';
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.2)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  document.getElementById("chartPeriod7").addEventListener("click", () => {
    currentPeriod = 7;
    updateChart(7);
    document.getElementById("chartPeriod7").className = "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium";
    document.getElementById("chartPeriod30").className = "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium";
  });

  document.getElementById("chartPeriod30").addEventListener("click", () => {
    currentPeriod = 30;
    updateChart(30);
    document.getElementById("chartPeriod30").className = "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium";
    document.getElementById("chartPeriod7").className = "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium";
  });

  updateStats();
  updateChart(7);
}