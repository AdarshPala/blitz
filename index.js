'use strict';

const fs = require('fs');
const request = require('superagent');
const responseTime = require('superagent-response-time');
const { CanvasRenderService } = require('chartjs-node-canvas');
const config = require('./config');

const xAxisLabels = [];
const latencies = [];
const callback = (req, time) => {
  console.log(`Received response in ${time} ms`);
  latencies.push(time);
}

const agent = request.agent().use(responseTime(callback));
console.log('Sending requests to the server...');

const perfTest = new Promise((resolve, reject) => {
  for (let i = 0; i < config.NUMBER_OF_REQUESTS; i++) {
    setTimeout(() => {
      xAxisLabels.push(i);
      agent
        //.get(`http://localhost:${config.PORT}/${config.ENDPOINT}/${i}`)
        .get(`http://localhost:${config.PORT}/${config.ENDPOINT}`)
        .then((res) => {
          console.log(res.body);
          if (latencies.length === config.NUMBER_OF_REQUESTS) {
            resolve();
          }
        })
        .catch((err) => {
          console.log('Error: ', err.message);
          reject();
        });
    }, config.TIME_IN_MS_BETWEEN_EACH_REQUEST * i);
  }
});

const width = config.GRAPH_WIDTH;
const height = config.GRAPH_HEIGHT;
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
  try {
    await perfTest;
  } catch (perfTestError) {
    console.log('Error during performance test: ', perfTestError);
    return;
  }

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
        //   'rgba(255, 99, 132, 0.2)',
        //   'rgba(54, 162, 235, 0.2)',
        //   'rgba(255, 206, 86, 0.2)',
        //   'rgba(75, 192, 192, 0.2)',
        //   'rgba(153, 102, 255, 0.2)',
        //   'rgba(255, 159, 64, 0.2)'
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
  // const dataUrl = await canvasRenderService.renderToDataURL(configuration);
  // const stream = canvasRenderService.renderToStream(configuration);

  fs.writeFile('testimage.png', image, () => console.log('done'));
})();
