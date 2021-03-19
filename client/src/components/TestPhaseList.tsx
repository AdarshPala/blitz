import { getTestPhaseKey } from '../getKeys';
import { ApiRequest, LoadProfile } from '../types';
import TestPhaseInput from './TestPhaseInput';

interface Props {
  setTestPhases: React.Dispatch<React.SetStateAction<number[][]>>; 
  testPhases: number[][];
  loadProfiles: LoadProfile[];
  apiFlows: ApiRequest[][];
};

// TODO Only need length of testPhases, loadProfiles and apiFlows not the entire arrays
function TestPhaseList({ setTestPhases, testPhases, loadProfiles, apiFlows}: Props) {
  return (
    <>
      {
        testPhases.map(
          (testPhase, testPhaseIdx) =>
            <TestPhaseInput
              setTestPhases={setTestPhases}
              loadProfiles={loadProfiles}
              apiFlows={apiFlows}
              key={getTestPhaseKey(testPhaseIdx)}
              testPhaseIdx={testPhaseIdx}
            />
        )
      }
    </>
  );
}

export default TestPhaseList;
