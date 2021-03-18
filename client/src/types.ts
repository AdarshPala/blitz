export type Method = 'get' | 'put' | 'post' | 'patch' | 'delete';

export interface LoadProfile {
  duration: number,
  requestRate: number,
};

export interface ApiRequest {
  method: Method,
  resource: string,
  body?: object,
};

export interface TestPhase {
  loadProfile: LoadProfile,
  apiFlow: ApiRequest[],
};

export interface TestConfig {
  testPhases: TestPhase[]
  domain: string,
  port?: number,
};

export interface GraphData {
  xAxisLabels: number[]
  yAxisValues: number[][]
};

export interface BlitzResponseBody {
  testResults: GraphData[]
};

export function isTestConfig(input: any): input is TestConfig {
  if (!input || typeof input !== 'object') {
    return false;
  }

  return true;
};
