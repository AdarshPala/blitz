import { ApiRequest } from '../types';
import { getApiFlowKey } from '../getKeys';
import ApiRequestList from './ApiRequestList';

interface Props {
  setApiFlows: React.Dispatch<React.SetStateAction<ApiRequest[][]>>; 
  apiFlows: ApiRequest[][];
};

function ApiFlowList({ setApiFlows, apiFlows }: Props) {
  return (
    <>
      {
        apiFlows.map(
          (apiFlow, apiFlowIdx) =>
            <ApiRequestList
              setApiFlows={setApiFlows}
              apiFlow={apiFlow}
              key={getApiFlowKey(apiFlowIdx)}
              apiFlowIdx={apiFlowIdx}
            />
        )
      }
    </>
  );
}

export default ApiFlowList;
