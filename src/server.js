import express from 'express';
import { exec } from 'child_process';
import YAML from 'yaml'
import fs from 'fs/promises';
import path from 'path';

const __dirname = path.resolve();
const configFilePath = path.join(__dirname, 'config.yml');
const file = await fs.readFile(configFilePath, 'utf8')
const configObject = YAML.parse(file)
const jsonConfigFile = path.join(__dirname, 'config.json');
await fs.writeFile(jsonConfigFile, JSON.stringify(configObject, null, 2))
console.log(configObject)

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello, world!' });
});

// Middleware to parse raw body for POST /index
app.use('/index', express.raw({ type: '*/*' , limit: '500mb' }));

// command to create qlever index
const getCommand = (inputFiles, outputFile) =>{
  const config = `$(cat ${jsonConfigFile})`
  return `CreateBlobMain -i index-basename -j "${config}" -o ${outputFile} ${inputFiles.map(f => `-f ${f}`).join(' ')}`
}

// POST /index?file1=10&file2=20
app.post('/index', async (req, res) => {
  try {
    // Use URLSearchParams to preserve order
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    const files = Array.from(url.searchParams.entries()); // [[file1, '10'], [file2, '20']]
    // Ensure req.body is a Buffer
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    let offset = 0;
    for (const [filename, sizeStr] of files) {
      console.log(`Processing file: ${filename} with size: ${sizeStr}`);
      const size = parseInt(sizeStr, 10);
      if (isNaN(size) || size < 0) {
        return res.status(400).json({ error: `Invalid size for ${filename}` });
      }
      const data = body.slice(offset, offset + size);
      await fs.writeFile(path.join(process.cwd(), filename), data)
      offset += size;
    }
    if (offset !== body.length) {
      return res.status(400).json({ error: 'Body size does not match sum of file sizes' });
    }

    const inputFiles = files.map(([name]) => name)
    const outputFile = `files_${Date.now()}.blob`;
    const command = getCommand(inputFiles, outputFile);
    console.log(`Executing command: ${command}`);

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return res.status(500).json({ error: 'Error executing command' });
      }
      try {
        const outputFilePath = path.join(process.cwd(), outputFile);
        const responseBuffer = await fs.readFile(outputFilePath);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFile}"`);
        res.status(200).send(responseBuffer);
        // Clean up files (async, after response)
        Promise.all([
          fs.unlink(outputFilePath),
          ...inputFiles.map(f => fs.unlink(path.join(process.cwd(), f)))
        ]).catch(console.error);
      } catch (err) {
        console.error(`Error reading output file: ${err.message}`);
        res.status(500).json({ error: err.message });
      }
    });
  } catch (err) {
    console.error(`Error processing request: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
