FROM node:8
EXPOSE 8080

WORKDIR /home/posTerminal/app

COPY package*.json ./
RUN npm install

COPY main.js ./main.js
COPY src ./src
COPY lib ./lib
COPY public ./public

COPY LICENSE ./LICENSE

COPY example_data ./data

CMD ["node", "main.js"]
