const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL;
const ARCHIVE_URL = process.env.ARCHIVE_URL;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', async (req, res) => {
  console.log(`Incoming request: Method=${req.method}, URL=${req.url}, Header=${JSON.stringify(req.headers)}, Body=${JSON.stringify(req.body)}`);

  try {
    let response = await axios({
      method: req.method,
      url: TARGET_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: req.body,
      httpsAgent: httpsAgent,
      validateStatus: () => true
    });


    if (response.data.error != null || response.result == null) {
      if (response.data.error != null) {
        console.log(`Error received: ${JSON.stringify(response.data.error)}`)
      }
      response = await axios({
        method: req.method,
        url: ARCHIVE_URL,
        headers: {
          'Content-Type': 'application/json'
        },
        data: req.body,
        httpsAgent: httpsAgent,
        validateStatus: () => true
      });
    }
    console.log(`Response received: Status=${response.status}, Body=${JSON.stringify(response.data)}`);
    res.status(response.status).set(response.headers).send(response.data);
  } catch (err) {
    console.error(`Proxy error: ${err.message}`);
    res.status(500).send('Proxy error');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Memory Usage: RSS=${(used.rss / 1024 / 1024).toFixed(2)} MB, Heap Total=${(used.heapTotal / 1024 / 1024).toFixed(2)} MB, Heap Used=${(used.heapUsed / 1024 / 1024).toFixed(2)} MB, External=${(used.external / 1024 / 1024).toFixed(2)} MB`);
}, 10000);