'use strict';

function fibonacci(num) {
  if (num === 0) {
    return 0;
  }
  if (num === 1) {
    return 1;
  }

  return fibonacci(num - 1) + fibonacci(num - 2);
}

const http = require('http');
const express = require('express');

const PORT = 3001;
const app = express();

app.get('/fib/:num', (req, res) => {
  return res.json(fibonacci(req.params.num));
});

const server = http.createServer(app);
server.listen(PORT, () => console.log(`cpu test listening on port ${PORT}`));
