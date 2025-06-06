### TAHAP 1: BUILD ASET FRONTEND ###
FROM node:18-alpine as builder
WORKDIR /app

# Salin file package.json terlebih dahulu
COPY package*.json ./ 

# PERBAIKAN: Salin config.js dari folder src/
COPY src/config.js . 

# Lanjutkan sisa proses
COPY webpack.dev.js .
RUN npm install
COPY ./src ./src
RUN npm run build

### TAHAP 2: SAJIKAN DENGAN NGINX ###
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]