import ApiService from "../../data/api.js";

export default function LoginPresenter() {

  setTimeout(() => {
    const form = document.getElementById("form-login");
    const passwordInput = document.getElementById("login-password");
    const toggleButton = document.getElementById("toggle-password");
    const eyeOpen = document.getElementById("eye-open");
    const eyeClosed = document.getElementById("eye-closed");

    if (toggleButton && passwordInput && eyeOpen && eyeClosed) {
      toggleButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isPassword = passwordInput.type === "password";

        if (isPassword) {
          passwordInput.type = "text";
          eyeOpen.classList.add("hidden");
          eyeClosed.classList.remove("hidden");
        } else {
          passwordInput.type = "password";
          eyeOpen.classList.remove("hidden");
          eyeClosed.classList.add("hidden");
        }

        passwordInput.focus();
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const submitButton = form.querySelector('button[type="submit"]');

        if (!email || !password) {
          alert("Email dan kata sandi harus diisi!");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert("Format email tidak valid!");
          return;
        }

        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Memproses...";

        try {
          console.log("Starting login process...");

          const response = await ApiService.login({ email, password });
          console.log("Login API response:", response);

          if (response.error === true) {
            alert(
              response.message || "Login gagal. Email atau kata sandi salah."
            );
            return;
          }

          const savedToken = localStorage.getItem("accessToken");
          console.log("Token saved:", !!savedToken);

          if (!savedToken) {
            alert("Login gagal. Token tidak ditemukan. Silakan coba lagi.");
            return;
          }
          if (savedToken.length < 10) {
            alert("Login gagal. Token tidak valid. Silakan coba lagi.");
            localStorage.removeItem("accessToken");
            return;
          }

          console.log("Token validation passed");

          let userData = null;
          try {
            console.log("Fetching user profile...");
            const profileResponse = await ApiService.getUserProfile();
            console.log("Profile response:", profileResponse);

            if (!profileResponse.error && profileResponse.data) {
              if (profileResponse.data.user) {
                userData = profileResponse.data.user;
              } else if (profileResponse.user) {
                userData = profileResponse.user;
              } else {
                userData = profileResponse.data;
              }
              console.log("Profile data extracted:", userData);
            }
          } catch (profileError) {
            console.warn(
              "Profile fetch failed, continuing with basic data:",
              profileError
            );
          }

          if (!userData || !userData.email) {
            console.log("Creating fallback user data");
            userData = {
              email: email,
              name:
                response.data?.user?.name ||
                response.user?.name ||
                email.split("@")[0],
              joined:
                response.data?.user?.createdAt ||
                response.user?.createdAt ||
                new Date().toISOString(),
            };
          }

          if (!userData.joined) {
            userData.joined = new Date().toISOString();
          }

          console.log("Final user data:", userData);

          localStorage.setItem("moodmate-user", JSON.stringify(userData));
          localStorage.setItem("moodmate-logged-in", "true");
          localStorage.setItem("moodmate-current-user", email);
          localStorage.removeItem("temp-user-data");

          console.log("Login successful, redirecting to dashboard...");

          alert("Login berhasil! Mengarahkan ke dashboard...");
          setTimeout(() => {
            location.hash = "/dashboard";
          }, 500);
        } catch (error) {
          console.error("Login error:", error);

          localStorage.removeItem("accessToken");

          if (error.name === "TypeError" && error.message.includes("fetch")) {
            alert(
              "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
            );
          } else if (error.message && error.message.includes("401")) {
            alert("Email atau kata sandi salah.");
          } else {
            alert("Terjadi kesalahan saat login. Silakan coba lagi.");
          }
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
    }
  }, 100);
}
