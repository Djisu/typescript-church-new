import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface IMember {
    _id?: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address: string;
    membership_type: string;
    status?: string;
    affiliated: string;
    joinedDate?: Date;
    attendanceRecord?: { date: Date; attended: boolean }[];
    tithes?: { date: Date; amount: number }[];
    offerings?: { date: Date; amount: number }[];
    smallGroups?: string[];
    ministries?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

// interface Member {
//     id: string;
//     username: string;
//     email: string;
//     role: string;
// }

export interface MemberLoginResponse {
    token: string;
    member: IMember;
}

export interface MemberLoginError {
    message: string;
}

interface ResetPasswordResponse {
    message: string;
}

interface ResetPasswordError {
    message: string;
}

interface RequestPasswordResponse {
    message: string;
}

interface RequestPasswordError {
    message: string;
}

interface MemberState {
    members: IMember[];
    currentMember: IMember | null; // State for the currently authenticated member
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: MemberState = {
    members: [],
    currentMember: null, // Initialize currentMember as null
    loading: 'idle',
    error: null,
};

const BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://typescript-church-new.onrender.com');

export const createMember = createAsyncThunk<IMember, Omit<IMember, '_id' | 'createdAt' | 'updatedAt'>>(
    'member/create',
    async (memberData) => {
        const response = await axios.post(`${BASE_URL}/api/members/create`, JSON.stringify(memberData), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
);

export const memberLogin = createAsyncThunk<MemberLoginResponse, { email: string; password: string }, { rejectValue: MemberLoginError }>(
    'member/memberLogin',
    async (credentials, { rejectWithValue }) => {
        try {
            console.log('in member/memberLogin memberSlice',credentials);
            const response = await axios.post(`${BASE_URL}/api/members/login`, credentials);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('isAuthenticated', 'true');

            console.log('after memberLogin response',response);

            return response.data;
        } catch (error: any) {
            return rejectWithValue({
                message: error.response?.data?.message || 'Login failed. Please check your credentials.',
            });
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('avatar');
    return;
});

export const memberRequestPasswordReset = createAsyncThunk<RequestPasswordResponse, string, { rejectValue: RequestPasswordError }>(
    'auth/memberRequestPasswordReset',
    async (email: string, { rejectWithValue }) => {
        try {
            await axios.post(`${BASE_URL}/api/auth/request-password-reset`, { email });
            return { message: 'Password reset email sent.' };
        } catch (error: any) {
            return rejectWithValue({ message: error.response?.data?.message || 'An error occurred.' });
        }
    }
);

export const memberResetPassword = createAsyncThunk<ResetPasswordResponse, { token: string; newPassword: string }, { rejectValue: ResetPasswordError }>(
    'auth/resetPassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            await axios.post(`${BASE_URL}/api/auth/reset-password`, { token, newPassword });
            return { message: 'Password has been reset successfully.' };
        } catch (error: any) {
            return rejectWithValue({ message: error.response?.data?.message || 'An error occurred.' });
        }
    }
);

export const deleteMember = createAsyncThunk<string, string>(
    'member/delete',
    async (memberId) => {
        await axios.delete(`${BASE_URL}/api/members/${memberId}`);
        return memberId;
    }
);

export const findMember = createAsyncThunk<IMember, string>(
    'member/get',
    async (memberId) => {
        const response = await axios.get(`${BASE_URL}/api/members/${memberId}`);
        return response.data;
    }
);

export const updateMember = createAsyncThunk<IMember, { id: string; data: Omit<IMember, '_id' | 'createdAt' | 'updatedAt'> }>(
    'member/update',
    async (params) => {
        const { id, data } = params;
        const response = await axios.put(`${BASE_URL}/api/members/${id}`, JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
);

export const findAllMembers = createAsyncThunk<IMember[]>(
    'member/findAllMembers',
    async () => {
        const response = await axios.get(`${BASE_URL}/api/members`);
        return response.data;
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

const memberSlice = createSlice({
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
            .addCase(findAllMembers.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(findAllMembers.fulfilled, (state, action: PayloadAction<IMember[]>) => {
                state.loading = 'succeeded';
                state.members = action.payload;
            })
            .addCase(findAllMembers.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message || 'Failed to fetch members';
            })
            .addCase(findMember.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(findMember.fulfilled, (state, action: PayloadAction<IMember>) => {
                state.loading = 'succeeded';
                state.currentMember = action.payload; // Set current member
            })
            .addCase(findMember.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message || 'Member retrieval failed';
            })
            .addCase(updateMember.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(updateMember.fulfilled, (state, action: PayloadAction<IMember>) => {
                state.loading = 'succeeded';
                const memberIndex = state.members.findIndex((member) => member._id === action.payload._id);
                if (memberIndex !== -1) {
                    state.members[memberIndex] = action.payload;
                }
                // Also update currentMember if it's being updated
                if (state.currentMember?._id === action.payload._id) {
                    state.currentMember = action.payload;
                }
            })
            .addCase(updateMember.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message || 'Member update failed';
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
                    const attendanceRecord = state.members[memberIndex].attendanceRecord || [];
                    attendanceRecord.push({
                        date: action.payload.date,
                        attended: action.payload.attended,
                    });
                    state.members[memberIndex].attendanceRecord = attendanceRecord;
                }
            })
            .addCase(recordAttendance.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message || 'Attendance recording failed';
            })
            .addCase(memberLogin.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(memberLogin.fulfilled, (state, action: PayloadAction<MemberLoginResponse>) => {
                state.loading = 'succeeded';
                const { token, member } = action.payload;

                // Store member in state
                state.currentMember = member;

                // Store token in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('role', member.role); // Store role in localStorage if needed
            })
            .addCase(memberLogin.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload?.message || action.error.message || 'Login failed';
            })
            .addCase(logout.fulfilled, (state) => {
                state.members = []; // Clear members on logout
                state.currentMember = null; // Clear current member on logout
            })
            .addCase(memberResetPassword.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(memberResetPassword.fulfilled, (state) => {
                state.loading = 'succeeded';
            })
            .addCase(memberResetPassword.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message || 'Password reset failed';
            })
            .addCase(memberRequestPasswordReset.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(memberRequestPasswordReset.fulfilled, (state) => {
                state.loading = 'succeeded';
            })
            .addCase(memberRequestPasswordReset.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message || 'Password reset failed';
            });
    },
});

export const { setMembers } = memberSlice.actions;
export default memberSlice.reducer;