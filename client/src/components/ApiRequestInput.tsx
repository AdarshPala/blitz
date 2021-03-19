import { ApiRequest, Method } from "../types";
import { getCredentials } from '../util';
import './ApiRequestInput.css'

interface Props {
  setApiFlows: React.Dispatch<React.SetStateAction<ApiRequest[][]>>; 
  apiFlow: ApiRequest;
  apiFlowIdx: number;
  apiReqIdx: number,
};

function ApiRequestInput({ setApiFlows, apiFlow, apiFlowIdx, apiReqIdx }: Props) {
  const changeApiRequest = (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      if (!input) {
        return;
      }

      setApiFlows(((currApiFlows) => 
        currApiFlows.map((currApiFlow, currApiFlowIdx) => {
          if (currApiFlowIdx === apiFlowIdx) {
            return currApiFlow.map((currApiReq, currApiReqIdx) => {
              if (currApiReqIdx === apiReqIdx) {
                return {
                  method: field === 'method' ? input as Method : currApiReq.method,
                  resource: field === 'resource' ? input : currApiReq.resource,
                };
              } else {
                return currApiReq;
              }
            });
          } else {
            return currApiFlow;
          }
        })
      ));
    };

  // TODO remove any
  // const changeCredentials = (event: React.MouseEvent<HTMLInputElement>) => {
  const changeCredentials = (event: any) => {
    const checked: boolean = event.target.checked;
    setApiFlows(((currApiFlows) => 
      currApiFlows.map((currApiFlow, currApiFlowIdx) => {
        if (currApiFlowIdx === apiFlowIdx) {
          return currApiFlow.map((currApiReq, currApiReqIdx) => {
            if (currApiReqIdx === apiReqIdx) {
              return {
                method: currApiReq.method,
                resource: currApiReq.resource,
                body: checked ? getCredentials(): undefined,
              };
            } else {
              return currApiReq;
            }
          });
        } else {
          return currApiFlow;
        }
      })
    ));
  };

  return (
    <div className="api-req-input">
      <h5>Flow #{apiFlowIdx}, Req #{apiReqIdx}</h5>
      <h4>Method:</h4>
      <input className="form-control input-field" type="text" defaultValue={apiFlow.method} onChange={changeApiRequest('method')} />
      <h4>Resource:</h4>
      <input className="form-control input-field" type="text" defaultValue={apiFlow.resource} onChange={changeApiRequest('resource')} />
      <span className="creds">
        <h4>Credentials:</h4>
        <input className="form-check-input checkbox" type="checkbox" onClick={changeCredentials} />
      </span>
    </div>
  );
}

export default ApiRequestInput;
