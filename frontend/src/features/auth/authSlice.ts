import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
//import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { RootState } from '../../app/store';
import { detokenize } from './detokenize';

interface AuthState {
  [x: string]: any;
  user: {
    id: string,
    name:string,
    email: string,
    role: string,
    avatar: string,
    token: string,
} | null,

  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
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

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {

    //console.log('in auth/login', credentials)

    //const response = await axios.post('/api/auth', credentials);
    const response = await axios.post('http://localhost:3000/api/auth', credentials);

    //console.log('response.data: ', response.data)

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('isAuthenticated', 'true')

    return response.data;
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
      await axios.post('http://localhost:3000/api/auth/request-password-reset', { email });

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
      await axios.post('http://localhost:3000/api/auth/reset-password', { token, newPassword });
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
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const [encryptedId, username, userEmail, role, avatar] = detokenize(action.payload.token);

        // Update the user state with detokenized values
        state.user = {
          id: encryptedId,
          name: username,
          email: userEmail,
          role,
          avatar,
          token: action.payload.token // Assuming you still want to store the token
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Login failed';
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
export const selectCurrentUsername = (state: RootState) => state.auth.user?.name || ''


export const { setUser } = authSlice.actions;
export default authSlice.reducer;
