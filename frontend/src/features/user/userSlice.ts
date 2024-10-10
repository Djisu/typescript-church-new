import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';

export interface IUser {
    _id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    avatar?: string;
    token?: string | null;
}

export interface UserState {
  users: IUser[]; 
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: 'idle',
  error: null,
};

// Determine the base URL based on the environment
const BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://typescript-church-new.onrender.com');

console.log('BASE_URL:', BASE_URL);

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV)

// Async thunk for user registration
export const registerUser = createAsyncThunk<IUser, FormData>(
  'user/register',
  async (formData) => {
    const response = await axios.post(`${BASE_URL}/api/users`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk<IUser, Partial<Omit<IUser, '_id'>>>(
  'user/updateProfile',
  async (userData, { getState }) => {
    const { users } = (getState() as RootState).users;

    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const response = await axios.patch(`${BASE_URL}/api/users/${users[0]._id}`, userData);
    return response.data;
  }
);

// Async thunk for fetching all users
export const findAllUsers = createAsyncThunk<IUser[]>(
  'user/findAllUsers',
  async () => {
    const response = await axios.get(`${BASE_URL}/api/users`);
    return response.data;
  }
);

// Async thunk for finding a user by ID
export const findUser = createAsyncThunk<IUser, string | null>(
  'user/findUser',
  async (userId) => {
    if (!userId || userId.length === 0) {
      throw new Error('User ID is required');
    }

    const response = await axios.get(`${BASE_URL}/api/users/${userId}`);
    return response.data;
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser[]>) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = 'succeeded';
        state.users.push(action.payload); // Add new user to the list
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = 'succeeded';
        if (state.users) {
          const userIndex = state.users.findIndex(user => user._id === action.payload._id);
          if (userIndex !== -1) {
            state.users[userIndex] = { ...state.users[userIndex], ...action.payload };
          }
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Profile update failed';
      })
      .addCase(findAllUsers.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(findAllUsers.fulfilled, (state, action: PayloadAction<IUser[]>) => {
        state.loading = 'succeeded';
        state.users = action.payload; // Update users with the fetched data
      })
      .addCase(findAllUsers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(findUser.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(findUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = 'succeeded';
        state.users = [action.payload]; // Update users with the fetched user
      })
      .addCase(findUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch user';
      });
  },
});

// Selectors
export const selectAllUsers = (state: RootState) => state.users;

export const selectUserById = (state: RootState, userId: string | null) => {
  if (!state.users || !Array.isArray(state.users.users)) {
    return null; // or handle the error as needed
  }
  
  return state.users.users.find(user => user._id === userId) || null; // Return null if not found
};

export const { setUser } = userSlice.actions;
export default userSlice.reducer;