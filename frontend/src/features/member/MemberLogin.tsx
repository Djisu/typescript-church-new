import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import { MemberLoginResponse, memberLogin } from './memberSlice'
import './Login.css'; 

// interface FormElements extends HTMLFormControlsCollection {
//   usernameInput: HTMLInputElement
// }
// interface UsernameFormElement extends HTMLFormElement {
//   readonly elements: FormElements
// }
interface MemberLoginPageFormFields extends HTMLFormControlsCollection {
  email: HTMLInputElement,
  password: HTMLInputElement,
}
interface MemberLoginPageFormElements extends HTMLFormElement {
  readonly elements: MemberLoginPageFormFields
}

// interface MemberLoginPayload {
//   token: string;         
//   message: string;      
//   email: string;        
//   password: string;     
// }

export const MemberLogin = () => {

  console.log('in MemberLogin!!!!')

  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<MemberLoginPageFormElements>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    console.log('in MemberLogin handleSubmit!!!!')

    const email = e.currentTarget.elements.email.value;
    const password = e.currentTarget.elements.password.value;

    const credentials = { email, password };

    try {  
      // Dispatch the login action
      const resultAction = await dispatch(memberLogin(credentials)) as { 
        payload: MemberLoginResponse; 
        type: string; 
      };
    
      // Check for success and navigate
      if (memberLogin.fulfilled.match(resultAction)) {
        const { token, member } = resultAction.payload;
        console.log('Login successful:', token, member);
    
        // Store member details in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('id', member._id?.toString() || '');
        localStorage.setItem('username', member.username);
        localStorage.setItem('email', member.email);
        localStorage.setItem('role', member.role);
        
        setMessage('Login successful');
        navigate("/dashboard");
      } else if (memberLogin.rejected.match(resultAction)) {
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
      <h3 style={{ color: 'black' }}>Member Please log in:</h3>
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
        Forgot Password? <Link to="/member/request-password-reset">Forgot Password?</Link>
        </p>
      </form>
     
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </section>
  );
};