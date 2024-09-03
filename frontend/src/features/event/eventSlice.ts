import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import mongoose from 'mongoose';

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  registrations: { memberId: mongoose.Types.ObjectId; registeredAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

// thunkActions
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (newEvent: Omit<IEvent, '_id' | 'createdAt' | 'updatedAt'>, thunkAPI) => {
    try {
      const response = await axios.post<IEvent>('/api/events', newEvent);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async (updatedEvent: Partial<Omit<IEvent, 'createdAt' | 'updatedAt'>>, thunkAPI) => {
    try {
      const { _id, ...rest } = updatedEvent;
      const response = await axios.put<IEvent>(`/api/events/${_id}`, rest);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string, thunkAPI) => {
    try {
      await axios.delete(`/api/events/${eventId}`);
      return eventId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const searchEvents = createAsyncThunk(
  'events/searchEvents',
  async (searchParams: Partial<IEvent>, thunkAPI) => {
    try {
      const response = await axios.get<IEvent[]>('/api/events', {
        params: searchParams,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

interface EventState {
  events: IEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Add any additional reducers you might need
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<IEvent>) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<IEvent>) => {
        state.loading = false;
        const index = state.events.findIndex((event) => event._id.toString() === action.payload._id.toString());
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.events = state.events.filter((event) => event._id.toString() !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action: PayloadAction<IEvent[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default eventSlice.reducer;