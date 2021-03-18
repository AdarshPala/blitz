import { ApiRequest } from "../types";
import './ApiRequestInput.css'

interface Props {
  setApiFlows: React.Dispatch<React.SetStateAction<ApiRequest[][]>>; 
  apiFlow: ApiRequest;
  apiFlowIdx: number;
  apiReqIdx: number,
};

function ApiFlowInput({ setApiFlows, apiFlow, apiFlowIdx, apiReqIdx }: Props) {
  return (
    <div className="api-req-input">
      <h4>Number: {apiFlowIdx}, {apiReqIdx}</h4>
      <h3>Method:</h3>
      <input type="text" defaultValue={apiFlow.method} />
      <h3>Resource:</h3>
      <input type="text" defaultValue={apiFlow.resource} />
      <h3>Credentials:</h3>
      <input type="checkbox" />
    </div>
  );
}

export default ApiFlowInput;
