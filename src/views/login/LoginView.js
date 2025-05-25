import LoginPresenter from "./LoginPresenter.js";

export default async function LoginView() {
  setTimeout(() => LoginPresenter(), 0);

  return `
    <section class="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg
                    border border-gray-200
                    dark:bg-gray-900 dark:border-gray-700
                    ">
      <h2 class="text-3xl font-extrabold text-center text-blue-600 mb-8
                 dark:text-blue-400
                 ">Login</h2>
      <form id="form-login" class="space-y-6">
        <input
          type="email"
          id="login-email"
          class="w-full px-4 py-3 rounded-lg border border-gray-300
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                 "
          placeholder="Email"
          required
          autocomplete="email"
        />
        <div class="relative">
          <input
            type="password"
            id="login-password"
            class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                   "
            placeholder="Kata Sandi"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            id="toggle-password"
            class="absolute right-3 top-1/2 transform -translate-y-1/2
                   text-gray-500 hover:text-gray-700 
                   dark:text-gray-400 dark:hover:text-gray-200
                   focus:outline-none transition-colors duration-200
                   p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle password visibility"
          >
            <svg id="eye-open" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg id="eye-closed" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                 text-white py-3 rounded-lg font-semibold
                 shadow-md transition duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed
                 "
        >
          Masuk
        </button>
      </form>
      <p class="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
        Belum punya akun? <a href="#/register" class="text-blue-600 hover:underline dark:text-blue-400">Daftar di sini</a>
      </p>
    </section>
  `;
}
