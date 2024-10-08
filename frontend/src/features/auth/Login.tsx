import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import { LoginResponse, login } from './authSlice'
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

// interface LoginPayload {
//   token: string;         
//   message: string;      
//   email: string;        
//   password: string;     
// }

export const Login = () => {
  console.log('in Login component')

  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<LoginPageFormElements>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    console.log('in login handleSubmit!!!!')

    const email = e.currentTarget.elements.email.value;
    const password = e.currentTarget.elements.password.value;

    const credentials = { email, password };

    try {  
      // Dispatch the login action
      const resultAction = await dispatch(login(credentials)) as { 
        payload: LoginResponse; 
        type: string; 
      };
    
      // Check for success and navigate
      if (login.fulfilled.match(resultAction)) {
        const { token, user } = resultAction.payload;
    
        // Store user details in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('id', user.id);
        localStorage.setItem('username', user.username);
        localStorage.setItem('email', user.email);
        localStorage.setItem('role', user.role);
        localStorage.setItem('avatar', user.avatar);
        
        setMessage('Login successful');
        navigate("/dashboard");
      } else if (login.rejected.match(resultAction)) {
        // Handle rejected action
        console.log('Login failed');
        setError(resultAction.payload?.message || 'An error occurred during login.');
      } else {
        // Handle any other action types if necessary
        console.log('Unexpected action:', resultAction);
        setError('An unexpected error occurred.');
      }
    } catch (err: any) {
      // Handle any caught errors
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <section className="login-container">
      <h2 style={{ color: 'black' }}>Welcome to Church!</h2>
      <h3 style={{ color: 'black' }}>User Please log in:</h3>
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
        <p className="my-1">
          Don't have an account? <Link to="/memberregister">Sign Up</Link>
        </p>
        <p className="my-1">
        Forgot Password? <Link to="/auth/request-password-reset">Forgot Password?</Link>
        </p>
      </form>
     
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </section>
  );
};