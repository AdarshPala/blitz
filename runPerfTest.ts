import superagent from 'superagent';
import { TestConfig, ApiRequest, BlitzResponseBody, GraphData } from './client/src/types';

type SessionAgent = superagent.SuperAgentStatic & superagent.Request;
type TestResolve =  (value: BlitzResponseBody | PromiseLike<BlitzResponseBody>) => void;
type TestReject = (reason?: any) => void;
interface TestState {
  phaseIdx: number,
  apiFlowIdx: number,
  totalNumOfReqToSend: number,
  totalNumOfResReceived: number,
  testResults: GraphData[],
};

interface PromiseCb {
  resolve: TestResolve,
  reject: TestReject,
};

const MS_PER_SEC = 1e3;
const TIMEOUT_INFO = {
  deadline: 600000,
  response: 600000,
};

// TODO https://visionmedia.github.io/superagent/#error-handling
// clean up code, try to get rid of globals, don't hardcode anything e.g. yAxisValues
// no any types (for resolve), generalize code for multiple phases/apiFlows,
// try to include apiFlowIdx in testState by calling a function on testState when passing it to
// continueApiFlow that increments apiFlowIdx

const getInitialYAxisValues = (numOfReqInFlow: number) => {
  const initalYAxisValues: number[][] = [];
  for (let i = 0; i < numOfReqInFlow; i++) {
    initalYAxisValues.push([]);
  }

  return initalYAxisValues;
};

const continueApiFlow =
  (agent: SessionAgent, apiFlow: ApiRequest[], apiFlowIdx: number, testState: TestState, startTime: number, promiseCb: PromiseCb) =>
    (res: superagent.Response) => {
      const respTime = Date.now() - startTime;
      testState.testResults[testState.phaseIdx].yAxisValues[apiFlowIdx - 1].push(respTime);
      testState.totalNumOfResReceived++;

      if (testState.totalNumOfResReceived === testState.totalNumOfReqToSend) {
        return promiseCb.resolve({ testResults: testState.testResults });
      }

      if (apiFlowIdx === apiFlow.length) {
        return;
      }

      const endpoint = 'http://localhost:3001/' + apiFlow[apiFlowIdx].resource;
      agent[apiFlow[apiFlowIdx].method](endpoint)
        .timeout(TIMEOUT_INFO)
        .send({ username: 'foo' + Math.random(), password: 'passwd' })
        // .send(apiFlow[apiFlowIdx].body)
        .then(continueApiFlow(agent, apiFlow, apiFlowIdx + 1, testState, Date.now(), promiseCb))
        .catch((err) => {
          console.log('Error IN CONTINUE: ', err);
          return promiseCb.reject(err);
        });
    };

// Assuming a single phase for now
const runPerfTest = (config: TestConfig) => {
  const testState: TestState = {
    phaseIdx: 0,
    apiFlowIdx: 0,
    totalNumOfResReceived: 0,
    // totalNumOfReqToSend: getTotalNumOfReqToSend(config),
    totalNumOfReqToSend: 0,
    testResults: [{ xAxisLabels: [], yAxisValues: [] }],
  };

  const perfTest = new Promise<BlitzResponseBody>((resolve, reject) => {
    config.testPhases.forEach((phase, phaseIdx) => {
      testState.testResults[phaseIdx].yAxisValues = getInitialYAxisValues(phase.apiFlow.length);
      const totalNumOfReq = phase.loadProfile.duration * phase.loadProfile.requestRate;
      testState.totalNumOfReqToSend = totalNumOfReq * phase.apiFlow.length;
      // TODO Add pause functionality if requestRate is 0
      const delayBetweenEachReq = 1 / phase.loadProfile.requestRate * MS_PER_SEC;

      console.log('total req', totalNumOfReq)
      console.log('req delay', delayBetweenEachReq)
      // console.log('apiidx', testState.apiFlowIdx)
      for (let i = 0; i < totalNumOfReq; i++) {
        testState.testResults[0].xAxisLabels.push(i);
        // testState.apiFlowIdx++;

        const agent = superagent.agent();

        const endpoint = `${config.domain}:${config.port}/${phase.apiFlow[0].resource}`;
        setTimeout(() => {
          agent[phase.apiFlow[0].method](endpoint)
          // agent['get'](`http://localhost:3001/fib/${20}`)
            .timeout(TIMEOUT_INFO)
            // .send(phase.apiFlow[0].body)
            .send({ username: 'foo' + Math.random(), password: 'passwd' })
            .then(continueApiFlow(agent, phase.apiFlow, 1, testState, Date.now(), { resolve, reject }))
            .catch((err) => {
              console.log('Error: ', err);
              return reject(err);
            });
        }, delayBetweenEachReq * i);
      }
    });
  });

  return perfTest;
};

export default runPerfTest;
