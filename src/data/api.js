import CONFIG from "../config";
import { getAccessToken, setAccessToken } from "../utils/auth";

const API = {
  REGISTER: `${CONFIG.BASE_URL}/auth/register`,
  LOGIN: `${CONFIG.BASE_URL}/auth/login`,
  REFRESH: `${CONFIG.BASE_URL}/auth/refresh`,
  GET_PROFILE: `${CONFIG.BASE_URL}/auth/profile`,
  LOGOUT: `${CONFIG.BASE_URL}/auth/logout`,

  HEALTH_CHECK: `${CONFIG.BASE_URL}/health`,
};

class ApiService {
  static getAuthHeaders() {
    const token = getAccessToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async makeAuthenticatedRequest(url, options = {}) {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      const refreshSuccess = await this.refreshToken();

      if (refreshSuccess) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });
      } else {
        this.handleAuthFailure();
        throw new Error("Authentication failed");
      }
    }

    return response;
  }

  static async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(API.REFRESH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();

      if (result.success && result.data.token) {
        localStorage.setItem("accessToken", result.data.token);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        console.log("Token refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  static handleAuthFailure() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("moodmate-user");
    localStorage.removeItem("moodmate-logged-in");
    localStorage.removeItem("moodmate-current-user");

    setTimeout(() => {
      location.hash = "/login";
    }, 1000);
  }

  static async register({ name, email, password }) {
    try {
      const response = await fetch(API.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      console.log("Register Response Status:", response.status);
      console.log("Register Response OK:", response.ok);

      const result = await response.json();
      console.log("Register Response Data:", result);

      if (!response.ok) {
        return {
          error: true,
          status: response.status,
          message:
            result.message ||
            result.error ||
            `HTTP Error ${response.status}` ||
            "Pendaftaran gagal",
          data: result,
        };
      }

      if (
        result.error ||
        result.success === false ||
        result.status === "error"
      ) {
        return {
          error: true,
          message: result.message || result.error || "Pendaftaran gagal",
          data: result,
        };
      }

      return {
        error: false,
        success: true,
        message: result.message || "Pendaftaran berhasil",
        data: result,
      };
    } catch (error) {
      console.error("Register Network Error:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
          error: true,
          message: "Tidak dapat terhubung ke server. Periksa koneksi internet.",
        };
      }

      return {
        error: true,
        message: "Terjadi kesalahan jaringan saat mendaftar",
      };
    }
  }

  static async login({ email, password }) {
    try {
      const response = await fetch(API.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("Login Response Status:", response.status);
      console.log("Login Response OK:", response.ok);

      const result = await response.json();
      console.log("Login Response Data:", result);

      if (!response.ok) {
        return {
          error: true,
          status: response.status,
          message:
            result.message ||
            result.error ||
            `Login gagal. ${
              response.status === 401
                ? "Email atau kata sandi salah."
                : "Terjadi kesalahan server."
            }`,
          data: result,
        };
      }

      if (
        result.error ||
        result.success === false ||
        result.status === "error"
      ) {
        return {
          error: true,
          status: result.status || response.status,
          message:
            result.message ||
            result.error ||
            "Login gagal. Email atau kata sandi salah.",
          data: result,
        };
      }

      let token = null;
      let refreshToken = null;

      const tokenPaths = [
        result.data?.token,
        result.data?.accessToken,
        result.token,
        result.accessToken,
        result.data?.access_token,
        result.access_token,
      ];

      token = tokenPaths.find(
        (t) => t && typeof t === "string" && t.length > 0
      );

      const refreshTokenPaths = [
        result.data?.refreshToken,
        result.data?.refresh_token,
        result.refreshToken,
        result.refresh_token,
      ];

      refreshToken = refreshTokenPaths.find(
        (t) => t && typeof t === "string" && t.length > 0
      );

      if (!token) {
        return {
          error: true,
          message: "Login gagal. Token tidak ditemukan dalam response server.",
          data: result,
        };
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        return {
          error: true,
          message: "Login gagal. Format token tidak valid.",
          data: result,
        };
      }

      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      console.log("Tokens saved successfully");

      return {
        error: false,
        success: true,
        message: result.message || "Login berhasil",
        data: result,
        user: result.data?.user || result.user,
        token: token,
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.error("Login Network Error:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
          error: true,
          message: "Tidak dapat terhubung ke server. Periksa koneksi internet.",
        };
      }

      return {
        error: true,
        message: "Terjadi kesalahan jaringan saat login",
      };
    }
  }

  static async getUserProfile() {
    try {
      const response = await this.makeAuthenticatedRequest(API.GET_PROFILE, {
        method: "GET",
      });

      return response.json();
    } catch (error) {
      console.error("Get User Profile Error:", error);
      return {
        error: true,
        message: "Terjadi kesalahan saat mengambil profil user",
      };
    }
  }

  static async createJournalEntry({
    catatan,
    mood,
    aktivitas = [],
    detailAktivitas = {},
  }) {
    try {
      const response = await this.makeAuthenticatedRequest(API.CREATE_JOURNAL, {
        method: "POST",
        body: JSON.stringify({
          catatan,
          mood,
          aktivitas,
          detailAktivitas,
        }),
      });

      return response.json();
    } catch (error) {
      console.error("Create Journal Entry Error:", error);
      return {
        error: true,
        message: "Terjadi kesalahan saat membuat journal entry",
      };
    }
  }

  static async predictMood(text) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${CONFIG.BASE_URL}/predict-mood`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return await response.json();
    } catch (error) {
      console.error("Predict Mood Error:", error);
      return {
        error: true,
        message: error.message || "Failed to analyze mood",
      };
    }
  }

  static async healthCheck() {
    try {
      const response = await fetch(API.HEALTH_CHECK, {
        method: "GET",
      });

      return response.json();
    } catch (error) {
      console.error("Health Check Error:", error);
      return {
        error: true,
        message: "Terjadi kesalahan saat health check",
      };
    }
  }

  static async logout() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await fetch(API.LOGOUT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("moodmate-user");
      localStorage.removeItem("moodmate-logged-in");
      localStorage.removeItem("moodmate-current-user");

      import("../utils/auth").then(({ removeAccessToken }) => {
        removeAccessToken();
      });
    }
  }

  static isLoggedIn() {
    const token = getAccessToken();
    const refreshToken = localStorage.getItem("refreshToken");
    return !!(token || refreshToken);
  }

  static async checkAuth() {
    const token = getAccessToken();
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token && !refreshToken) {
      return false;
    }

    if (!token && refreshToken) {
      return await this.refreshToken();
    }

    return true;
  }
}

export default ApiService;
