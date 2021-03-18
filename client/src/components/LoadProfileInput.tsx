import { LoadProfile } from '../types';
import './LoadProfileInput.css';

interface Props {
  setLoadProfiles: React.Dispatch<React.SetStateAction<LoadProfile[]>>; 
  idx: number,
  loadProfile: LoadProfile;
};

function LoadProfileInput({ setLoadProfiles, idx, loadProfile }: Props) {
  const changeLoadProfile = (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      if (!input || isNaN(+input)) {
        return;
      }

      setLoadProfiles(((currLoadProfiles) => 
        currLoadProfiles.map((profile, profileIdx) => {
          if (profileIdx === idx) {
            return {
              duration: field === 'duration' ? +input : profile.duration,
              requestRate: field === 'requestRate' ? +input : profile.requestRate,
            };
          } else {
            return profile;
          }
        })
      ));
    };

  return (
    <div className="load-profile-input">
      <h4>Number: {idx}</h4>
      <h3>Duration:</h3>
      <input type="text" defaultValue={loadProfile.duration} onChange={changeLoadProfile('duration')} />
      <h3>Request Rate:</h3>
      <input type="text" defaultValue={loadProfile.requestRate} onChange={changeLoadProfile('requestRate')} />
    </div>
  );
}

export default LoadProfileInput;
