export default async function DashboardView() {
  return `
    <section class="p-6 max-w-7xl mx-auto space-y-8">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dashboard MoodMate
        </h1>
        <p class="text-gray-600 dark:text-gray-400">Pantau perjalanan emosi Anda setiap hari</p>
      </div>

      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Catatan -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium opacity-90">Total Catatan</h3>
              <p class="text-3xl font-bold mt-1" id="totalLogs">0</p>
            </div>
            <div class="bg-white/20 p-3 rounded-full">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Hari Beruntun -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium opacity-90">Hari Beruntun</h3>
              <p class="text-3xl font-bold mt-1" id="streak">0</p>
            </div>
            <div class="bg-white/20 p-3 rounded-full">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v9h2v-9zm4 0h-2v9h2v-9zm4 0h-2v9h2v-9zm2.5-5L12 2 4.5 6v2h15V6z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Mood Dominan -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium opacity-90">Mood Dominan</h3>
              <p class="text-2xl font-bold mt-1" id="dominantMood">-</p>
            </div>
            <div class="bg-white/20 p-3 rounded-full" id="dominantMoodIcon">
              <span class="text-2xl">😊</span>
            </div>
          </div>
        </div>

        <!-- Mood Hari Ini -->
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium opacity-90">Mood Hari Ini</h3>
              <p class="text-2xl font-bold mt-1" id="todayMood">Belum Ada</p>
            </div>
            <div class="bg-white/20 p-3 rounded-full" id="todayMoodIcon">
              <span class="text-2xl">❓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Grafik Mood 7 Hari Terakhir</h2>
          <div class="flex space-x-2">
            <button id="chartPeriod7" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">7 Hari</button>
            <button id="chartPeriod30" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">30 Hari</button>
          </div>
        </div>
        <div class="relative h-64 mb-4">
          <canvas id="moodChart" class="w-full h-full"></canvas>
        </div>
        <div class="flex justify-center space-x-6 text-sm">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">😢</span>
            <span class="text-gray-600 dark:text-gray-400">Negatif</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-2xl">😐</span>
            <span class="text-gray-600 dark:text-gray-400">Netral</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-2xl">😊</span>
            <span class="text-gray-600 dark:text-gray-400">Positif</span>
          </div>
        </div>
      </div>

      <!-- Additional Stats Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Weekly Summary -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Ringkasan Minggu Ini</h3>
          <div class="space-y-4" id="weeklyStats">
            <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">😊</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">Mood Senang</span>
              </div>
              <span class="font-bold text-green-600" id="positiveCount">0 hari</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">😐</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">Mood Netral</span>
              </div>
              <span class="font-bold text-yellow-600" id="neutralCount">0 hari</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">😢</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">Mood Sedih</span>
              </div>
              <span class="font-bold text-red-600" id="negativeCount">0 hari</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Aksi Cepat</h3>
          <div class="space-y-3">
            <a href="#/journal" class="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <div class="bg-blue-600 p-2 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800 dark:text-white">Tulis Catatan Baru</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">Catat mood dan aktivitas hari ini</p>
              </div>
            </a>
            
            <a href="#/riwayat" class="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <div class="bg-green-600 p-2 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800 dark:text-white">Lihat Riwayat</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">Tinjau catatan mood sebelumnya</p>
              </div>
            </a>

            <div class="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="bg-purple-600 p-2 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800 dark:text-white">Pencapaian</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400" id="achievementText">Terus semangat mencatat!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">💡 Tips Hari Ini</h3>
        <p class="text-gray-700 dark:text-gray-300" id="dailyTip">Mulai hari dengan gratitude - tuliskan 3 hal yang Anda syukuri hari ini!</p>
      </div>
    </section>
  `;
}
