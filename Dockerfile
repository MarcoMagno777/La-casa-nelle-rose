FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM composer:2 AS vendor
WORKDIR /app
COPY backend/composer.json ./
COPY backend/composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

FROM php:8.3-fpm-alpine
RUN apk add --no-cache nginx supervisor oniguruma-dev \
    && docker-php-ext-install pdo pdo_mysql

WORKDIR /var/www/html
COPY backend/ /var/www/html/
COPY --from=vendor /app/vendor /var/www/html/vendor
COPY --from=frontend /app/dist/maison-des-roses/browser /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/supervisord.conf /etc/supervisord.conf

RUN mkdir -p /var/www/html/public/uploads \
    && chown -R www-data:www-data /var/www/html /usr/share/nginx/html
EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
