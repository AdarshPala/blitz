import { useState } from 'react';
import qs from 'qs';
import superagent, { Response } from 'superagent';
import { ChartData, Line } from 'react-chartjs-2';
import { TestConfig, BlitzResponseBody, LoadProfile, ApiRequest } from '../types';
import { FORMAT, COLOURS } from '../ChartFormat';
import LoadProfileList from './LoadProfileList';
import ApiFlowList from './ApiFlowList';
import './ConfigPage.css';
import TestPhaseList from './TestPhaseList';
 
const NOT_STARTED = 'not started';
const PENDING = 'pending';
const COMPLETE = 'complete';
const FAILED = 'failed';

// duration = 2: server can handle rate of 40. With 50 you start to see some growth.

function ConfigPage() {
  // To change height/width you can try using ChartComponent instead (defined in react-chartjs-2\index.d.ts)
  const data123 : ChartData<Chart.ChartData> = {};
  const [ perfTestState, setPerfState ] = useState(NOT_STARTED);
  const [ initdata, setInitData ] = useState(data123);
  const [ loadProfiles, setLoadProfiles ] = useState<LoadProfile[]>([]);
  const [ apiFlows, setApiFlows ] = useState<ApiRequest[][]>([]);
  const [ testPhases, setTestPhases ] = useState<number[][]>([]);

  const addProfile = () => {
    const newLoadProfile: LoadProfile = {
      duration: 0,
      requestRate: 0,
    };
    setLoadProfiles(currLoadProfiles => [...currLoadProfiles, newLoadProfile]);
  };

  const addApiFlow = () => {
    const newApiFlow: ApiRequest = {
      method: 'put',
      resource: '',
    };
    setApiFlows(currApiFlows => [...currApiFlows, [newApiFlow]]);
  };

  const addTestPhase = () => {
    if (!loadProfiles.length || !apiFlows.length) {
      return;
    }

    const newTestPhase = [0, 0];
    setTestPhases(currTestPhases => [...currTestPhases, newTestPhase]);
  };

  const constructTestConfig = () => {
    const config: TestConfig = {
      testPhases: [],
      domain: 'http://localhost',
      port: 3001,
    };

    testPhases.forEach(([ loadProfileIdx, apiFlowIdx ], testPhaseIdx) => {
      config.testPhases.push({
        loadProfile: loadProfiles[loadProfileIdx],
        apiFlow: apiFlows[apiFlowIdx],
      });
    });

    console.log(config)
    return config;
  };

  const startPerfTest = () => {
    setPerfState(PENDING);
    superagent.get(`http://localhost:3003/?${qs.stringify(constructTestConfig())}`)
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
          <ApiFlowList setApiFlows={setApiFlows} apiFlows={apiFlows} />
          <button onClick={addApiFlow}>Add Flow</button>
        </div>
      </div>
      <div>
        <h2>Test Phases</h2>
        <TestPhaseList
          setTestPhases={setTestPhases}
          testPhases={testPhases}
          loadProfiles={loadProfiles}
          apiFlows={apiFlows}
        />
        <button onClick={addTestPhase}>Add Test Phase</button>
      </div>
      <button onClick={startPerfTest}>Run</button>
    </div>
  );
}

export default ConfigPage;
