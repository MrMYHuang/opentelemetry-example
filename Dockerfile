FROM node:16
SHELL ["/bin/bash", "-c"]
WORKDIR /data
COPY . .
EXPOSE 8080
RUN npm i && npm run build
CMD [ "bash", "-c", "npm run start" ]