# QLever Indexing HTTP Server

A minimal Node.js Express HTTP server, ready for Docker deployment.

## Features
- Express.js HTTP server
- Dockerfile for containerization
- E2E test

## Getting Started

### Install dependencies
```bash
npm install
```

### Run tests
```bash
npm test:e2e
```

### Start the server
```bash
npm start
```

Server runs on port 3000 by default.


## Docker Usage

### Build the Docker image
```bash
docker build -t qlever-indexing-server .
```

### Run the Docker container
```bash
docker run -p 3000:3000 qlever-indexing-server
```

---

MIT License
