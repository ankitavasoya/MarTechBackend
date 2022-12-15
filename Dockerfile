FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
      then npm install; \
      else npm install --only=production; \
      fi
COPY . .
RUN npm run build:prod
EXPOSE 4000
#CMD ["npm", "run", "dev"]
#############################
FROM ubuntu:latest
MAINTAINER Shivam Nanda
RUN apt-get update && apt-get -y install cron curl sudo
RUN curl -sL https://rpm.nodesource.com/setup_14.x
RUN apt-get -y install nodejs
#Copy Script to Container
COPY src/bin/campaign-call.cron.js /app/bin/campaign-call.cron.js
# Copy cron file to the cron.d directory
COPY src/cron/cron /etc/cron.d/cron
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/cron
# Apply cron job
RUN crontab /etc/cron.d/cron
# Create the log file to be able to run tail
RUN touch /var/log/cron.log
# Run the command on container startup
CMD ["cron", "-f"]
