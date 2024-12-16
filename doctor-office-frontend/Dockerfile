//Previous file: doctor-office-backend/Dockerfile - https://github.com/vi-kinn/Doctors-Office-Appointment-site/blob/main/doctor-office-backend/Dockerfile

FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application into the container
COPY . .

# Build the application
RUN npm run build

# Install serve globally to serve the static files
RUN npm install -g serve

# Command to run the application using serve
CMD ["serve", "-s", "build", "-l", "3000"]

# Expose the port the app runs on
EXPOSE 3000

//Changes: Updated to ensure that the frontend is properly built and served using serve. The final app runs on port 3000 inside the container.
