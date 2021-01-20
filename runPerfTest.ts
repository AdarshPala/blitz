import superagent from 'superagent';
import { TestConfig, ApiRequest, BlitzResponseBody } from './client/src/types';

type ResponseTimePluginCb = (responseTime: number) => void;
type SessionAgent = superagent.SuperAgentStatic & superagent.Request;

let responsesReceived = 0;
// let currApiFlowIdx = 0;
const MS_PER_SEC = 1e3;
    let xAxisLabels: number[] = [];
    let yAxisValues: number[][] = [[], []];

// TODO https://visionmedia.github.io/superagent/#error-handling
// clean up code, try to get rid of globals, don't hardcode anything e.g. yAxisValues
// no any types (for resolve), generalize code for multiple phases

//function continueApiFlow(res: superagent.Response) {
const continueApiFlow =
  (agent: SessionAgent, apiFlow: ApiRequest[], apiFlowIdx: number, totalNumOfReq: number, resolve: any, startTime: number) => {
    const requestCb = (res: superagent.Response) => {
      const respTime = Date.now() - startTime;
      console.log('RESP TIME ', respTime)
      yAxisValues[apiFlowIdx - 1].push(respTime);
      // console.log('in cb', res.body, apiFlowIdx, responsesReceived)
        if (responsesReceived === totalNumOfReq * apiFlow.length) {
          // return resolve({ xAxisLabels, yAxisValues });
          return resolve({ testResults: [ { xAxisLabels, yAxisValues } ] });
        }
      if (apiFlowIdx === apiFlow.length) {
        return;
      }

      // currApiFlowIdx++;
            const endpoint = 'http://localhost:3001/' + apiFlow[apiFlowIdx].resource;
            agent[apiFlow[apiFlowIdx].method](endpoint)
              .timeout({
                deadline: 600000,
                response: 600000,
              })
              .send({ username: 'foo' + Math.random(), password: 'passwd' })
              .then(continueApiFlow(agent, apiFlow, apiFlowIdx + 1, totalNumOfReq, resolve, Date.now()))
              .catch((err) => {
                console.log('Error IN CONTINUE: ', err);
              });
    };
      return requestCb;
  };

// TODO use superagent-response-time for high-resolution times
const responseTimePlugin = (cb: ResponseTimePluginCb) =>
  (req: superagent.SuperAgentRequest) => {
    const start = Date.now();

    req.on('end', () => {
      const responseTime = Date.now() - start;
      responsesReceived++;
      cb(responseTime);
    });
  };

const responseTimeCb = (time: number) => {
  console.log(`Received response in ${time} ms`);
  // yAxisValues.push(time);
};

// Assuming a single phase for now
const runPerfTest = (config: TestConfig) => {
  // const xAxisLabels: number[] = [];
  // const yAxisValues: number[][] = [[2, 2]];
  // const responseTimeCb = (time: number) => {
  //   console.log(`Received response in ${time} ms`);
  //   yAxisValues[currApiFlowIdx].push(time);
  // };
  responsesReceived = 0;
    xAxisLabels = [];
    yAxisValues = [[], []];
  const perfTest = new Promise<BlitzResponseBody>((resolve, reject) => {
    config.testPhases.forEach((phase) => {
      const totalNumOfReq =
        phase.loadProfile.duration * phase.loadProfile.requestRate;
      // TODO Add pause functionality if requestRate is 0
      const delayBetweenEachReq = 1 / phase.loadProfile.requestRate * MS_PER_SEC;

      console.log('total req', totalNumOfReq)
      console.log('req delay', delayBetweenEachReq)
      for (let i = 0; i < totalNumOfReq; i++) {
        xAxisLabels.push(i);

        // setTimeout(() => {
          const agent = superagent.agent().use(responseTimePlugin(responseTimeCb));

          // phase.apiFlow.forEach(async (apiReq, apiFlowIdx) => {
            const endpoint = `${config.domain}:${config.port}/${phase.apiFlow[0].resource}`;
            agent[phase.apiFlow[0].method](endpoint)
            // agent['get'](`http://localhost:3001/fib/${20}`)
              .timeout({
                deadline: 600000,
                response: 600000,
              })
              //.send(apiReq.body)
              .send({ username: 'foo' + Math.random(), password: 'passwd' })
              // .then((res) => {
              //   console.log(res.body);
              //   if (yAxisValues.length === totalNumOfReq) {
              //     console.log('x', xAxisLabels)
              //     console.log('y', yAxisValues)
              //     return resolve({ xAxisLabels, yAxisValues });
              //   }
              // })
              .then(continueApiFlow(agent, phase.apiFlow, 1, totalNumOfReq, resolve, Date.now()))
              .catch((err) => {
                console.log('Error: ', err);
                return reject(err);
              });
          // });
        // }, delayBetweenEachReq * i);
      }
    });
  });

  return perfTest;
};

export default runPerfTest;
