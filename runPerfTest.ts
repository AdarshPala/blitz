import superagent from 'superagent';
import { TestConfig, GraphData } from './client/src/types';

type ResponseTimePluginCb = (responseTime : number) => void;

const MS_PER_SEC = 1e3;
const xAxisLabels : number[] = [];
const yAxisValues : number[] = [];

const responseTimePlugin = (cb : ResponseTimePluginCb) =>
  (req : superagent.SuperAgentRequest) => {
    const start = Date.now();

    req.on('end', () => {
      const responseTime = Date.now() - start;
      cb(responseTime);
    });
  };

const responseTimeCb = (time : number) => {
  console.log(`Received response in ${time} ms`);
  yAxisValues.push(time);
};

// Assuming a single phase for now
const runPerfTest = (config : TestConfig) => {
  const perfTest = new Promise<GraphData>((resolve, reject) => {
    config.testPhases.forEach((phase) => {
      const totalNumOfReq = phase.loadProfile.duration * phase.loadProfile.requestRate;
      const delayBetweenEachReq = 1 / phase.loadProfile.requestRate * MS_PER_SEC;

      console.log('total req', totalNumOfReq)
      console.log('req delay', delayBetweenEachReq)
      for (let i = 0; i < totalNumOfReq; i++) {
        xAxisLabels.push(i);

        setTimeout(() => {
          const agent = superagent.agent().use(responseTimePlugin(responseTimeCb));
          const endpoint = `${config.domain}:${config.port}/${phase.apiFlow.resource}`;

          // agent[phase.apiFlow.method](endpoint)
          agent['get'](`http://localhost:3001/fib/${30}`)
            .timeout({
              deadline: 600000,
              response: 600000,
            })
            .send(phase.apiFlow.body)
            .then((res) => {
              console.log(res.body);
              if (yAxisValues.length === totalNumOfReq) {
                console.log('x', xAxisLabels)
                console.log('y', yAxisValues)
                return resolve({ xAxisLabels, yAxisValues });
              }
            })
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
