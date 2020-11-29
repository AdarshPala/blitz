const request = require("superagent");

console.log('Sending requests to the server...');

for (i = 0; i < 22; i++) {
  request
    .get(`http://localhost:3001/fib/${i}`)
    .then((res) => {
      // res.body, res.headers, res.status
      console.log(res.body);
    })
    .catch((err) => {
      // err.message, err.response
      console.log(err.message);
    });
}
