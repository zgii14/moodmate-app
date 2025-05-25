import { UserModel } from "../../models/UserModel.js";

export default async function ProfilView() {
  const user = UserModel.getCurrent();
  const photo = localStorage.getItem("profile_photo");

  const defaultProfilePhoto =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiByeD0iNzUiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTc1IDY1QzgyLjE3OTcgNjUgODggNTkuMTc5NyA4OCA1MkM4OCA0NC44MjAzIDgyLjE3OTcgMzkgNzUgMzlDNjcuODIwMyAzOSA2MiA0NC44MjAzIDYyIDUyQzYyIDU5LjE3OTcgNjcuODIwMyA2NSA3NSA2NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwNSA5NUM5Ny44NzA3IDg5LjU2NDggODcuNzEwNSA4NiA3NSA4NkM2Mi4yODk1IDg2IDUyLjEyOTMgODkuNTY0OCA0NSA5NUw0NSAxMTBDNDUgMTE1LjUyMyA0OS40NzcgMTIwIDU1IDEyMEw5NSAxMjBDMTAwLjUyMyAxMjAgMTA1IDExNS41MjMgMTA1IDExMEwxMDUgOTVaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=";

  const formatJoinDate = (dateString) => {
    if (!dateString || dateString === "undefined") {
      return "Tanggal tidak tersedia";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid";
      }
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Tanggal tidak tersedia";
    }
  };

  const setupEventListeners = () => {
    const uploadInput = document.getElementById("upload-photo");
    const profileImage = document.getElementById("profile-photo-preview");

    if (uploadInput && profileImage) {
      uploadInput.addEventListener("change", handlePhotoUpload);
      profileImage.addEventListener("contextmenu", handleContextMenu);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Ukuran file terlalu besar! Maksimal 5MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung! Gunakan JPG, PNG, atau GIF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;

      localStorage.setItem("profile_photo", imageData);
      UserModel.updateProfilePhoto(imageData);

      const profileImg = document.getElementById("profile-photo-preview");
      if (profileImg) {
        profileImg.src = imageData;
      }

      showSuccessMessage("Foto profil berhasil diperbarui!");
    };

    reader.onerror = function () {
      alert("Gagal membaca file. Silakan coba lagi.");
    };

    reader.readAsDataURL(file);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (confirm("Apakah Anda ingin mereset foto profil ke default?")) {
      resetProfilePhoto();
    }
  };

  const resetProfilePhoto = () => {
    localStorage.removeItem("profile_photo");
    UserModel.updateProfilePhoto(null);

    const profileImg = document.getElementById("profile-photo-preview");
    if (profileImg) {
      profileImg.src = defaultProfilePhoto;
    }

    showSuccessMessage("Foto profil direset ke default!");
  };

  const showSuccessMessage = (message) => {
    // Remove existing toast if any
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className =
      "toast-notification fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-x-full");
    }, 100);

    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const htmlContent = `
    <section class="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-md">
      <h2 class="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">Profil Pengguna</h2>
      <div class="flex flex-col items-center gap-4">
        <div class="relative">
          <img id="profile-photo-preview" 
               src="${photo || defaultProfilePhoto}" 
               alt="Foto Profil" 
               class="w-32 h-32 rounded-full object-cover border-4 border-blue-400 bg-gray-100" />
          
          <!-- Overlay untuk menunjukkan ini bisa diklik -->
          <div class="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center cursor-pointer" onclick="document.getElementById('upload-photo').click()">
            <svg class="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>

        <input type="file" id="upload-photo" accept="image/*" style="display: none;" />
        
        <button onclick="document.getElementById('upload-photo').click()" 
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
          Ubah Foto Profil
        </button>

        <div class="w-full mt-6 space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nama</label>
                <p class="text-lg font-semibold">${
                  user?.name || "Nama tidak tersedia"
                }</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p class="text-lg">${user?.email || "Email tidak tersedia"}</p>
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Bergabung</label>
                <p class="text-lg">${formatJoinDate(
                  user?.joined || user?.createdAt || user?.created_at
                )}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  setTimeout(setupEventListeners, 100);

  return htmlContent;
}
