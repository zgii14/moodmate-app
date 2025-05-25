export default async function JournalView() {   
  return `     
    <section class="p-6 max-w-7xl mx-auto space-y-8">
      <!-- Header with Date -->
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">Catatan Harian</h2>
        <p class="text-gray-600 dark:text-gray-300" id="tanggal-hari"></p>
      </div>

      <!-- Textarea for Notes -->
      <div class="mb-8">
        <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">💭 Ceritakan harimu...</label>
        <textarea 
          id="catatan" 
          rows="6" 
          class="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white resize-none transition-all"
          placeholder="Tulis tentang hari ini... Apa yang membuatmu senang? Apa tantangan yang kamu hadapi?"
        ></textarea>
      </div>

      <!-- Activities Section -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">🎯 Aktivitas Hari Ini</h3>
        
        <!-- Basic Activities -->
        <div class="mb-6">
          <h4 class="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Aktivitas Umum</h4>
          <div class="grid grid-cols-3 md:grid-cols-4 gap-3" id="aktivitas-container"></div>
        </div>

      <!-- Save Button -->
      <div class="text-center">
        <button 
          id="simpan-btn" 
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Simpan Catatan
        </button>
      </div>
    </div>
  `;
}
