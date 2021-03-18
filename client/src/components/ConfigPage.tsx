import { useState } from 'react';
import qs from 'qs';
import superagent, { Response } from 'superagent';
import { ChartData, Line } from 'react-chartjs-2';
import { TestConfig, BlitzResponseBody, LoadProfile } from '../types';
import { FORMAT, COLOURS } from '../ChartFormat';
import LoadProfileList from './LoadProfileList';
import ApiFlowInput from './ApiFlowInput';
import './ConfigPage.css';
 
const NOT_STARTED = 'not started';
const PENDING = 'pending';
const COMPLETE = 'complete';
const FAILED = 'failed';

// duration = 2: server can handle rate of 40. With 50 you start to see some growth.
const config: TestConfig = {
  testPhases: [
    {
      loadProfile: {
        duration: 2,
        requestRate: 50,
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
  const [ loadProfiles, setLoadProfiles ] = useState<LoadProfile[]>([]);

  const addProfile = () => {
    const newLoadProfile: LoadProfile = {
      duration: 0,
      requestRate: 0,
    };
    setLoadProfiles(currLoadProfiles => [...currLoadProfiles, newLoadProfile ]);
  };

  const startPerfTest = () => {
    // console.log('loadProfiles', loadProfiles)
    // return;
    setPerfState(PENDING);
    superagent.get(`http://localhost:3003/?${qs.stringify(config)}`)
      .timeout({
        deadline: 600000,
        response: 600000,
      })
      .then((res: Response) => {
        const body: BlitzResponseBody = res.body;
        const { xAxisLabels } = body.testResults[0];
        const { yAxisValues } = body.testResults[0];
        const datasets: Chart.ChartDataSets[] = [];

        yAxisValues.forEach((yVals, apiFlowIdx) => {
          const label = `Flow ${apiFlowIdx}`;
          const borderColor = COLOURS[apiFlowIdx];
          const data = yVals;
          datasets.push({ ...FORMAT, label, borderColor, data });
        });

        const newdata: ChartData<Chart.ChartData> = {
          labels: xAxisLabels,
          datasets,
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
    <div>
      <h1>Blitz</h1>
      <div className='config-col'>
        <div>
          <h2>Load Profiles</h2>
          <LoadProfileList setLoadProfiles={setLoadProfiles} loadProfiles={loadProfiles} />
          <button onClick={addProfile}>Add Profile</button>
        </div>
        <div>
          <h2>API Flows</h2>
          <ApiFlowInput />
          <button>Add Flow</button>
        </div>
      </div>
      <button onClick={startPerfTest}>Run</button>
    </div>
  );
}
export default ConfigPage;
