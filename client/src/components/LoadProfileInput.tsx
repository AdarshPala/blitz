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
      <h5>Load Profile #{idx}</h5>
      <h4>Duration:</h4>
      <input className="form-control input-field" type="text" defaultValue={loadProfile.duration} onChange={changeLoadProfile('duration')} />
      <h4>Request Rate:</h4>
      <input className="form-control input-field" type="text" defaultValue={loadProfile.requestRate} onChange={changeLoadProfile('requestRate')} />
    </div>
  );
}

export default LoadProfileInput;
