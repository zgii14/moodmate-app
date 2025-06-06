# Dockerfile - Final Version for Frontend

### TAHAP 1: BUILD ASET FRONTEND ###
# Menggunakan base image Node.js yang ringan
FROM node:18-alpine as builder

# Menentukan direktori kerja di dalam container
WORKDIR /app

# Salin file-file package manager terlebih dahulu untuk caching
COPY package*.json ./

# Salin SEMUA file konfigurasi yang dibutuhkan oleh Webpack dan PostCSS/Tailwind
# Ini adalah perbaikan utamanya
COPY webpack.*.js ./
COPY tailwind.config.js .
COPY postcss.config.js .

# Install semua dependencies dari package.json
RUN npm install

# Salin seluruh isi folder src (source code)
# Ini termasuk config.js yang ada di dalamnya
COPY ./src ./src

# Jalankan perintah build untuk production
RUN npm run build

### TAHAP 2: SAJIKAN DENGAN NGINX ###
# Menggunakan base image Nginx yang sangat ringan
FROM nginx:stable-alpine

# Salin HANYA hasil build (folder 'dist') dari tahap sebelumnya ke folder web Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Ekspos port 80 (port default Nginx)
EXPOSE 80

# Perintah untuk menjalankan server Nginx
CMD ["nginx", "-g", "daemon off;"]

