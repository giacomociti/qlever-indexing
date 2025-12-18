import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

import fs from 'fs/promises';
import path from 'path';

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello, world!' });
});

// Middleware to parse raw body for POST /index
app.use('/index', express.raw({ type: '*/*', limit: '100mb' }));

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
      await fs.writeFile(path.join(process.cwd(), filename), data);
      offset += size;
    }
    if (offset !== body.length) {
      return res.status(400).json({ error: 'Body size does not match sum of file sizes' });
    }
    res.status(200).json({ message: 'Files saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
