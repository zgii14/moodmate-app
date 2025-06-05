import ApiService from "../../data/api.js";
import { UserModel } from "../../models/UserModel.js";
import { db } from "../../utils/firebase.js";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

export default function ProfilPresenter() {
  const DEFAULT_PHOTO = "/images/profile.png";
  const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  let cachedProfilePhoto = null;
  let isPhotoLoaded = false;

  const getCurrentUserEmail = () => {
    return localStorage.getItem("moodmate-current-user");
  };

  const showToast = (message, type = "success") => {
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) existingToast.remove();

    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const icon =
      type === "success"
        ? `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
         </svg>`
        : `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
         </svg>`;

    const toast = document.createElement("div");
    toast.className = `toast-notification fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-lg z-50 transition-all duration-300 transform translate-x-full backdrop-blur-sm border border-white border-opacity-20`;
    toast.innerHTML = `
      <div class="flex items-center">
        ${icon}
        <span class="font-medium">${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.remove("translate-x-full"), 100);

    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const setLoadingState = (isLoading) => {
    const changePhotoBtn = document.getElementById("change-photo-btn");
    const resetPhotoBtn = document.getElementById("reset-photo-btn");
    const photoOverlay = document.getElementById("photo-overlay");

    if (changePhotoBtn) {
      changePhotoBtn.disabled = isLoading;

      if (!changePhotoBtn.dataset.originalHtml) {
        changePhotoBtn.dataset.originalHtml = changePhotoBtn.innerHTML;
      }

      if (isLoading) {
        changePhotoBtn.innerHTML = `
        <svg class="w-5 h-5 inline-block mr-2 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span class="whitespace-nowrap">Memuat...</span>
      `;
      } else {
        changePhotoBtn.innerHTML =
          changePhotoBtn.dataset.originalHtml ||
          `
        <svg class="w-5 h-5 inline-block mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="whitespace-nowrap">Ubah Foto Profil</span>
      `;
      }

      changePhotoBtn.offsetHeight;
    }

    if (resetPhotoBtn) {
      resetPhotoBtn.disabled = isLoading;

      if (isLoading) {
        resetPhotoBtn.style.opacity = "0.5";
        resetPhotoBtn.style.pointerEvents = "none";
      } else {
        resetPhotoBtn.style.opacity = "";
        resetPhotoBtn.style.pointerEvents = "";
      }
    }

    if (photoOverlay) {
      photoOverlay.style.pointerEvents = isLoading ? "none" : "auto";
    }
  };

  const updateImageDisplay = (imageData, isInitialLoad = false) => {
    const profileImg = document.getElementById("profile-photo-preview");
    if (profileImg) {
      const newSrc = imageData || DEFAULT_PHOTO;

      if (isInitialLoad) {
        profileImg.src = newSrc;
        isPhotoLoaded = true;
      } else {
        profileImg.style.opacity = "0.7";

        requestAnimationFrame(() => {
          profileImg.src = newSrc;
          requestAnimationFrame(() => {
            profileImg.style.opacity = "1";
          });
        });
      }

      const container =
        profileImg.closest(".profile-photo-container") ||
        profileImg.parentElement;
      if (container) {
        container.offsetHeight; 
      }
    }
  };

  const showPhotoModal = () => {
    const modal = document.getElementById("photo-options-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  };

  const hidePhotoModal = () => {
    const modal = document.getElementById("photo-options-modal");
    if (modal) {
      modal.classList.remove("flex");
      modal.classList.add("hidden");

      setLoadingState(false);

      const photoOverlay = document.getElementById("photo-overlay");
      if (photoOverlay) {
        photoOverlay.style.transition = "";
      }

      document.body.offsetHeight;
    }
  };

  const loadUserProfile = async () => {
    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) {
        throw new Error("User tidak ditemukan");
      }

      const userRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        const parseFirestoreDate = (dateValue) => {
          if (!dateValue) return null;

          if (dateValue.toDate) {
            return dateValue.toDate().toISOString();
          }

          if (
            typeof dateValue === "string" &&
            !isNaN(new Date(dateValue).getTime())
          ) {
            return new Date(dateValue).toISOString();
          }

          try {
            const date = new Date(dateValue);
            return !isNaN(date.getTime()) ? date.toISOString() : null;
          } catch (e) {
            return null;
          }
        };

        return {
          name: userData.name || "",
          email: userData.email || userEmail,
          profilePhoto: userData.profilePhoto || null,
          createdAt: parseFirestoreDate(userData.createdAt),
          updatedAt:
            parseFirestoreDate(userData.updatedAt) ||
            parseFirestoreDate(userData.createdAt),
        };
      } else {
        throw new Error("Data user tidak ditemukan");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      throw error;
    }
  };

  const loadProfilePhoto = async () => {
    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) return null;

      if (cachedProfilePhoto !== null) {
        return cachedProfilePhoto;
      }

      const userRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userRef);

      const photoData = userSnap.exists()
        ? userSnap.data().profilePhoto || null
        : null;

      cachedProfilePhoto = photoData;
      return photoData;
    } catch (error) {
      console.error("Error loading profile photo:", error);
      return null;
    }
  };

  const saveProfilePhoto = async (imageData) => {
    const userEmail = getCurrentUserEmail();
    if (!userEmail) throw new Error("User tidak ditemukan");

    const userRef = doc(db, "users", userEmail);
    await updateDoc(userRef, {
      profilePhoto: imageData,
      updatedAt: new Date().toISOString(),
    });

    cachedProfilePhoto = imageData;
  };

  const removeProfilePhoto = async () => {
    const userEmail = getCurrentUserEmail();
    if (!userEmail) throw new Error("User tidak ditemukan");

    const userRef = doc(db, "users", userEmail);
    await updateDoc(userRef, {
      profilePhoto: null,
      updatedAt: new Date().toISOString(),
    });

    cachedProfilePhoto = null;
  };

  const validateFile = (file) => {
    if (file.size > FILE_SIZE_LIMIT) {
      return "Ukuran file terlalu besar! Maksimal 5MB.";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format file tidak didukung! Gunakan JPG, PNG, atau GIF.";
    }

    return null;
  };

  const handlePhotoUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        showToast(validationError, "error");
        return;
      }

      const userEmail = getCurrentUserEmail();
      if (!userEmail) {
        showToast("User tidak terautentikasi", "error");
        return;
      }

      setLoadingState(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target.result;
          await saveProfilePhoto(imageData);
          updateImageDisplay(imageData);
          UserModel.updateProfilePhoto(imageData);

          hidePhotoModal();

          showToast("Foto profil berhasil diperbarui!");
          updateLastModified();

          setTimeout(() => {
            const container =
              document.querySelector(".profile-section") || document.body;
            container.offsetHeight; 
          }, 200);
        } catch (error) {
          console.error("Error uploading photo:", error);
          showToast("Gagal menyimpan foto profil: " + error.message, "error");
        } finally {
          setLoadingState(false);
          event.target.value = "";
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Unexpected error in handlePhotoUpload:", error);
      showToast("Terjadi kesalahan tak terduga", "error");
      setLoadingState(false);
    }
  };

  const showConfirmDialog = () => {
    const dialog = document.createElement("div");
    dialog.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    dialog.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Reset Foto Profil</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Apakah Anda yakin ingin mereset foto profil ke default?</p>
          <div class="flex gap-3">
            <button id="cancel-reset" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
              Batal
            </button>
            <button id="confirm-reset" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const cancelBtn = dialog.querySelector("#cancel-reset");
    const confirmBtn = dialog.querySelector("#confirm-reset");

    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(dialog);
    });

    confirmBtn.addEventListener("click", async () => {
      document.body.removeChild(dialog);
      await resetToDefault();
    });

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });
  };

  const resetToDefault = async () => {
    try {
      setLoadingState(true);

      await removeProfilePhoto();
      UserModel.updateProfilePhoto(null);
      updateImageDisplay(null);

      hidePhotoModal();

      const changePhotoBtn = document.getElementById("change-photo-btn");
      if (changePhotoBtn && changePhotoBtn.dataset.originalHtml) {
        changePhotoBtn.innerHTML = changePhotoBtn.dataset.originalHtml;
      }

      showToast("Foto profil berhasil direset ke default!");
      updateLastModified();

      setTimeout(() => {
        const container =
          document.querySelector(".profile-section") || document.body;
        container.offsetHeight; 
      }, 100);
    } catch (error) {
      console.error("Error resetting profile photo:", error);
      showToast("Gagal mereset foto profil. Silakan coba lagi.", "error");
    } finally {
      setLoadingState(false);
    }
  };

  const updateLastModified = () => {
    const lastUpdatedElement = document.getElementById("last-updated");
    if (lastUpdatedElement) {
      const now = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      lastUpdatedElement.textContent = now;
    }
  };

  const hashPassword = async (password) => {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Gagal mengenkripsi password");
    }
  };

  const validatePassword = (password, confirmPassword) => {
    if (password && password.length < 6) {
      return "Password minimal 6 karakter";
    }
    if (password !== confirmPassword) {
      return "Konfirmasi password tidak sesuai";
    }
    return null;
  };

  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Nama tidak boleh kosong";
    }
    if (name.trim().length < 2) {
      return "Nama minimal 2 karakter";
    }
    if (name.trim().length > 50) {
      return "Nama maksimal 50 karakter";
    }
    return null;
  };

  const updateUserProfile = async (userData) => {
    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) {
        throw new Error("User tidak ditemukan");
      }

      console.log("Updating user profile for:", userEmail);
      console.log("Update data:", userData);

      const userRef = doc(db, "users", userEmail);

      const updateData = {
        ...userData,
        updatedAt: new Date().toISOString(),
      };

      if (userData.password) {
        updateData.password = await hashPassword(userData.password);
        console.log("Password hashed successfully");
      }

      await updateDoc(userRef, updateData);
      console.log("Profile updated successfully in Firestore");

      UserModel.updateUser(updateData);
      console.log("UserModel updated successfully");

      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  const toggleEditMode = (isEditing) => {
    const viewMode = document.getElementById("profile-view-mode");
    const editMode = document.getElementById("profile-edit-mode");
    const editBtn = document.getElementById("edit-profile-btn");

    if (viewMode && editMode && editBtn) {
      if (isEditing) {
        viewMode.classList.add("hidden");
        editMode.classList.remove("hidden");
        editBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
        editBtn.title = "Batal Edit";
      } else {
        viewMode.classList.remove("hidden");
        editMode.classList.add("hidden");
        editBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        `;
        editBtn.title = "Edit Profile";
      }
    }
  };

  const handleEditProfile = async () => {
    const isCurrentlyEditing = !document
      .getElementById("profile-edit-mode")
      .classList.contains("hidden");

    if (isCurrentlyEditing) {
      clearEditForm();
      toggleEditMode(false);
    } else {
      try {
        const userData = await loadUserProfile();
        const editNameInput = document.getElementById("edit-name");
        if (editNameInput) {
          editNameInput.value = userData.name || "";
        }
        toggleEditMode(true);
      } catch (error) {
        console.error("Error loading user data:", error);
        showToast("Gagal memuat data profil", "error");
      }
    }
  };

  const setSaveButtonLoading = (isLoading) => {
    const saveBtn = document.getElementById("save-profile-btn");
    if (!saveBtn) return;

    if (isLoading) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `
        <svg class="w-5 h-5 inline-block mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Menyimpan...
      `;
      saveBtn.classList.add("opacity-70", "cursor-not-allowed");
    } else {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `
        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Simpan Perubahan
      `;
      saveBtn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveButtonLoading(true);

      const editNameInput = document.getElementById("edit-name");
      const editPasswordInput = document.getElementById("edit-password");
      const editPasswordConfirmInput = document.getElementById(
        "edit-password-confirm",
      );

      const newName = editNameInput?.value?.trim() || "";
      const newPassword = editPasswordInput?.value || "";
      const confirmPassword = editPasswordConfirmInput?.value || "";

      console.log("Form data:", { newName, hasPassword: !!newPassword });

      const nameError = validateName(newName);
      if (nameError) {
        showToast(nameError, "error");
        editNameInput?.focus();
        return;
      }

      if (newPassword || confirmPassword) {
        const passwordError = validatePassword(newPassword, confirmPassword);
        if (passwordError) {
          showToast(passwordError, "error");
          editPasswordInput?.focus();
          return;
        }
      }

      const updateData = {
        name: newName,
      };

      if (newPassword) {
        updateData.password = newPassword;
      }

      console.log("Updating profile with data:", updateData);

      await updateUserProfile(updateData);

      const displayNameElement = document.getElementById("display-name");
      if (displayNameElement) {
        displayNameElement.textContent = newName;
      }

      updateLastModified();

      clearEditForm();
      toggleEditMode(false);

      showToast("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("Gagal memperbarui profil: " + error.message, "error");
    } finally {
      setSaveButtonLoading(false);
    }
  };

  const clearEditForm = () => {
    const editPasswordInput = document.getElementById("edit-password");
    const editPasswordConfirmInput = document.getElementById(
      "edit-password-confirm",
    );

    if (editPasswordInput) editPasswordInput.value = "";
    if (editPasswordConfirmInput) editPasswordConfirmInput.value = "";
  };

  const handleCancelEdit = () => {
    clearEditForm();
    toggleEditMode(false);
  };

  const loadAndDisplayPhoto = async () => {
    try {
      const photoData = await loadProfilePhoto();
      updateImageDisplay(photoData, true);
    } catch (error) {
      console.error("Error loading profile photo:", error);
      updateImageDisplay(null, true);
      showToast("Gagal memuat foto profil", "error");
    }
  };

  const loadAndDisplayProfile = async () => {
    try {
      const userData = await loadUserProfile();

      const displayNameElement = document.getElementById("display-name");
      if (displayNameElement) {
        displayNameElement.textContent = userData.name || "Nama tidak tersedia";
      }

      const displayEmailElement = document.getElementById("display-email");
      if (displayEmailElement) {
        displayEmailElement.textContent =
          userData.email || "Email tidak tersedia";
      }

      const lastUpdatedElement = document.getElementById("last-updated");
      if (lastUpdatedElement) {
        let updateDateText = "-";

        const dateToShow = userData.updatedAt || userData.createdAt;

        if (dateToShow) {
          try {
            const date = new Date(dateToShow);
            if (!isNaN(date.getTime())) {
              updateDateText = date.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          } catch (e) {
            console.error("Error formatting date:", e);
          }
        }

        lastUpdatedElement.textContent = updateDateText;
      }

      console.log("Profile data loaded successfully:", {
        name: userData.name,
        email: userData.email,
        hasPhoto: !!userData.profilePhoto,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
      showToast("Gagal memuat data profil", "error");

      try {
        const localUser = JSON.parse(localStorage.getItem("moodmate-user"));
        if (localUser) {
          const displayNameElement = document.getElementById("display-name");
          if (displayNameElement) {
            displayNameElement.textContent =
              localUser.name || "Nama tidak tersedia";
          }

          const lastUpdatedElement = document.getElementById("last-updated");
          if (lastUpdatedElement) {
            lastUpdatedElement.textContent = "-";
          }
        }
      } catch (localError) {
        console.error("Failed to fallback to localStorage:", localError);
      }
    }
  };

  const setupEventListeners = () => {
    const uploadInput = document.getElementById("upload-photo");
    const changePhotoBtn = document.getElementById("change-photo-btn");
    const photoOverlay = document.getElementById("photo-overlay");
    const uploadPhotoBtn = document.getElementById("upload-photo-btn");
    const resetPhotoBtn = document.getElementById("reset-photo-btn");
    const cancelPhotoBtn = document.getElementById("cancel-photo-options");
    const photoModal = document.getElementById("photo-options-modal");

    const editBtn = document.getElementById("edit-profile-btn");
    const saveBtn = document.getElementById("save-profile-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");
    const editInputs = [
      document.getElementById("edit-name"),
      document.getElementById("edit-password"),
      document.getElementById("edit-password-confirm"),
    ].filter(Boolean);

    if (changePhotoBtn)
      changePhotoBtn.addEventListener("click", showPhotoModal);
    if (photoOverlay) photoOverlay.addEventListener("click", showPhotoModal);
    if (uploadPhotoBtn)
      uploadPhotoBtn.addEventListener("click", () => uploadInput?.click());
    if (resetPhotoBtn)
      resetPhotoBtn.addEventListener("click", showConfirmDialog);
    if (cancelPhotoBtn)
      cancelPhotoBtn.addEventListener("click", hidePhotoModal);
    if (uploadInput) uploadInput.addEventListener("change", handlePhotoUpload);

    if (photoModal) {
      photoModal.addEventListener("click", (e) => {
        if (e.target === photoModal) {
          hidePhotoModal();
        }
      });
    }

    if (editBtn) editBtn.addEventListener("click", handleEditProfile);
    if (saveBtn) saveBtn.addEventListener("click", handleSaveProfile);
    if (cancelBtn) cancelBtn.addEventListener("click", handleCancelEdit);

    editInputs.forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSaveProfile();
        }
      });
    });

    console.log("Event listeners setup completed");
  };

  const init = () => {
    if (typeof document === "undefined") return;

    const waitForElements = () => {
      const requiredElements = [
        "profile-photo-preview",
        "change-photo-btn",
        "edit-profile-btn",
        "display-name",
      ];
      return requiredElements.every((id) => document.getElementById(id));
    };

    const trySetup = () => {
      if (waitForElements()) {
        setupEventListeners();
        loadAndDisplayPhoto();
        loadAndDisplayProfile();
        return true;
      }
      return false;
    };

    if (trySetup()) return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        if (!trySetup()) {
          const observer = new MutationObserver(() => {
            if (trySetup()) observer.disconnect();
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    } else {
      const observer = new MutationObserver(() => {
        if (trySetup()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };

  init();

  return {
    init,
    loadAndDisplayPhoto,
    loadAndDisplayProfile,
    resetToDefault,
    handleEditProfile,
    handleSaveProfile,
    handleCancelEdit,
    updateUserProfile,
    loadUserProfile,
  };
}
