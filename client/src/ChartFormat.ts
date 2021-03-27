export const COLOURS = ['rgb(75,192,192)', 'rgb(222,192,192)'];

export const FORMAT: Chart.ChartDataSets =  {
  fill: false,
  lineTension: 0.1,
  backgroundColor: 'rgba(75,192,192,0.4)',
  borderCapStyle: 'butt',
  borderDash: [],
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBackgroundColor: '#fff',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10,
  // showLine: false,
};

export const OPTIONS: Chart.ChartOptions = {
  title: {
    display: true,
    text: '',
  },
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Latency (ms)'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Request Number'
      }
    }],
  }     
};
