require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const { URL } = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory URL storage
let urlDatabase = {};
let currentId = 1;

// POST endpoint to shorten URL
app.post('/api/shorturl', function (req, res) {
  const original_url = req.body.url;

  let urlObj;
  try {
    urlObj = new URL(original_url);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const short_url = currentId++;
    urlDatabase[short_url] = original_url;

    res.json({
      original_url,
      short_url
    });
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', function (req, res) {
  const short_url = parseInt(req.params.short_url);
  const original_url = urlDatabase[short_url];

  if (original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
