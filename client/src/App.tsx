import React, { useEffect, useState } from 'react';
import qs from 'qs';
import superagent from 'superagent';
import { ChartData, Line } from 'react-chartjs-2';
import { TestConfig } from './types';

const PENDING = 'pending';
const COMPLETE = 'complete';
const FAILED = 'failed';

const config: TestConfig = {
  testPhases: [
    {
      loadProfile: {
        duration: 0.1,
        requestRate: 400,
      },
      apiFlow: {
        method: 'get',
        resource: 'file',
      },
    }
  ],
  domain: 'http://localhost',
  port: 3002,
}

function App() {
  // To change height/width you can try using ChartComponent instead (defined in react-chartjs-2\index.d.ts)
  const data123 : ChartData<Chart.ChartData> = {};
  const [ perfTestState, setPerfState ] = useState(PENDING);
  const [ initdata, setInitData ] = useState(data123);
  useEffect(() => {
    superagent.get(`http://localhost:3003/?${qs.stringify(config)}`)
      .timeout({
        deadline: 600000,
        response: 600000,
      })
      .then((res) => {
        const { xAxisLabels } = res.body;
        const { yAxisValues } = res.body;
        const newdata: ChartData<Chart.ChartData> = {
          labels: xAxisLabels,
          datasets: [
            {
              label: 'My First dataset',
              fill: false,
              lineTension: 0.1,
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(75,192,192,1)',
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: 'rgba(75,192,192,1)',
              pointBackgroundColor: '#fff',
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: 'rgba(75,192,192,1)',
              pointHoverBorderColor: 'rgba(220,220,220,1)',
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: yAxisValues,
              // showLine: false,
            }
          ]
        };
        setInitData(newdata);
        setPerfState(COMPLETE);
      })
      .catch(() => {
        setPerfState(FAILED);
      });
  }, []);

  if (perfTestState === PENDING) {
    return (<h1> Pending... </h1>);
  }

  if (perfTestState === FAILED) {
    return (<h1> Failed </h1>);
  }

  return (
    <Line data={initdata} />
  );
}

export default App;
