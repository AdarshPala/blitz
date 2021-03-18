import { LoadProfile } from '../types';
import { getLoadProfileKey } from '../getKeys';
import LoadProfileInput from './LoadProfileInput';

interface Props {
  setLoadProfiles: React.Dispatch<React.SetStateAction<LoadProfile[]>>; 
  loadProfiles: LoadProfile[];
};

function LoadProfileList({ setLoadProfiles, loadProfiles }: Props) {
  return (
    <>
      {
        loadProfiles.map(
          (loadProfile, idx) =>
            <LoadProfileInput
              setLoadProfiles={setLoadProfiles}
              loadProfile={loadProfile}
              key={getLoadProfileKey(idx)}
              idx={idx}
            />
        )
      }
    </>
  );
}

export default LoadProfileList;
