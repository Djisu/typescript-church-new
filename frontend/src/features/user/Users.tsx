import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { registerUser } from './userSlice';
import { Link } from 'react-router-dom';
import AlertContainer from '../../components/AlertContainer';
import useAlerts from '../../components/useAlerts';

const Users = () => {
  const dispatch = useAppDispatch();
  const { alerts, addAlert } = useAlerts();
  let [passwordError, setPasswordError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Clean up the URL object when the component unmounts or the avatar changes
  useEffect(() => {
    return () => {
      if (avatar) {
        URL.revokeObjectURL(avatar.name);
      }
    };
  }, [avatar]);

  // Handle file upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setAvatar(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!avatar) {
      console.error('No avatar uploaded');
      return;
    }
  
    const form = e.target as HTMLFormElement;
    const username = (form.username as HTMLInputElement)?.value;
    const email = (form.email as HTMLInputElement)?.value;
    const password = (form.password as HTMLInputElement)?.value;
    const confirmPassword = (form.confirmPassword as HTMLInputElement)?.value;
    const role = "user";
  
    // Compare passwords
    if (password !== confirmPassword) {
      addAlert('error', 'Passwords do not match');
      setPasswordError('Passwords do not match');
      return;
    }
  
    if (password.length < 6) {
      addAlert('error', 'Password must be at least 6 characters');
      setPasswordError('Password must be at least 6 characters');
      return;
    }
  
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    formData.append('avatar', avatar); // Append the avatar file

    // Log the details
    console.log("Details:", { username, email, password, role, avatar });
  
    // Log FormData contents
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  
    // Dispatch to action creator
    try {
      const data = await dispatch(registerUser(formData)).unwrap();
  
      if (registerUser.rejected.match(data)) {
        addAlert('error', data.payload as string);

        passwordError =  data.payload as string
        setPasswordError(passwordError);
      } else {
        addAlert('success', 'User registered successfully!');

        setPasswordError(null);
        formRef.current?.reset();
        setAvatar(null); // Clear avatar state
      }
    } catch (error) {
      addAlert('error', 'An error occurred during registration');
      setPasswordError('An error occurred during registration');
    }
  };

  // Clear the form 
  const clearForm = () => {
    if (formRef.current) {
      formRef.current.reset();
      setAvatar(null);
    }
  };

  return (
    <>
      <AlertContainer alerts={alerts} />
      <section>
        <h2>Create User</h2>
        <form ref={formRef} onSubmit={handleSubmit}>
              <div className='mb-3'>
                <label htmlFor="username" className="form-label">User Name</label>
                <input 
                  className="form-control" 
                  id="username" 
                  name="username" 
                  type="text" 
                  required 
                  autoComplete="username" 
                />
              </div>

              <div className='mb-3'>
                <label htmlFor="email" className="form-label">Email: use email with avatar</label>
                <input 
                  className="form-control" 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  autoComplete="email" 
                />
              </div>
              <small className="form-text">
                This site uses Gravatar so if you want a profile image, use an email with a photo.
              </small>

              <div className='mb-3'>
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  className="form-control" 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  autoComplete="new-password" 
                />
              </div>

              <div className='mb-3'>
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  className="form-control" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  autoComplete="new-password" 
                />
              </div>

              <div className='mb-3'>
                <label className="form-label" htmlFor="photo">Upload your photo</label>
                <input
                  className="form-control"
                  id="photo"
                  name="photo"
                  type="file"
                  required
                  onChange={handleAvatarUpload}
                />
                {avatar && (
                  <img
                    src={URL.createObjectURL(avatar)}
                    alt="Avatar"
                    style={{ maxWidth: '200px' }}
                  />
                )}
              </div>

          <div>
            <button className="btn btn-primary mb-3" type="submit">
              Create User
            </button>
            <button type="button" onClick={clearForm}>
              Clear
            </button>
          </div>
        </form>
        <p className="my-1">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </section>
    </>
  );
};

export default Users;