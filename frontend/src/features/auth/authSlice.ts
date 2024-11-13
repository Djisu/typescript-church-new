import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';

interface User {
  id: string;
  username: string; // Changed to match your backend response
  email: string;
  role: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the response type for successful login
export interface LoginResponse {
  token: string;
  user: User; // The user object returned from the backend
}

// Define the error response type for login
export interface LoginError {
  message: string;
}

// Define the return type of the thunk
interface ResetPasswordResponse {
  message: string;
}

// Define the error response type
interface ResetPasswordError {
  message: string;
}

interface RequestPasswordResponse {
  message: string;
}

interface RequestPasswordError {
  message: string;
}


const initialState: AuthState = {
  user: null,
  loading: 'idle',
  error: null,
};

const BASE_URL = import.meta.env.VITE_BASE_URL || 
(import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://typescript-church-new.onrender.com');

console.log('in authSlice.ts')

console.log('BASE_URL:', BASE_URL);

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV)
console.log('BASE_URL: ', BASE_URL)

export const login = createAsyncThunk<LoginResponse, { email: string; password: string }, { rejectValue: LoginError }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, credentials);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAuthenticated', 'true');
      
      return response.data; // Return the full response
    } catch (error: any) {
      console.error('Login Error:', error);
      // Return the error message for further handling
      return rejectWithValue({
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  //const navigate = useNavigate();

  console.log('in logout!!!!!!!')

  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('token')
  localStorage.removeItem('id');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  localStorage.removeItem('avatar')

  //navigate("/landing")
  return;
});

// Request password reset
export const requestPasswordReset = createAsyncThunk<RequestPasswordResponse, string, { rejectValue: RequestPasswordError }>(
  'auth/requestPasswordReset',
  async (email: string, { rejectWithValue }) => {

    console.log('in requestPasswordReset')

    try {
      //const response = await axios.post('http://localhost:3000/api/auth', credentials);
      await axios.post(`${BASE_URL}/api/auth/request-password-reset`, { email });

      return { message: 'Password reset email sent.' };
    } catch (error: any) {
      return rejectWithValue({ message: error.response?.data?.message || 'An error occurred.' });
    }
  }
);

// Password reset
export const resetPassword = createAsyncThunk<ResetPasswordResponse, { token: string; newPassword: string }, { rejectValue: ResetPasswordError }>(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    console.log('in auth/resetPassword')
    try {
      await axios.post(`${BASE_URL}/api/auth/reset-password`, { token, newPassword });
      return { message: 'Password has been reset successfully.' };
    } catch (error: any) {
      return rejectWithValue({ message: error.response?.data?.message || 'An error occurred.' });
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = 'pending';
        state.error = null; // Clear error on new request
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = 'succeeded';

         // Store the token and user details
         const {token, user} = action.payload;
 
         localStorage.setItem('token', token); // Store the token if needed
 
         // Update the user state
         state.user = {
           id: user.id,
           username: user.username,
           email: user.email,
           role: user.role,
           avatar: user.avatar,
         };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload?.message || action.error.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = 'succeeded';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Password reset failed';
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = 'succeeded';
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Password reset failed';
      });
  },
});

// Selector function
export const selectCurrentUsername = (state: RootState) => state.auth.user?.username || ''

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
