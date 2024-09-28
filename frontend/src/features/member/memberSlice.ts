import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface IMember {
    _id: string; // Changed from ObjectId to string
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    joinedDate: Date;
    attendanceRecord: { date: Date; attended: boolean }[];
    tithes: { date: Date; amount: number }[];
    offerings: { date: Date; amount: number }[];
    smallGroups: string[]; // Changed from mongoose.Types.ObjectId[] to string[]
    ministries: string[]; // Changed from mongoose.Types.ObjectId[] to string[]
    createdAt: Date;
    updatedAt: Date;
}

interface MemberState {
  members: IMember[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MemberState = {
  members: [],
  loading: 'idle',
  error: null,
};

const BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://church-management-backend.onrender.com');

console.log('BASE_URL:', BASE_URL);

export const createMember = createAsyncThunk<IMember, Omit<IMember, '_id' | 'createdAt' | 'updatedAt'>>(
  'member/create',
  async (memberData) => {
    const response = await axios.post(`${BASE_URL}/api/members`, JSON.stringify(memberData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }
);

export const deleteMember = createAsyncThunk<string, string>(
  'member/delete',
  async (memberId) => {
    await axios.delete(`${BASE_URL}/api/members/${memberId}`);
    return memberId;
  }
);

export const recordAttendance = createAsyncThunk<any, { memberId: string; date: Date; attended: boolean }>(
  'member/recordAttendance',
  async (data) => {
    const { memberId, date, attended } = data;
    const response = await axios.post(`${BASE_URL}/api/members/${memberId}/attendance`, { date, attended });
    return response.data;
  }
);

// ... (other async thunks remain unchanged)

export const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<IMember[]>) => {
      state.members = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMember.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(createMember.fulfilled, (state, action: PayloadAction<IMember>) => {
        state.loading = 'succeeded';
        state.members.push(action.payload);
      })
      .addCase(createMember.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Member creation failed';
      })
      .addCase(deleteMember.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(deleteMember.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = 'succeeded';
        state.members = state.members.filter((member) => member._id !== action.payload);
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Member deletion failed';
      })
      .addCase(recordAttendance.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(recordAttendance.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = 'succeeded';
        const memberIndex = state.members.findIndex((member) => member._id === action.payload.memberId);
        if (memberIndex !== -1) {
          state.members[memberIndex].attendanceRecord.push({
            date: action.payload.date,
            attended: action.payload.attended,
          });
        }
      })
      .addCase(recordAttendance.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Attendance recording failed';
      });
  },
});

export const { setMembers } = memberSlice.actions;
export default memberSlice.reducer;