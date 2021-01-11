'use strict';

const http = require('http');
const fs = require('fs');
const express = require('express');

const PORT = 3002;
const app = express();

app.get('/file', (req, res) => {
  fs.readFile('large.bmp', (err, data1) => {
    if (err) throw err;
    fs.writeFile('large.bmp', data1, (err) => {
      if (err) throw err;
      fs.readFile('large.bmp', (err, data2) => {
        if (err) throw err;
        fs.writeFile('large.bmp', data2, (err) => {
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
