import LoginPresenter, {
  initPasswordToggle,
  initForgotPasswordModal,
} from "./LoginPresenter.js";

export default async function LoginView() {
  setTimeout(() => LoginPresenter(), 0);
  setTimeout(() => {
    initPasswordToggle();
    initForgotPasswordModal();
  }, 100);

  return `
    <section class="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <!-- Form Login -->
      <h2 class="text-3xl font-extrabold text-center text-blue-600 mb-8 dark:text-blue-400">Login</h2>
      <form id="form-login" class="space-y-6">
        <input
          type="email"
          id="login-email"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          placeholder="Email"
          required
          autocomplete="email"
        />
        <div class="relative">
          <input
            type="password"
            id="login-password"
            class="w-full px-4 py-3 pr-16 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            placeholder="Kata Sandi"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            id="toggle-password-login"
            class="absolute top-0 right-0 h-full px-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 cursor-pointer"
            aria-label="Toggle password visibility"
            title="Tampilkan / sembunyikan kata sandi"
          >
            <i id="icon-password-login" class="fas fa-eye"></i>
          </button>
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-lg font-semibold shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Masuk
        </button>
      </form>

      <!-- Link Lupa Password -->
      <p class="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
        <a href="#" id="forgot-password-link" class="text-blue-600 hover:underline dark:text-blue-400">Lupa Password?</a>
      </p>
      <p class="text-center text-sm mt-2 text-gray-600 dark:text-gray-400">
        Belum punya akun? <a href="#/register" class="text-blue-600 hover:underline dark:text-blue-400">Daftar di sini</a>
      </p>

      <!-- Modal Lupa Password dengan CAPTCHA -->
      <div id="forgot-password-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-4 border border-gray-200 dark:border-gray-700">
          <!-- Header Modal -->
          <div class="text-center mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Reset Password</h3>
          </div>

          <form id="reset-password-form" class="space-y-3">
            <!-- Email Field -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="reset-email"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Email Anda"
                required
              />
            </div>

            <!-- Password Baru Field -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
              <input
                type="password"
                id="new-password"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <!-- Konfirmasi Password Field -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password</label>
              <input
                type="password"
                id="confirm-password"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ketik ulang password"
                required
              />
            </div>

            <!-- CAPTCHA Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CAPTCHA</label>
              <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span id="captcha-text" class="font-mono text-lg tracking-wider select-none bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                    <!-- CAPTCHA akan di-generate oleh presenter -->
                  </span>
                  <button 
                    type="button" 
                    id="refresh-captcha" 
                    class="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                    title="Refresh CAPTCHA"
                  >
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>
                <input
                  type="text"
                  id="captcha-input"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                  placeholder="Ketik teks di atas"
                  required
                />
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-2 pt-2">
              <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                Simpan
              </button>
              <button type="button" id="close-modal" class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 py-2 rounded-lg">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}
