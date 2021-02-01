FROM node:10-slim
WORKDIR /server
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install
RUN apt-get update -qq && apt-get install -y yarn && apt-get -y --no-install-recommends install curl
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
COPY . .
EXPOSE 8000
CMD ["yarn", "dev"]