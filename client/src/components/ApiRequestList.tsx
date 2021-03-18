import { ApiRequest } from '../types';
import { getApiRequestKey } from '../getKeys';
import ApiRequestInput from './ApiRequestInput';
import './ApiRequestList.css'

interface Props {
  setApiFlows: React.Dispatch<React.SetStateAction<ApiRequest[][]>>; 
  apiFlow: ApiRequest[];
  apiFlowIdx: number;
};

function ApiRequestList({ setApiFlows, apiFlow, apiFlowIdx }: Props) {
  const addApiRequest = () => {
    const newApiReq: ApiRequest = {
      method: 'put',
      resource: '',
    };

    setApiFlows(((currApiFlows) => 
      currApiFlows.map((currApiFlow, currApiFlowIdx) => {
        if (currApiFlowIdx === apiFlowIdx) {
          return [ ...currApiFlow, newApiReq ];
        } else {
          return currApiFlow;
        }
      })
    ));
  };

  return (
    <>
      <div className="api-req-list">
        {
          apiFlow.map(
            (apiFlow, idx) =>
              <ApiRequestInput
                setApiFlows={setApiFlows}
                apiFlow={apiFlow}
                key={getApiRequestKey(apiFlowIdx, idx)}
                apiFlowIdx={apiFlowIdx}
                apiReqIdx={idx}
              />
          )
        }
      </div>
      <button onClick={addApiRequest}>Add Request</button>
      <br></br>
      <br></br>
    </>
  );
}

export default ApiRequestList;
