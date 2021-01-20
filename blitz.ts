import express from 'express';
import cors from 'cors';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status';
import { BlitzResponseBody, isTestConfig } from './client/src/types';
import runPerfTest from './runPerfTest';

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  if (!isTestConfig(req.query)) {
    return res.status(BAD_REQUEST).end();
  }

  let perfTestResults: BlitzResponseBody;
  try {
    perfTestResults = await runPerfTest(req.query);
  } catch (err) {
    console.log('Error in endpoint ', err)
    return res.status(INTERNAL_SERVER_ERROR).send(err);
  }

  return res.json(perfTestResults);
});

app.listen(PORT, () => {
  console.log(`️blitz server is running at http://localhost:${PORT}`);
});
