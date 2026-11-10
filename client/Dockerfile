# İki ayrı imaj aynı Dockerfile'dan çıkar; hangisi olduğu SURFACE build argümanıyla seçilir:
#   docker build --build-arg SURFACE=public   .   → public tanıtım sayfası + Mezun Portalı (dışarıya açık)
#   docker build --build-arg SURFACE=internal .   → yönetim paneli (kapalı ağ)
# Dışarıya açık imaja yönetim panelinin kodu hiç girmez (angular.json fileReplacements).

# ---- Build ----
FROM node:26-alpine AS build
ARG SURFACE
RUN case "$SURFACE" in public|internal) ;; *) echo "SURFACE build argümanı public ya da internal olmalı" >&2; exit 1 ;; esac
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production,${SURFACE}

# ---- Run ----
# nginx sadece dosya sunucusu ve /api yönlendiricisi olarak çalışır (nginx/<surface>.conf.template).
FROM nginx:1.30-alpine
ARG SURFACE
# Aynı yüzeydeki server'ın adresi; compose dosyaları servis adına göre verir.
ENV API_UPSTREAM=server:8080
COPY nginx/${SURFACE}.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /build/dist/client/browser /usr/share/nginx/html
EXPOSE 80

# localhost değil 127.0.0.1: alpine'da localhost önce ::1'e çözülür, nginx ise sadece IPv4'te dinler.
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
