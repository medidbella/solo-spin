FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/nginx.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create custom error pages directory
RUN mkdir -p /usr/share/nginx/html

# Add basic error pages
RUN echo "<h1>404 - Page Not Found</h1>" > /usr/share/nginx/html/404.html
RUN echo "<h1>50x - Server Error</h1>" > /usr/share/nginx/html/50x.html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
