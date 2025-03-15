FROM node:18

WORKDIR /shell

COPY package*.json ./

RUN npm install

COPY . .

# COPY wait-for-it.sh /usr/local/bin/

# RUN chmod +x /usr/local/bin/wait-for-it.sh

EXPOSE 80

# CMD wait-for-it.sh db:5432 --timeout=60 -- \
#     npx @better-auth/cli generate --y && npx @better-auth/cli migrate --y && npx prisma generate && npx prisma migrate dev && node server.js

CMD node runner.js
    