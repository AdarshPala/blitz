import { useState } from 'react';
import qs from 'qs';
import superagent, { Response } from 'superagent';
import { ChartData, Line } from 'react-chartjs-2';
import fileDownload from 'js-file-download';
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
  const [ perfTestState, setPerfState ] = useState(NOT_STARTED);
  const [ graphData, setGraphData ] = useState<ChartData<Chart.ChartData>[]>([{}]);
  const [ loadProfiles, setLoadProfiles ] = useState<LoadProfile[]>([]);
  const [ apiFlows, setApiFlows ] = useState<ApiRequest[][]>([]);
  const [ testPhases, setTestPhases ] = useState<number[][]>([]);
  const [ domain, setDomain ] = useState<string>('');
  const [ port, setPort ] = useState<number | null>(null);
  const [ importedConfig, setImportedConfig ] = useState<TestConfig | null>(null);

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

  const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    if (!input) {
      return;
    }

    return setDomain(input);
  };

  const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    if (!input || isNaN(+input)) {
      return;
    }

    return setPort(+input);
  };

  const handleExport = () => {
    return fileDownload(JSON.stringify(constructTestConfig()), 'blitzConfig.json');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    const reader = new FileReader();

    reader.onload = function(event) {
      if (event.target) {
        const data = event.target.result || '';
        setImportedConfig(JSON.parse(data as string));
      } else {
        console.log('Error: no file');
      }
    };

    reader.readAsText(file || new Blob());
  };

  const constructTestConfig = () => {
    if (importedConfig) {
      return importedConfig;
    }

    const config: TestConfig = {
      testPhases: [],
      // domain: 'http://localhost',
      domain: domain,
      // port: 3001,
      port: port || 0,
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
        setGraphData(getGraphs(body));
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
        {graphData.map((graph, idx) => <Line key={idx} data={graph} options={getOptions(idx)} />)}
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
      <div>
        <h4>Target Domain:</h4>
        <input className="form-control target-input" type="text" onChange={handleDomainChange} />
        <h4>Port Number:</h4>
        <input className="form-control target-input" type="text" onChange={handlePortChange} />
      </div>
      <div>
        <br></br>
        <button className="" onClick={handleExport}>Export</button>
        <input type="file" onChange={handleImport}/>
      </div>
      <button className="btn btn-outline-danger btn-lg add-btn" onClick={startPerfTest}>Run</button>
    </div>
  );
}

export default ConfigPage;
