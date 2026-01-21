# QLever Indexing HTTP Server

A minimal Node.js Express HTTP server, ready for Docker deployment.

## Features
The server expects a POST request where the payload is the content of a turtle file.

The blob response is the qlever index for the input file, including the data
corresponding to the queries specified in the file [config.yml](./config.yml).

## Docker Usage

### Build the Docker image
```bash
docker build -t qlever-indexing-server .
```

### Run the Docker container
```bash
docker run -p 3000:3000 qlever-indexing-server
```

### Test with sample files

```bash

curl -X POST http://localhost:3000/index --output file1.blob --data-binary @test/file1.ttl
curl -X POST http://localhost:3000/index --output file2.blob --data-binary @test/file2.ttl

``` 

