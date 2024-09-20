import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import { login } from './authSlice'
import { detokenize } from './detokenize'
import './Login.css'; 

// interface FormElements extends HTMLFormControlsCollection {
//   usernameInput: HTMLInputElement
// }
// interface UsernameFormElement extends HTMLFormElement {
//   readonly elements: FormElements
// }
interface LoginPageFormFields extends HTMLFormControlsCollection {
  email: HTMLInputElement,
  password: HTMLInputElement,
}
interface LoginPageFormElements extends HTMLFormElement {
  readonly elements: LoginPageFormFields
}

export const Login = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  let resultAction: any = ''

  const handleSubmit = async (e: React.FormEvent<LoginPageFormElements>) => {
    e.preventDefault();

    const email = e.currentTarget.elements.email.value;
    const password = e.currentTarget.elements.password.value;

    const credentials = { email, password };
    resultAction = await dispatch(login(credentials));

    //console.log('Dispatch Result:', resultAction);

    // Check for success and navigate
    if (login.fulfilled.match(resultAction)) {
      //console.log('Login successful, navigating...');
     
      const [encryptedId, username, userEmail, role, avatar]: [string, string, string, string, string] = detokenize(resultAction.payload.token);

      localStorage.setItem('id', encryptedId);
      localStorage.setItem('username', username);
      localStorage.setItem('email', userEmail);
      localStorage.setItem('role', role);
      localStorage.setItem('avatar', avatar)
      
      navigate("/dashboard")
    } else {
      console.log('Login failed');
    }
  };

  return (
    <section className="login-container">
      <h2>Welcome to Church!</h2>
      <h3>Please log in:</h3>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input id="email" name="email" className="form-control" type="text" required autoComplete="email"  />
        </div>
        
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input id="password" name="password" className="form-control" type="password" required autoComplete="password"  />
        </div>
        <div className="col-auto">
          <span id="passwordHelpInline" className="form-text">
            Must be more than 6 characters long.
          </span>
        </div>
         
        <button type="submit" className="btn btn-primary">Log In</button>
      </form>
    </section>
  );
};