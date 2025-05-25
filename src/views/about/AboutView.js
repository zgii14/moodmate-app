export default async function AboutView() {
  return `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 mt-4 py-20 transition-colors duration-500">
      <div class="max-w-6xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <!-- Ilustrasi -->
        <div class="flex justify-center md:justify-start animate-fade-in-up">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur-xl opacity-30 scale-110"></div>
            <img 
              src="/images/about.png" 
              alt="About MoodMate" 
              class="relative w-full max-w-md rounded-xl shadow-2xl card-responsive"
              loading="lazy"
            />
          </div>
        </div>

        <!-- Teks -->
        <div class="animate-fade-in-up" style="animation-delay: 0.2s;">
          <div class="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
            <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Tentang MoodMate
          </div>
          
          <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Membantu Anda Memahami <span class="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text">Diri Sendiri</span>
          </h2>
          
          <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
            MoodMate adalah platform AI yang dirancang khusus untuk membantu Anda memahami, mengelola, dan meningkatkan kesehatan mental melalui analisis mood yang cerdas dan rekomendasi yang dipersonalisasi.
          </p>
          
          <p class="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            Dengan teknologi machine learning terdepan, kami menganalisis tulisan Anda untuk memberikan insights mendalam tentang suasana hati dan memberikan solusi yang tepat untuk setiap kondisi emosional.
          </p>
        </div>
      </div>
    </section>

    <!-- Visi & Misi Section -->
    <section class="py-20 bg-white dark:bg-gray-900 transition-colors duration-500">
      <div class="max-w-6xl mx-auto px-6 md:px-16">
        <div class="text-center mb-16 animate-fade-in-up">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Visi & <span class="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Misi Kami</span>
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Komitmen kami untuk menciptakan dunia yang lebih bahagia dan sehat secara mental
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Visi -->
          <div class="card-responsive bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900 p-8 rounded-2xl shadow-lg animate-fade-in-up" style="animation-delay: 0.2s;">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mr-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Visi</h3>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Menjadi platform kesehatan mental terdepan yang membantu setiap individu memahami dan mengelola emosi mereka dengan mudah, sehingga dapat menjalani hidup yang lebih bahagia dan bermakna.
            </p>
          </div>

          <!-- Misi -->
          <div class="card-responsive bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900 p-8 rounded-2xl shadow-lg animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mr-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Misi</h3>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Memberikan tools dan insights yang mudah digunakan untuk analisis mood, rekomendasi yang dipersonalisasi, dan dukungan berkelanjutan dalam perjalanan kesehatan mental setiap pengguna.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Nilai-Nilai Kami -->
    <section class="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-500">
      <div class="max-w-6xl mx-auto px-6 md:px-16">
        <div class="text-center mb-16 animate-fade-in-up">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nilai-Nilai <span class="text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">Kami</span>
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Prinsip-prinsip yang memandu setiap langkah kami
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Nilai 1 -->
          <div class="text-center animate-fade-in-up" style="animation-delay: 0.1s;">
            <div class="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Privasi & Keamanan</h3>
            <p class="text-gray-600 dark:text-gray-400">Data pribadi Anda adalah prioritas utama. Kami menjamin kerahasiaan dan keamanan informasi Anda.</p>
          </div>

          <!-- Nilai 2 -->
          <div class="text-center animate-fade-in-up" style="animation-delay: 0.2s;">
            <div class="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Empati & Dukungan</h3>
            <p class="text-gray-600 dark:text-gray-400">Kami memahami bahwa setiap orang unik. Pendekatan kami selalu penuh empati dan mendukung.</p>
          </div>

          <!-- Nilai 3 -->
          <div class="text-center animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Inovasi Berkelanjutan</h3>
            <p class="text-gray-600 dark:text-gray-400">Kami terus berinovasi menggunakan teknologi terdepan untuk memberikan pengalaman terbaik.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Teknologi yang Kami Gunakan -->
    <section class="py-20 bg-white dark:bg-gray-900 transition-colors duration-500">
      <div class="max-w-6xl mx-auto px-6 md:px-16">
        <div class="text-center mb-16 animate-fade-in-up">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Teknologi <span class="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">Terdepan</span>
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            MoodMate didukung oleh teknologi artificial intelligence dan machine learning untuk memberikan analisis mood yang akurat dan rekomendasi yang tepat
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <!-- Teknologi Info -->
          <div class="animate-fade-in-up">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bagaimana AI Kami Bekerja?</h3>
            
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Natural Language Processing (NLP)</h4>
                  <p class="text-gray-600 dark:text-gray-400">Menganalisis teks dan memahami konteks emosional dari tulisan Anda.</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Sentiment Analysis</h4>
                  <p class="text-gray-600 dark:text-gray-400">Mengidentifikasi emosi dan sentimen dari berbagai aspek tulisan Anda.</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Personalized Recommendations</h4>
                  <p class="text-gray-600 dark:text-gray-400">Memberikan rekomendasi musik dan aktivitas yang disesuaikan dengan profile mood Anda.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Visual representation -->
          <div class="animate-fade-in-up" style="animation-delay: 0.2s;">
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-blue-900 p-8 rounded-2xl">
              <div class="text-center">
                <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Analysis</h4>
                <p class="text-gray-600 dark:text-gray-400 mb-6">Sistem kami dapat mengidentifikasi lebih dari 20 jenis emosi yang berbeda dengan akurasi tinggi.</p>
                
                <!-- Progress bars untuk menunjukkan akurasi -->
                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-700 dark:text-gray-300">Akurasi Analisis</span>
                      <span class="text-blue-600 dark:text-blue-400 font-semibold">95%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style="width: 95%"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-700 dark:text-gray-300">Kecepatan Respon</span>
                      <span class="text-green-600 dark:text-green-400 font-semibold">< 2 detik</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style="width: 98%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div class="max-w-4xl mx-auto text-center px-6 md:px-16">
        <div class="animate-fade-in-up">
          <h2 class="text-4xl font-bold mb-6">
            Mulai Perjalanan Anda Menuju Kesehatan Mental yang Lebih Baik
          </h2>
          <p class="text-xl text-blue-100 mb-10">
            Bergabunglah dengan MoodMate dan rasakan perbedaannya dalam memahami diri Anda sendiri
          </p>
          
          <a href="#/login" class="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg btn-transition transform hover:scale-105">
            <span>Mulai Sekarang</span>
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </a>
        </div>
      </div>
    </section>
  `;
}