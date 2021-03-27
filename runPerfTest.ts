import superagent from 'superagent';
import { TestConfig, ApiRequest, BlitzResponseBody, GraphData } from './client/src/types';

type SessionAgent = superagent.SuperAgentStatic & superagent.Request;
type TestResolve =  (value: BlitzResponseBody | PromiseLike<BlitzResponseBody>) => void;
type TestReject = (reason?: any) => void;
type PhaseResolve =  (value: void | PromiseLike<void>) => void;
interface TestState {
  totalNumOfReqToSend: number,
  totalNumOfResReceived: number,
  numOfReqsToSendForCurrPhase: number,
  numOfResReceivedForCurrPhase: number,
  testResults: GraphData[],
};

interface PromiseCb {
  resolve: TestResolve,
  reject: TestReject,
  phaseResolve: PhaseResolve,
  phaseReject: TestReject,
};

const MS_PER_SEC = 1e3;
const TIMEOUT_INFO = {
  deadline: 600000,
  response: 600000,
};

// TODO https://visionmedia.github.io/superagent/#error-handling

const getInitialYAxisValues = (numOfReqInFlow: number) => {
  const initalYAxisValues: number[][] = [];
  for (let i = 0; i < numOfReqInFlow; i++) {
    initalYAxisValues.push([]);
  }

  return initalYAxisValues;
};

const getInitialTestResults = (numOfTestPhases: number) => {
  const initalTestResults: GraphData[] = [];
  for (let i = 0; i < numOfTestPhases; i++) {
    initalTestResults.push({ xAxisLabels: [], yAxisValues: [] });
  }

  return initalTestResults;
};

const getTotalNumOfReqToSend = (config: TestConfig) => {
  let totalNumOfReqToSend = 0
  config.testPhases.forEach((phase) => {
    totalNumOfReqToSend +=
      phase.loadProfile.duration * phase.loadProfile.requestRate * phase.apiFlow.length;
  });

  return totalNumOfReqToSend;
};

const continueApiFlow = (
    agent: SessionAgent,
    apiFlow: ApiRequest[],
    phaseIdx: number,
    apiFlowIdx: number,
    testState: TestState,
    startTime: number,
    promiseCb: PromiseCb
  ) =>
    (res: superagent.Response) => {
      const respTime = Date.now() - startTime;
      testState.testResults[phaseIdx].yAxisValues[apiFlowIdx - 1].push(respTime);
      testState.totalNumOfResReceived++;
      testState.numOfResReceivedForCurrPhase++;

      if (testState.totalNumOfResReceived === testState.totalNumOfReqToSend) {
        // Not required for some reason
        // promiseCb.phaseResolve();
        return promiseCb.resolve({ testResults: testState.testResults });
      }

      if (testState.numOfResReceivedForCurrPhase === testState.numOfReqsToSendForCurrPhase) {
        return promiseCb.phaseResolve();
      }

      if (apiFlowIdx === apiFlow.length) {
        return;
      }

      const endpoint = 'http://localhost:3001/' + apiFlow[apiFlowIdx].resource;
      agent[apiFlow[apiFlowIdx].method](endpoint)
        .timeout(TIMEOUT_INFO)
        .send({ username: 'foo' + Math.random(), password: 'passwd' })
        // .send(apiFlow[apiFlowIdx].body)
        .then(continueApiFlow(agent, apiFlow, phaseIdx, apiFlowIdx + 1, testState, Date.now(), promiseCb))
        .catch((err) => {
          console.log('Error IN CONTINUE: ', err);
          return promiseCb.reject(err);
        });
    };

const runPerfTest = (config: TestConfig) => {
  const testState: TestState = {
    totalNumOfResReceived: 0,
    totalNumOfReqToSend: getTotalNumOfReqToSend(config),
    numOfReqsToSendForCurrPhase: 0,
    numOfResReceivedForCurrPhase: 0,
    testResults: getInitialTestResults(config.testPhases.length),
  };

  // https://stackoverflow.com/questions/43036229/is-it-an-anti-pattern-to-use-async-await-inside-of-a-new-promise-constructor
  const perfTest = new Promise<BlitzResponseBody>(async (resolve, reject) => {
    for (const [phaseIdx, phase] of config.testPhases.entries()) {
      const phaseComplete = new Promise<void>((phaseResolve, phaseReject) => {
        const promiseCb = { resolve, reject, phaseResolve, phaseReject };

        testState.testResults[phaseIdx].yAxisValues = getInitialYAxisValues(phase.apiFlow.length);
        const initialNumOfReqs = phase.loadProfile.duration * phase.loadProfile.requestRate;

        testState.numOfReqsToSendForCurrPhase = initialNumOfReqs * phase.apiFlow.length;
        testState.numOfResReceivedForCurrPhase = 0;

        // TODO Add pause functionality if requestRate is 0
        const delayBetweenEachReq = 1 / phase.loadProfile.requestRate * MS_PER_SEC;

        console.log('num of reqs', initialNumOfReqs)
        console.log('req delay', delayBetweenEachReq)

        for (let i = 0; i < initialNumOfReqs; i++) {
          testState.testResults[phaseIdx].xAxisLabels.push(i);

          const agent = superagent.agent();

          const endpoint = `${config.domain}:${config.port}/${phase.apiFlow[0].resource}`;
          setTimeout(() => {
            agent[phase.apiFlow[0].method](endpoint)
            // agent['get'](`http://localhost:3001/fib/${20}`)
              .timeout(TIMEOUT_INFO)
              // .send(phase.apiFlow[0].body)
              .send({ username: 'foo' + Math.random(), password: 'passwd' })
              .then(continueApiFlow(agent, phase.apiFlow, phaseIdx, 1, testState, Date.now(), promiseCb))
              .catch((err) => {
                console.log('Error: ', err);
                return reject(err);
              });
          }, delayBetweenEachReq * i);
        }
      });

      await phaseComplete;
    };
  });

  return perfTest;
};

export default runPerfTest;
