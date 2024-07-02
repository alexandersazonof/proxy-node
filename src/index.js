const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', async (req, res) => {
  console.log(`Incoming request: Method=${req.method}, URL=${req.url}, Header=${JSON.stringify(req.headers)}, Body=${JSON.stringify(req.body)}`);

  try {
    const response = await axios({
      method: req.method,
      url: TARGET_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: req.body,
      httpsAgent: httpsAgent,
      validateStatus: () => true
    });

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