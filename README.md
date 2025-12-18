# QLever Indexing HTTP Server

A minimal Node.js Express HTTP server, ready for Docker deployment.



## Features
The server expects a POST request where the payload is the concatenated content
of multiple files, and the URL lists the file names with their size as query paramenetrs.
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
cd ./test
``` 

The test directory contains example files:

- config.json, 64 bytes
- file1.ttl, 92 bytes
- file2.ttl, 60 bytes

The server must be called with their concatenation, indicating their size in the query string:

```bash

cat ./config.json ./file1.ttl ./file2.ttl
| curl -X POST "http://localhost:3000/index?config.json=64&file1.ttl=92&file2.ttl=60" -H "Content-Type: application/octet-stream" --data-binary @- --output out.zip
``` 

In the current implementation, the response is simply a zipped archive of the input data.
The zip command in [server.js](./src/server.js) will be replaced with the qlever command to create the index file.

There is also a helper command that takes a list of files and makes the curl request with the proper file sizes in the URL:
```bash
./post.sh ./config.json ./file1.ttl ./file2.ttl
``` 
