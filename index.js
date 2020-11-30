'use strict';

const request = require('superagent');
const responseTime = require('superagent-response-time');

// const responseTime = cb =>

//   req => {

//     const start = process.hrtime.bigint();

//     req.on('end', () => {

//       console.log('start', start)
//       const end = process.hrtime.bigint();
//       const diff = end - start;
//       console.log('diff', diff)
//       const timeinMs = Number(diff) * 1e-6;

//       cb(req, timeinMs);

//     });
//   };

const callback = (req, time) => {
  console.log(`Received response in ${time} ms`);
}

const agent = request.agent().use(responseTime(callback));
console.log('Sending requests to the server...');

for (let i = 0; i < 44; i++) {
  agent
    .get(`http://localhost:3001/fib/${i}`)
    .then((res) => {
       // res.body, res.headers, res.status
       console.log(res.body);
    })
    .catch((err) => {
       // err.message, err.response
       console.log('Error: ', err.message);
    });
}
