# Use official Nginx stable alpine image for production deployment
FROM nginx:stable-alpine

# Remove default Nginx virtual host configurations
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration mapping reverse-proxy routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend static web portal files
COPY index.html /usr/share/nginx/html/index.html
COPY app.js /usr/share/nginx/html/app.js
COPY styles.css /usr/share/nginx/html/styles.css

# Expose port 80 for entrance web traffic
EXPOSE 80

# Execute Nginx in the foreground to keep the container running
CMD ["nginx", "-g", "daemon off;"]
