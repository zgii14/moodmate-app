import {
  getAccessToken,
  removeAccessToken,
  isAuthenticated,
  decodeToken,
  isTokenExpired,
} from "../utils/auth.js";
import ApiService from "../data/api.js";

export const UserModel = {
  getCurrent() {
    try {
      const userData = localStorage.getItem("moodmate-user");
      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      if (!user || typeof user !== "object") {
        this.cleanupInvalidSession();
        return null;
      }

      if (!user.email) {
        this.cleanupInvalidSession();
        return null;
      }

      if (!user.joined && !user.createdAt && !user.created_at) {
        user.joined = new Date().toISOString();
        localStorage.setItem("moodmate-user", JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      this.cleanupInvalidSession();
      return null;
    }
  },

  async getProfile() {
    try {
      if (!isAuthenticated()) {
        console.warn("User not authenticated, cannot get profile");
        return null;
      }

      const response = await ApiService.getUserProfile();

      if (response.error) {
        console.error("Error getting user profile:", response.message);

        if (response.status === 401) {
          this.logout();
        }

        return null;
      }

      let userData = null;
      if (response.data && response.data.user) {
        userData = response.data.user;
      } else if (response.user) {
        userData = response.user;
      } else if (response.data) {
        userData = response.data;
      } else {
        userData = response;
      }

      if (!userData || typeof userData !== "object" || !userData.email) {
        console.error("Invalid user data received from API:", userData);
        return null;
      }

      if (!userData.joined && !userData.createdAt && !userData.created_at) {
        const existingUser = this.getCurrent();
        if (existingUser && existingUser.joined) {
          userData.joined = existingUser.joined;
        } else {
          userData.joined = new Date().toISOString();
        }
      }

      try {
        localStorage.setItem("moodmate-user", JSON.stringify(userData));
      } catch (storageError) {
        console.error(
          "Failed to save user data to localStorage:",
          storageError,
        );
      }

      return userData;
    } catch (error) {
      console.error("Error fetching user profile:", error);

      if (error.message && error.message.includes("401")) {
        this.logout();
      }

      return null;
    }
  },

  logout() {
    try {
      removeAccessToken();
      this.cleanupInvalidSession();

      location.hash = "/login";

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      location.hash = "/login";
    }
  },

  cleanupInvalidSession() {
    try {
      localStorage.removeItem("moodmate-logged-in");
      localStorage.removeItem("moodmate-current-user");
      localStorage.removeItem("moodmate-user");
      localStorage.removeItem("profile_photo");
      localStorage.removeItem("temp-user-data");

      console.log("Invalid session cleaned up");
    } catch (error) {
      console.error("Error during session cleanup:", error);
    }
  },

  isLoggedIn() {
    try {
      const hasValidToken = isAuthenticated();

      if (!hasValidToken) {
        this.cleanupInvalidSession();
        return false;
      }

      const userData = this.getCurrent();
      if (!userData || !userData.email) {
        this.cleanupInvalidSession();
        return false;
      }

      const token = getAccessToken();
      if (token && isTokenExpired(token)) {
        console.warn("Token has expired");
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking login status:", error);
      this.cleanupInvalidSession();
      return false;
    }
  },

  setCurrentUser(userData) {
    try {
      if (!userData || typeof userData !== "object" || !userData.email) {
        console.error("Invalid user data, cannot set current user:", userData);
        return false;
      }

      if (typeof userData.email !== "string" || !userData.email.includes("@")) {
        console.error("Invalid email format:", userData.email);
        return false;
      }

      if (!userData.joined && !userData.createdAt && !userData.created_at) {
        userData.joined = new Date().toISOString();
      }

      localStorage.setItem("moodmate-user", JSON.stringify(userData));
      localStorage.setItem("moodmate-logged-in", "true");
      localStorage.setItem("moodmate-current-user", userData.email);

      console.log("Current user set successfully:", userData.email);
      return true;
    } catch (error) {
      console.error("Failed to set current user:", error);
      return false;
    }
  },

  updateUser(updateData) {
    try {
      if (!updateData || typeof updateData !== "object") {
        console.error("Invalid update data:", updateData);
        return false;
      }

      const currentUser = this.getCurrent();
      if (!currentUser) {
        console.error("No current user found to update");
        return false;
      }

      const updatedUser = {
        ...currentUser,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("moodmate-user", JSON.stringify(updatedUser));

      console.log(
        "User data updated successfully in localStorage:",
        updatedUser,
      );
      return true;
    } catch (error) {
      console.error("Error updating user data:", error);
      return false;
    }
  },

  getCurrentUserEmail() {
    try {
      const email = localStorage.getItem("moodmate-current-user");

      if (email && typeof email === "string" && email.includes("@")) {
        return email;
      }

      const userData = this.getCurrent();
      if (userData && userData.email) {
        localStorage.setItem("moodmate-current-user", userData.email);
        return userData.email;
      }

      return null;
    } catch (error) {
      console.error("Error getting current user email:", error);
      return null;
    }
  },

  getFormattedJoinDate() {
    try {
      const user = this.getCurrent();
      if (!user) return "Tanggal tidak tersedia";

      const dateString = user.joined || user.createdAt || user.created_at;
      if (!dateString || dateString === "undefined" || dateString === "null") {
        return "Tanggal tidak tersedia";
      }

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
      console.error("Error formatting join date:", error);
      return "Tanggal tidak tersedia";
    }
  },

  async validateSession() {
    try {
      const token = getAccessToken();

      if (!token) {
        console.warn("No access token found");
        this.logout();
        return false;
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        this.logout();
        return false;
      }

      if (isTokenExpired(token)) {
        console.warn("Token has expired");
        this.logout();
        return false;
      }

      const profile = await this.getProfile();

      if (!profile) {
        console.error("Failed to get profile, session invalid");
        this.logout();
        return false;
      }

      if (!profile.email) {
        console.error("Profile data invalid, no email found");
        this.logout();
        return false;
      }

      console.log("Session validation successful");
      return true;
    } catch (error) {
      console.error("Session validation failed:", error);
      this.logout();
      return false;
    }
  },

  async refreshUserData() {
    try {
      if (!this.isLoggedIn()) {
        console.warn("User not logged in, cannot refresh data");
        return null;
      }

      const profile = await this.getProfile();
      if (profile && profile.email) {
        this.setCurrentUser(profile);
        console.log("User data refreshed successfully");
        return profile;
      }

      console.warn("Failed to refresh user data");
      return null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  },

  updateProfilePhoto(photoData) {
    try {
      if (photoData && typeof photoData === "string") {
        if (
          photoData.startsWith("data:image/") ||
          photoData.startsWith("http")
        ) {
          localStorage.setItem("profile_photo", photoData);

          const currentUser = this.getCurrent();
          if (currentUser) {
            currentUser.profilePhoto = photoData;
            localStorage.setItem("moodmate-user", JSON.stringify(currentUser));
          }

          console.log("Profile photo updated successfully");
        } else {
          console.error("Invalid photo data format");
        }
      } else {
        localStorage.removeItem("profile_photo");

        const currentUser = this.getCurrent();
        if (currentUser) {
          currentUser.profilePhoto = null;
          localStorage.setItem("moodmate-user", JSON.stringify(currentUser));
        }

        console.log("Profile photo removed");
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
    }
  },

  getProfilePhoto() {
    try {
      const photo = localStorage.getItem("profile_photo");

      if (
        photo &&
        (photo.startsWith("data:image/") || photo.startsWith("http"))
      ) {
        return photo;
      }

      return null;
    } catch (error) {
      console.error("Error getting profile photo:", error);
      return null;
    }
  },

  forceLogout() {
    try {
      localStorage.clear();

      removeAccessToken();

      location.hash = "/login";

      console.log("Force logout completed");
    } catch (error) {
      console.error("Error during force logout:", error);
      // Tetap redirect
      location.hash = "/login";
    }
  },

  async checkSessionHealth() {
    try {
      const token = getAccessToken();
      if (!token) return { healthy: false, reason: "No token" };

      if (isTokenExpired(token))
        return { healthy: false, reason: "Token expired" };

      const userData = this.getCurrent();
      if (!userData) return { healthy: false, reason: "No user data" };

      if (!userData.email)
        return { healthy: false, reason: "Invalid user data" };

      const profile = await this.getProfile();
      if (!profile) return { healthy: false, reason: "Cannot fetch profile" };

      return { healthy: true, reason: "Session is healthy" };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
  },

  getAll() {
    console.warn("UserModel.getAll() is deprecated. Use API instead.");
    return [];
  },

  find(email, password) {
    console.warn("UserModel.find() is deprecated. Use API login instead.");
    return null;
  },

  save(user) {
    console.warn("UserModel.save() is deprecated. Use API register instead.");
    return false;
  },
};
