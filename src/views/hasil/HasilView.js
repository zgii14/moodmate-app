export default async function JournalResultView() {
  return `
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">✨ Analisis Catatan Harianmu</h2>
        <p class="text-gray-600 dark:text-gray-300" id="tanggal-hasil">Loading...</p>
      </div>

      <!-- AI Info (akan ditampilkan jika prediksi menggunakan AI) -->
      <div id="aiInfo" class="hidden text-center mb-4"></div>

      <!-- Mood Analysis Result -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 text-center">
        <h3 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Hari Ini Kamu Terlihat...</h3>
        
        <div class="mood-result-box bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-8 mb-6" id="moodBox">
          <div class="flex items-center justify-center gap-6">
            <span id="emoji" class="text-6xl animate-bounce">😐</span>
            <div class="text-left">
              <p class="font-bold text-2xl mb-2 text-gray-800 dark:text-white" id="moodText">Loading...</p>
              <p class="text-gray-600 dark:text-gray-300" id="moodDescription">Menganalisis mood...</p>
            </div>
          </div>
        </div>

        <!-- Confidence Score -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Tingkat Keyakinan Analisis</p>
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div id="confidenceBar" class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000" style="width: 0%"></div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2" id="confidenceText">Menganalisis...</p>
        </div>
      </div>

      <!-- Catatan Preview -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
          📝 Catatanmu Hari Ini
        </h3>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed" id="catatanPreview">Loading...</p>
        </div>
        
        <!-- Aktivitas yang dipilih -->
        <div id="aktivitasSection" class="hidden">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">🎯 Aktivitas yang Kamu Lakukan:</h4>
          <div class="flex flex-wrap gap-2 mb-4" id="aktivitasTerpilih"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-4 justify-center">
        <button onclick="location.hash='/journal'" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          ✏️ Tulis Catatan Lagi
        </button>
        <button onclick="location.hash='/dashboard'" class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          🏠 Kembali ke Dashboard
        </button>
        <button onclick="location.hash='/riwayat'" class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          📚 Lihat Riwayat
        </button>
        <button id="shareBtn" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          📤 Bagikan Mood
        </button>
      </div>
    </div>
  `;
}
