import express from 'express';
import cors from 'cors';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status';
import { GraphData, isTestConfig } from './client/src/types';
import runPerfTest from './runPerfTest';

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  if (!isTestConfig(req.query)) {
    return res.status(BAD_REQUEST).end();
  }

  let perfTestResults: GraphData;
  try {
    perfTestResults = await runPerfTest(req.query);
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).end();
  }

  return res.json(perfTestResults);
});

app.listen(PORT, () => {
  console.log(`️blitz server is running at http://localhost:${PORT}`);
});
