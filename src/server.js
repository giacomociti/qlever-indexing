import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import YAML from 'yaml'
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const __dirname = path.resolve();
const configFilePath = path.join(__dirname, 'config.yml');
const file = await fs.readFile(configFilePath, 'utf8')
const configObject = YAML.parse(file)
const jsonConfigFile = path.join(__dirname, 'config.json');
await fs.writeFile(jsonConfigFile, JSON.stringify(configObject, null, 2))
console.log(configObject)

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse raw body for POST /index
app.use('/index', express.raw({ type: '*/*' , limit: '500mb' }));

app.post('/index', async (req, res) => {
  let dir;
  try {
    dir = await fs.mkdtemp('qlever-indexing-')
    console.log(`Created temp dir: ${dir}`);
    const inputFile = path.join(dir, 'input.blob');
    const outputFile = path.join(dir, 'output.blob');
    await fs.writeFile(inputFile, req.body);
    const command = `CreateBlobMain -i index-basename -j "$(cat ${jsonConfigFile})" -o ${outputFile} -f ${inputFile} -F ttl`
    console.log(`Executing command: ${command}`);
    await execAsync(command);
    const responseBuffer = await fs.readFile(outputFile);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFile}"`);
    res.status(200).send(responseBuffer);
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    res.status(500).json({ error: error.message });
  } finally {
    if (dir) {
      await fs.rm(dir, { recursive: true, force: true  });
      console.log(`Deleted temp dir: ${dir}`);
    }
    console.log('POST /index request processed');
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
