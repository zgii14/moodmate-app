const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Bcrypt = require("bcrypt");
const fetch = require("node-fetch");

let users = [];
let refreshTokens = new Set();
let idCounter = 1;

const JWT_SECRET = "moodmate-secret-key-2024";
const REFRESH_TOKEN_SECRET = "moodmate-refresh-secret-key-2024";

const generateId = () => `id_${Date.now()}_${idCounter++}`;
const getCurrentDate = () => new Date().toISOString();

const generateRefreshToken = (userId) => {
  return Jwt.token.generate(
    {
      id: userId,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    },
    REFRESH_TOKEN_SECRET
  );
};

const validate = (decoded, request, h) => {
  const user = users.find((u) => u.id === decoded.id);
  if (user) {
    return { isValid: true, credentials: { user } };
  }
  return { isValid: false };
};

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
        exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
        additionalExposedHeaders: ["Accept"],
        maxAge: 60,
        additionalHeaders: ["cache-control", "x-requested-with"],
      },
    },
  });

  await server.register(Jwt);

  server.auth.strategy("jwt", "jwt", {
    keys: JWT_SECRET,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 86400,
      timeSkewSec: 15,
    },
    validate,
  });

  server.auth.default("jwt");

  server.route({
    method: "GET",
    path: "/api/health",
    options: { auth: false },
    handler: (request, h) => {
      return {
        status: "OK",
        message: "MoodMate Auth API is running",
        timestamp: getCurrentDate(),
      };
    },
  });

  server.route({
    method: "POST",
    path: "/api/auth/register",
    options: { auth: false },
    handler: async (request, h) => {
      const { name, email, password } = request.payload;

      if (users.find((u) => u.email === email)) {
        return h
          .response({
            success: false,
            message: "Email sudah terdaftar",
          })
          .code(400);
      }

      const hashedPassword = await Bcrypt.hash(password, 10);

      const user = {
        id: generateId(),
        name,
        email,
        password: hashedPassword,
        createdAt: getCurrentDate(),
      };

      users.push(user);

      return {
        success: true,
        message: "User berhasil didaftarkan",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    },
  });

  server.route({
    method: "POST",
    path: "/api/auth/login",
    options: { auth: false },
    handler: async (request, h) => {
      const { email, password } = request.payload;

      const user = users.find((u) => u.email === email);
      if (!user) {
        return h
          .response({
            success: false,
            message: "Email atau password salah",
          })
          .code(401);
      }

      const isValid = await Bcrypt.compare(password, user.password);
      if (!isValid) {
        return h
          .response({
            success: false,
            message: "Email atau password salah",
          })
          .code(401);
      }

      const accessToken = Jwt.token.generate(
        {
          id: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        JWT_SECRET
      );

      const refreshToken = generateRefreshToken(user.id);
      refreshTokens.add(refreshToken);

      return {
        success: true,
        message: "Login berhasil",
        data: {
          token: accessToken,
          refreshToken: refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          },
        },
      };
    },
  });

  server.route({
    method: "POST",
    path: "/api/auth/refresh",
    options: { auth: false },
    handler: async (request, h) => {
      const { refreshToken } = request.payload;

      if (!refreshToken || !refreshTokens.has(refreshToken)) {
        return h
          .response({
            success: false,
            message: "Invalid refresh token",
          })
          .code(401);
      }

      try {
        const decoded = Jwt.token.decode(refreshToken);
        const payload = Jwt.token.verify(decoded, REFRESH_TOKEN_SECRET);

        if (payload.type !== "refresh") {
          throw new Error("Invalid token type");
        }

        const user = users.find((u) => u.id === payload.id);
        if (!user) {
          throw new Error("User not found");
        }

        const newAccessToken = Jwt.token.generate(
          {
            id: user.id,
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          },
          JWT_SECRET
        );

        const newRefreshToken = generateRefreshToken(user.id);

        refreshTokens.delete(refreshToken);
        refreshTokens.add(newRefreshToken);

        return {
          success: true,
          message: "Token refreshed successfully",
          data: {
            token: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              createdAt: user.createdAt,
            },
          },
        };
      } catch (error) {
        console.error("Refresh token error:", error);
        return h
          .response({
            success: false,
            message: "Invalid refresh token",
          })
          .code(401);
      }
    },
  });

  server.route({
    method: "GET",
    path: "/api/auth/profile",
    handler: (request, h) => {
      const { user } = request.auth.credentials;
      return {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    },
  });

  server.route({
    method: "POST",
    path: "/api/predict-mood",
    options: { auth: "jwt" },
    handler: async (request, h) => {
      try {
        console.log("Received prediction request:", request.payload);

        const mlResponse = await fetch("http://localhost:8080/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: request.payload.text }),
        });

        console.log("ML Service response status:", mlResponse.status);

        if (!mlResponse.ok) {
          const error = await mlResponse.json();
          console.log("ML Service error:", error);
          throw new Error(error.detail);
        }

        const result = await mlResponse.json();
        console.log("ML Service result:", result);

        return result;
      } catch (error) {
        console.error("Prediction error:", error);
        return h
          .response({
            success: false,
            message: "Prediction failed: " + error.message,
          })
          .code(500);
      }
    },
  });

  server.route({
    method: "POST",
    path: "/api/auth/logout",
    options: { auth: false },
    handler: async (request, h) => {
      const { refreshToken } = request.payload;

      if (refreshToken) {
        refreshTokens.delete(refreshToken);
      }

      return {
        success: true,
        message: "Logout berhasil",
      };
    },
  });

  await server.start();
  console.log("🚀 MoodMate Auth API Server running on %s", server.info.uri);
  console.log("📋 Available Endpoints:");
  console.log("   - Health Check: GET /api/health");
  console.log("   - Register: POST /api/auth/register");
  console.log("   - Login: POST /api/auth/login");
  console.log("   - Refresh Token: POST /api/auth/refresh");
  console.log("   - Profile: GET /api/auth/profile");
  console.log("   - Logout: POST /api/auth/logout");
  console.log("   - Predict Mood: POST /api/predict-mood");
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
