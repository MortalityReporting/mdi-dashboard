FROM node:26.3.0-alpine AS build
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set BASE_HREF at build time
ARG BASE_HREF="/"
RUN npm run build -- \
    --base-href=$BASE_HREF

# Stage 2: Nginx
FROM nginx:1.27-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

ARG BASE_HREF="/"
ENV BASE_HREF=$BASE_HREF

# Copy built Angular app
COPY --from=build /app/dist/raven/ /usr/share/nginx/html${BASE_HREF}

# Copy nginx template
COPY nginx.conf.template /etc/nginx/templates/

RUN envsubst '$BASE_HREF' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]