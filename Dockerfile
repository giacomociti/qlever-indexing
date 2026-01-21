# Start from a QLever image built from https://github.com/ad-freiburg/qlever/pull/2642
FROM ghcr.io/giacomociti/qlever:2642 as base

# Install Node.js 
USER root
RUN apt-get update \
	&& apt-get install -y curl zip \
	&& curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
	&& apt-get install -y nodejs \
	&& rm -rf /var/lib/apt/lists/*

# Set up app directory and install as root
WORKDIR /app
COPY package*.json ./
COPY config.yml ./
RUN npm install --production
COPY src ./src

EXPOSE 3000
# Override the QLever entrypoint to run the Node.js server
ENTRYPOINT []
CMD ["node", "src/server.js"]
