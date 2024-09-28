import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  registrations: { memberId: string; registeredAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://church-management-backend.onrender.com');


// thunkActions
export const createEvent = createAsyncThunk<IEvent, Omit<IEvent, '_id' | 'createdAt' | 'updatedAt'>, { rejectValue: string }>(
  'events/createEvent',
  async (newEvent, { rejectWithValue }) => {
    try {
      const response = await axios.post<IEvent>(`${BASE_URL}/api/events`, newEvent);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateEvent = createAsyncThunk<IEvent, Partial<Omit<IEvent, 'createdAt' | 'updatedAt'>>, { rejectValue: string }>(
  'events/updateEvent',
  async (updatedEvent, { rejectWithValue }) => {
    try {
      const { _id, ...rest } = updatedEvent;
      const response = await axios.put<IEvent>(`${BASE_URL}/api/events/${_id}`, rest);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteEvent = createAsyncThunk<string, string, { rejectValue: string }>(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/events/${eventId}`);
      return eventId;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const searchEvents = createAsyncThunk<IEvent[], Partial<IEvent>, { rejectValue: string }>(
  'events/searchEvents',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axios.get<IEvent[]>(`${BASE_URL}/api/events`, { params: searchParams });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
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
      .addCase(createEvent.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Error creating event";
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<IEvent>) => {
        state.loading = false;
        const index = state.events.findIndex((event) => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Error updating event";
      })
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.events = state.events.filter((event) => event._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Error deleting event";
      })
      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action: PayloadAction<IEvent[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(searchEvents.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Error searching events";
      });
  },
});

export default eventSlice.reducer;