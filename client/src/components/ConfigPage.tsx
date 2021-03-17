import { useState } from 'react';
import qs from 'qs';
import superagent from 'superagent';
import { ChartData, Line } from 'react-chartjs-2';
import { TestConfig } from '../types';
 
const NOT_STARTED = 'not started';
const PENDING = 'pending';
const COMPLETE = 'complete';
const FAILED = 'failed';

const config: TestConfig = {
  testPhases: [
    {
      loadProfile: {
        duration: 2,
        requestRate: 30,
      },
      apiFlow: [
        {
          method: 'put',
          resource: 'users',
          body: {
            username: 'heyo' + Math.random(),
            password: 'passwd',
          },
        },
        {
          method: 'get',
          resource: 'conversations',
        },
      ],
    }
  ],
  domain: 'http://localhost',
  port: 3001,
};

function ConfigPage() {
  // To change height/width you can try using ChartComponent instead (defined in react-chartjs-2\index.d.ts)
  const data123 : ChartData<Chart.ChartData> = {};
  const [ perfTestState, setPerfState ] = useState(NOT_STARTED);
  const [ initdata, setInitData ] = useState(data123);

  const startPerfTest = () => {
    setPerfState(PENDING);
    superagent.get(`http://localhost:3003/?${qs.stringify(config)}`)
      .timeout({
        deadline: 600000,
        response: 600000,
      })
      .then((res) => {
        const { xAxisLabels } = res.body.testResults[0];
        const { yAxisValues } = res.body.testResults[0];
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
              data: yAxisValues[0],
              // showLine: false,
            },
            {
              label: 'My Second dataset',
              fill: false,
              lineTension: 0.1,
              backgroundColor: 'rgba(75,192,192,0.4)',
              borderColor: 'rgba(222,192,192,1)',
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
              // data: [50, 22],
              data: yAxisValues[1],
              // showLine: false,
            }
          ]
        };
        setInitData(newdata);
        setPerfState(COMPLETE);
      })
      .catch((err) => {
        console.log('ERRRROR', err)
        setPerfState(FAILED);
      });
  }

  if (perfTestState === PENDING) {
    return (<h1> Pending... </h1>);
  }

  if (perfTestState === FAILED) {
    return (<h1> Failed </h1>);
  }

  if (perfTestState === COMPLETE) {
    return (
      <Line data={initdata} />
    );
  }

  return (
    <button onClick={startPerfTest}>Run</button>
  );
}
export default ConfigPage;
