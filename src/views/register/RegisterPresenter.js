import ApiService from "../../data/api.js";

export default function RegisterPresenter() {
  setTimeout(() => {
    const form = document.getElementById("form-register");

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;
        const confirm = document.getElementById("reg-confirm").value;
        const submitButton = form.querySelector('button[type="submit"]');

        if (!name || !email || !password || !confirm) {
          alert("Semua field harus diisi!");
          return;
        }

        if (password !== confirm) {
          alert("Konfirmasi kata sandi tidak cocok!");
          return;
        }

        if (password.length < 8) {
          alert("Kata sandi minimal 8 karakter!");
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
          const joinedDate = new Date().toISOString();

          const response = await ApiService.register({
            name,
            email,
            password,
            joined: joinedDate,
          });

          console.log("Register response:", response);
          console.log("Response status:", response.status);

          const hasError =
            response.error ||
            response.status === "error" ||
            response.success === false ||
            (response.status && response.status >= 400);

          if (hasError) {
            let errorMessage = "Pendaftaran gagal. Silakan coba lagi.";

            if (response.message) {
              errorMessage = response.message;
            } else if (response.error && typeof response.error === "string") {
              errorMessage = response.error;
            } else if (response.errors && Array.isArray(response.errors)) {
              errorMessage = response.errors.join(", ");
            }

            if (
              errorMessage.toLowerCase().includes("email") &&
              (errorMessage.toLowerCase().includes("sudah") ||
                errorMessage.toLowerCase().includes("already") ||
                errorMessage.toLowerCase().includes("exists") ||
                errorMessage.toLowerCase().includes("duplicate"))
            ) {
              errorMessage =
                "Email sudah terdaftar. Silakan gunakan email lain atau login dengan akun yang sudah ada.";
            }

            alert(errorMessage);
            return;
          }

          const isSuccess =
            response.success === true ||
            response.status === "success" ||
            response.data ||
            (!response.error &&
              !response.message?.toLowerCase().includes("gagal"));

          if (!isSuccess) {
            alert("Pendaftaran gagal. Silakan coba lagi.");
            return;
          }

          const tempUserData = {
            name,
            email,
            joined: joinedDate,
          };

          localStorage.setItem("temp-user-data", JSON.stringify(tempUserData));

          alert("Pendaftaran berhasil! Silakan login dengan akun Anda.");

          form.reset();

          location.hash = "/login";
        } catch (error) {
          console.error("Register error:", error);

          if (error.name === "TypeError" && error.message.includes("fetch")) {
            alert(
              "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
            );
          } else if (error.message.includes("JSON")) {
            alert("Terjadi kesalahan dalam memproses response server.");
          } else {
            alert("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
          }
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
    }
  }, 100);
}
