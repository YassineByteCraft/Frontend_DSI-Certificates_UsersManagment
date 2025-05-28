# Stage 1: Build the React app
FROM node:18 AS build
WORKDIR /app

# Declare a build argument for the backend URL
ARG REACT_APP_BACKEND_URL # Keep this ARG

# Make the build argument available as an environment variable during the build process
# THIS LINE IS THE FIX: Use the ARG variable here, not hardcode localhost
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

COPY package*.json ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY . .
RUN npm install && npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

