FROM node:8
EXPOSE 8080

WORKDIR /home/posTerminal/

COPY LICENSE ./

COPY package*.json ./
RUN npm install

COPY main.js ./
COPY src ./
COPY lib ./
COPY public ./

COPY example_data ./data

CMD ["node", "main.js"]
