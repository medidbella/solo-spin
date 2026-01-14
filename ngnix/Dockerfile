FROM nginx:alpine

# Remove default nginx config
RUN apk add --no-cache openssl
RUN rm /etc/nginx/nginx.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
COPY terms-of-service.html /usr/share/nginx/html/terms-of-service.html
RUN chmod +x /entrypoint.sh

# Create custom error pages directory
RUN mkdir -p /usr/share/nginx/html

# Add basic error pages
RUN echo "<h1>404 - Page Not Found</h1>" > /usr/share/nginx/html/404.html
RUN echo "<h1>50x - Server Error</h1>" > /usr/share/nginx/html/50x.html

EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]
