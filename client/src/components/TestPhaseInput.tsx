import { ChangeEvent } from "react";
import { ApiRequest, LoadProfile } from "../types";

interface Props {
  setTestPhases: React.Dispatch<React.SetStateAction<number[][]>>; 
  loadProfiles: LoadProfile[];
  apiFlows: ApiRequest[][];
  testPhaseIdx: number;
};

function TestPhaseInput({ setTestPhases, loadProfiles, apiFlows, testPhaseIdx }: Props) {
  const getLoadProfileOptions = () => {
    const loadProfileOptions = [];
    for (let i = 0; i < loadProfiles.length; i++) {
      loadProfileOptions.push(<option key={i} value={i}>{i}</option>);
    }
    return loadProfileOptions;
  };

  const getApiFlowOptions = () => {
    const apiFlowOptions = [];
    for (let i = 0; i < apiFlows.length; i++) {
      apiFlowOptions.push(<option key={i} value={i}>{i}</option>);
    }
    return apiFlowOptions;
  };

  const changeTestPhase = (field: string) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selection = event.target.value;

      setTestPhases((currTestPhases) => {
        return currTestPhases.map((currTestPhase, currTestPhaseIdx) => {
          if (currTestPhaseIdx === testPhaseIdx) {
            if (field === 'loadProfile') {
              return [+selection, currTestPhase[1]]
            } else {
              return [currTestPhase[0], +selection]
            }
          }
          return currTestPhase;
        });
      });
    };

  return (
    <>
      <label htmlFor="loadProfile">Load Profile:</label>
      <select name="loadProfile" onChange={changeTestPhase('loadProfile')}>
        {getLoadProfileOptions()}
      </select>
      <label htmlFor="apiFlow">API Flow:</label>
      <select name="apiFlow" onChange={changeTestPhase('apiFlow')}>
        {getApiFlowOptions()}
      </select>
      <br></br>
      <br></br>
    </>
  );
}

export default TestPhaseInput;
