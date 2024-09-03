import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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

export const createMember = createAsyncThunk(
  'member/create',
  async (memberData: Omit<IMember, '_id' | 'createdAt' | 'updatedAt'>) => {
    console.log('in member/create')

    const response = await axios.post('http://localhost:3000/api/members', memberData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const deleteMember = createAsyncThunk(
  'member/delete',
  async (memberId: string) => {
    await axios.delete(`/api/members/${memberId}`);
    return memberId;
  }
);

export const recordAttendance = createAsyncThunk(
  'member/recordAttendance',
  async (data: { memberId: string; date: Date; attended: boolean }) => {
    const { memberId, date, attended } = data;
    const response = await axios.post(`/api/members/${memberId}/attendance`, { date, attended });
    return response.data;
  }
);

export const payTithe = createAsyncThunk(
  'member/payTithe',
  async (data: { memberId: string; date: Date; amount: number }) => {
    const { memberId, date, amount } = data;
    const response = await axios.post(`/api/members/${memberId}/tithes`, { date, amount });
    return response.data;
  }
);

export const updateTithe = createAsyncThunk(
  'member/updateTithe',
  async (data: { memberId: string; tithesId: string; date: Date; amount: number }) => {
    const { memberId, tithesId, date, amount } = data;
    const response = await axios.patch(`/api/members/${memberId}/tithes/${tithesId}`, { date, amount });
    return response.data;
  }
);

export const deleteTithe = createAsyncThunk(
  'member/deleteTithe',
  async (data: { memberId: string; tithesId: string }) => {
    const { memberId, tithesId } = data;
    await axios.delete(`/api/members/${memberId}/tithes/${tithesId}`);
    return { memberId, tithesId };
  }
);

export const payOffering = createAsyncThunk(
  'member/payOffering',
  async (data: { memberId: string; date: Date; amount: number }) => {
    const { memberId, date, amount } = data;
    const response = await axios.post(`/api/members/${memberId}/offerings`, { date, amount });
    return response.data;
  }
);

export const updateOffering = createAsyncThunk(
  'member/updateOffering',
  async (data: { memberId: string; offeringsId: string; date: Date; amount: number }) => {
    const { memberId, offeringsId, date, amount } = data;
    const response = await axios.patch(`/api/members/${memberId}/offerings/${offeringsId}`, { date, amount });
    return response.data;
  }
);

export const deleteOffering = createAsyncThunk(
  'member/deleteOffering',
  async (data: { memberId: string; offeringsId: string }) => {
    const { memberId, offeringsId } = data;
    await axios.delete(`/api/members/${memberId}/offerings/${offeringsId}`);
    return { memberId, offeringsId };
  }
);

export const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMember.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(createMember.fulfilled, (state, action) => {
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
      .addCase(deleteMember.fulfilled, (state, action) => {
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
      .addCase(recordAttendance.fulfilled, (state, action) => {
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