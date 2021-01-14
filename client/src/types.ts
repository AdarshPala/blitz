export interface LoadProfile {
  duration: number,
  requestRate: number,
};

export interface ApiFlow {
  method: 'get' | 'put' | 'post' | 'patch' | 'delete',
  resource: string,
  body?: Object,
};

export interface Phase {
  loadProfile: LoadProfile,
  apiFlow: ApiFlow,
};

export interface Config {
  phases: Phase[]
  domain: string,
  port?: number,
};

export interface GraphData {
  xAxisLabels: number[]
  yAxisValues: number[]
};
