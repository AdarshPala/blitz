import { useState } from 'react';
import qs from 'qs';
import superagent, { Response } from 'superagent';
import { ChartData, Line } from 'react-chartjs-2';
import { TestConfig, BlitzResponseBody, LoadProfile, ApiRequest } from '../types';
import { FORMAT, COLOURS, OPTIONS } from '../ChartFormat';
import LoadProfileList from './LoadProfileList';
import ApiFlowList from './ApiFlowList';
import TestPhaseList from './TestPhaseList';
import './ConfigPage.css';
 
const NOT_STARTED = 'not started';
const PENDING = 'pending';
const COMPLETE = 'complete';
const FAILED = 'failed';

const TIMEOUT_INFO = {
  deadline: 600000,
  response: 600000,
};

const getOptions = (idx: number) => {
  const title = { display: true, text: `Test Phase ${idx}` };
  return { ...OPTIONS, title };
};

// duration = 2: server can handle rate of 40. With 50 you start to see some growth.

const getGraphs = (body: BlitzResponseBody) =>
  body.testResults.map((testPhaseResult) => {
    const { xAxisLabels } = testPhaseResult;
    const { yAxisValues } = testPhaseResult;
    const datasets: Chart.ChartDataSets[] = [];

    yAxisValues.forEach((yVals, apiFlowIdx) => {
      const label = `Flow ${apiFlowIdx}`;
      const borderColor = COLOURS[apiFlowIdx];
      const pointBorderColor = COLOURS[apiFlowIdx];
      const data = yVals;
      datasets.push({ ...FORMAT, label, borderColor, pointBorderColor, data });
    });

    return {
      labels: xAxisLabels,
      datasets,
    };
  });

function ConfigPage() {
  // To change height/width you can try using ChartComponent instead (defined in react-chartjs-2\index.d.ts)
  const data123: ChartData<Chart.ChartData>[] = [{}];
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

    return config;
  };

  const startPerfTest = () => {
    // return console.log(constructTestConfig());
    setPerfState(PENDING);
    superagent.get(`http://localhost:3003/?${qs.stringify(constructTestConfig())}`)
      .timeout(TIMEOUT_INFO)
      .then((res: Response) => {
        const body: BlitzResponseBody = res.body;
        setInitData(getGraphs(body));
        setPerfState(COMPLETE);
      })
      .catch((err) => {
        console.log('Error', err)
        setPerfState(FAILED);
      });
  };

  if (perfTestState === PENDING) {
    return (<h1> Pending... </h1>);
  }

  if (perfTestState === FAILED) {
    return (<h1> Failed </h1>);
  }

  if (perfTestState === COMPLETE) {
    return (
      <>
        {initdata.map((graph, idx) => <Line key={idx} data={graph} options={getOptions(idx)} />)}
      </>
    );
  }

  return (
    <div className="config-page">
      <h1 className="config-header">Blitz</h1>
      <div className='config-col'>
        <div>
          <h2 className="section-header">Load Profiles</h2>
          <LoadProfileList setLoadProfiles={setLoadProfiles} loadProfiles={loadProfiles} />
          <button className="btn btn-warning add-btn" onClick={addProfile}>Add Profile</button>
        </div>
        <div>
          <h2 className="section-header">API Flows</h2>
          <ApiFlowList setApiFlows={setApiFlows} apiFlows={apiFlows} />
          <button className="btn btn-warning add-btn" onClick={addApiFlow}>Add Flow</button>
        </div>
      </div>
      <div>
        <h2 className="section-header">Test Phases</h2>
        <TestPhaseList
          setTestPhases={setTestPhases}
          testPhases={testPhases}
          loadProfiles={loadProfiles}
          apiFlows={apiFlows}
        />
        <button className="btn btn-warning add-btn" onClick={addTestPhase}>Add Test Phase</button>
      </div>
      <button className="btn btn-outline-danger btn-lg add-btn" onClick={startPerfTest}>Run</button>
    </div>
  );
}

export default ConfigPage;
