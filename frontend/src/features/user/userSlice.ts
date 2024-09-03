import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
  users: IUser[]; //| null
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  users: [], // Set to null initially
  loading: 'idle',
  error: null,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'user/register',
  async (formData: FormData) => {
    const response = await axios.post('http://localhost:3000/api/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: Partial<Omit<IUser, '_id'>>, { getState }) => {
    const { users } = (getState() as RootState).users;

    if (!users || users.length === 0) throw new Error('User not found');

    const response = await axios.patch(`http://localhost:3000/api/users/${users[0]._id}`, userData);
    return response.data;
  }
);

// Async thunk for fetching all users
export const findAllUsers = createAsyncThunk(
  'user/findAllUsers',
  async () => {
    console.log('in user/findAllUsers')

    const response = await axios.get('http://localhost:3000/api/users');
    return response.data;
  }
);

// Async thunk for finding a user by ID
export const findUser = createAsyncThunk(
  'user/findUser',
  async (userId: string | null) => {
    //console.log('userId: ', userId)

    if (!userId) throw new Error('User ID is required');

    const response = await axios.get(`http://localhost:3000/api/users/${userId}`);

    return response.data;
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.users = action.payload; // Update users with the new user
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
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
        state.loading = 'pending'; // Set loading state
      })
      .addCase(findAllUsers.fulfilled, (state, action) => {
        state.loading = 'succeeded'; // Set loading to succeeded
        state.users = action.payload; // Update users with the fetched data
      })
      .addCase(findAllUsers.rejected, (state, action) => {
        state.loading = 'failed'; // Set loading to failed
        state.error = action.error.message || 'Failed to fetch users'; // Capture error message
      })
      .addCase(findUser.pending, (state) => {
        state.loading = 'pending'; // Set loading state
      })
      .addCase(findUser.fulfilled, (state, action) => {
        state.loading = 'succeeded'; // Set loading to succeeded
        state.users = action.payload; // Update users with the fetched data
      })
      .addCase(findUser.rejected, (state, action) => {
        state.loading = 'failed'; // Set loading to failed
        state.error = action.error.message || 'Failed to fetch users'; // Capture error message
      })
  },
});

// Selectors
export const selectAllUsers = (state: RootState) => state.users;

export const selectUserById = (state: RootState, userId: (string | null)) => {
  // Check if state.users and state.users.users are defined and are arrays
  if (!state.users || !Array.isArray(state.users.users)) {
      return null; // or handle the error as needed
  }
  
  return state.users.users.find(user => user._id === userId) || null; // Return null if not found
};
export const { setUser } = userSlice.actions;
export default userSlice.reducer;




