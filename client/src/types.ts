export interface LoadProfile {
  duration: number,
  requestRate: number,
};

export interface ApiFlow {
  method: 'get' | 'put' | 'post' | 'patch' | 'delete',
  resource: string,
  body?: object,
};

export interface testPhase {
  loadProfile: LoadProfile,
  apiFlow: ApiFlow,
};

export interface TestConfig {
  testPhases: testPhase[]
  domain: string,
  port?: number,
};

export interface GraphData {
  xAxisLabels: number[]
  yAxisValues: number[]
};

export function isTestConfig(input: any): input is TestConfig {
  if (!input || typeof input !== 'object') {
    return false;
  }

  return true;
};
