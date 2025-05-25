const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Bcrypt = require("bcrypt");
const fetch = require("node-fetch");

let users = [];
let idCounter = 1;

const JWT_SECRET = "moodmate-secret-key-2024";

const generateId = () => `id_${Date.now()}_${idCounter++}`;
const getCurrentDate = () => new Date().toISOString();

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
      maxAgeSec: 14400,
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

      // Check if user exists
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

      const token = Jwt.token.generate(
        {
          id: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60,
        },
        JWT_SECRET
      );

      return {
        success: true,
        message: "Login berhasil",
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      };
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

  await server.start();
  console.log("🚀 MoodMate Auth API Server running on %s", server.info.uri);
  console.log("📋 Available Endpoints:");
  console.log("   - Health Check: GET /api/health");
  console.log("   - Register: POST /api/auth/register");
  console.log("   - Login: POST /api/auth/login");
  console.log("   - Profile: GET /api/auth/profile");
  console.log("   - Predict Mood: POST /api/predict-mood");
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
