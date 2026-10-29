# ---- Build ----
FROM node:26-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# ---- Run ----
# nginx sadece dosya sunucusu ve /api yönlendiricisi olarak çalışır (nginx.conf).
FROM nginx:1.30-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist/client/browser /usr/share/nginx/html
EXPOSE 80

# localhost değil 127.0.0.1: alpine'da localhost önce ::1'e çözülür, nginx ise sadece IPv4'te dinler.
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
