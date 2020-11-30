'use strict';

const fs = require('fs');
const request = require('superagent');
const responseTime = require('superagent-response-time');
const { CanvasRenderService } = require('chartjs-node-canvas');

const xAxisLabels = [];
const latencies = [];
const callback = (req, time) => {
  console.log(`Received response in ${time} ms`);
  latencies.push(time);
}

const agent = request.agent().use(responseTime(callback));
console.log('Sending requests to the server...');

const perfTest = new Promise((resolve, reject) => {
  for (let i = 0; i < 42; i++) {
    xAxisLabels.push(i);
    agent
      .get(`http://localhost:3001/fib/${i}`)
      .then((res) => {
        // res.body, res.headers, res.status
        console.log(res.body);
        if (latencies.length === 42) {
          resolve();
        }
      })
      .catch((err) => {
        // err.message, err.response
        console.log('Error: ', err.message);
      });
  }
})
const width = 400;
const height = 400;
const chartCallback = (ChartJS) => {
 
    // Global config example: https://www.chartjs.org/docs/latest/configuration/
    ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
    // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
    ChartJS.plugins.register({
        // plugin implementation
    });
    // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
    ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
        // chart implementation
    });
};
const canvasRenderService = new CanvasRenderService(width, height, chartCallback);
 
(async () => {
  await perfTest;
    const configuration = {
        type: 'line',
        data: {
            //labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            labels: xAxisLabels,
            datasets: [{
                label: 'Latency',
                //data: [12, 19, 3, 5, 2, 3],
                data: latencies,
                // backgroundColor: [
                //     'rgba(255, 99, 132, 0.2)',
                //     'rgba(54, 162, 235, 0.2)',
                //     'rgba(255, 206, 86, 0.2)',
                //     'rgba(75, 192, 192, 0.2)',
                //     'rgba(153, 102, 255, 0.2)',
                //     'rgba(255, 159, 64, 0.2)'
                // ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        // options: {
        //     scales: {
        //         yAxes: [{
        //             ticks: {
        //                 beginAtZero: true,
        //                 callback: (value) => '$' + value
        //             }
        //         }]
        //     }
        // }
    };
    const image = await canvasRenderService.renderToBuffer(configuration);
    const dataUrl = await canvasRenderService.renderToDataURL(configuration);
    const stream = canvasRenderService.renderToStream(configuration);

    fs.writeFile('testimage.png', image, () => console.log('done'));
})();
