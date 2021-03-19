export const getLoadProfileKey = (idx: number) => `loadprofile${idx}`;
export const getApiFlowKey = (idx: number) => `apiflow${idx}`;
export const getTestPhaseKey = (idx: number) => `testphase${idx}`;
export const getApiRequestKey =
  (apiFlowIdx: number, apiReqIdx: number) =>`${getApiFlowKey(apiFlowIdx)}-apireq${apiReqIdx}`;
