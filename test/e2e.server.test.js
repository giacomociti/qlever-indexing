// test/e2e.server.test.js
import axios from 'axios';
import { execSync } from 'child_process';
import assert from 'assert';

const IMAGE = 'qlever-indexing-server:test';
const CONTAINER = 'qlever-indexing-e2e-test';
const PORT = 3999;
const URL = `http://localhost:${PORT}/`;

function waitForServer(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      axios.get(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeout) reject(new Error('Timeout'));
          else setTimeout(check, 300);
        });
    })();
  });
}

try {
  execSync(`docker build -t ${IMAGE} .`, { stdio: 'inherit' });
  execSync(`docker run -d --rm --name ${CONTAINER} -p ${PORT}:3000 ${IMAGE}`);
  await waitForServer(URL);

  const res = await axios.get(URL);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.message, 'Hello, world!');
  console.log('E2E test passed!');
} catch (err) {
  console.error('E2E test failed:', err);
  process.exit(1);
} finally {
  try { execSync(`docker stop ${CONTAINER}`); } catch {}
}