'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');

const fibonacci = (num) => {
  if (num <= 0) {
    return 0;
  }
  if (num === 1) {
    return 1;
  }

  return fibonacci(num - 1) + fibonacci(num - 2);
}

const PORT = 3001;
const app = express();

const corsOptions = {
  origin: [`http://localhost:3000`, `http://localhost:3001`],
  credentials: false,
};

app.use(cors(corsOptions));

app.get('/fib/:num', (req, res) => {
  const ans = fibonacci(+req.params.num);
  console.log('req ', +req.params.num, 'resp ', ans)
  return res.json(ans);
});

app.use((req, res, next) => {
  console.log(`Could not find ${req.method} ${req.path}`);
  return res.status(404).send('Not Found');
});

const server = http.createServer(app);
server.listen(PORT, () => console.log(`cpu test listening on port ${PORT}`));
