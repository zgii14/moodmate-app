### TAHAP 1: BUILD ASET FRONTEND ###
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json .
COPY config.js .
RUN npm install
COPY ./src ./src
# Sesuaikan perintah build jika berbeda
RUN npm run build

### TAHAP 2: SAJIKAN DENGAN NGINX ###
FROM nginx:stable-alpine
# Salin hasil build dari tahap sebelumnya ke folder web Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Ekspos port 80 (port default Nginx)
EXPOSE 80
# Perintah untuk menjalankan Nginx
CMD ["nginx", "-g", "daemon off;"]