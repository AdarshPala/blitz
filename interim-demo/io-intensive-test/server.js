'use strict';

const http = require('http');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const corsOptions = {
  origin: [`http://localhost:3000`, `http://localhost:3002`],
  credentials: false,
};

const PORT = 3002;
const app = express();

app.use(cors(corsOptions));

app.get('/file', (req, res) => {
  fs.readFile('io-intensive-test/large.bmp', (err, data1) => {
    if (err) throw err;
    fs.writeFile('io-intensive-test/large.bmp', data1, (err) => {
      if (err) throw err;
      fs.readFile('io-intensive-test/large.bmp', (err, data2) => {
        if (err) throw err;
        fs.writeFile('io-intensive-test/large.bmp', data2, (err) => {
          if (err) throw err;
          console.log('I/O done');
          return res.end();
        });
      });
    });
  });
});

app.use((req, res, next) => {
  console.log(`Could not find ${req.method} ${req.path}`);
  return res.status(404).send('Not Found');
});

const server = http.createServer(app);
server.listen(PORT, () => console.log(`io test listening on port ${PORT}`));
