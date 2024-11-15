import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';
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

export interface EventState {
  events: IEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
};

const BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://typescript-church-new.onrender.com');

// thunkActions
export const createEvent = createAsyncThunk<IEvent, Omit<IEvent, '_id' | 'createdAt' | 'updatedAt'>, { rejectValue: string }>(
  'events/createEvent',
  async (newEvent, { rejectWithValue }) => {
    try {      
      const response = await axiosInstance.post<IEvent>(`${BASE_URL}/api/events/create`, JSON.stringify(newEvent), {
        headers: {
            'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const registerMember = createAsyncThunk(
  'members/register',
  async (registrationData: { memberId: string; eventId: string; registeredAt: string }, { rejectWithValue }) => {
    try {
      // Using axios for the API call
      const response = await axiosInstance.post(`${BASE_URL}/api/events/register`, registrationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Return the data directly from the response
      return response.data; // Assuming the response data contains the necessary information
    } catch (error: any) {
      // Handle any errors that occur during the request
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to register member');
      }
      return rejectWithValue('Failed to register member');
    }
  }
);

export const updateEvent = createAsyncThunk<IEvent, Partial<Omit<IEvent, 'createdAt' | 'updatedAt'>>, { rejectValue: string }>(
  'events/updateEvent',
  async (updatedEvent, { rejectWithValue }) => {
    try {
      const { _id, ...rest } = updatedEvent;
      const response = await axiosInstance.put<IEvent>(`${BASE_URL}/api/events/${_id}`, rest);
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
      return eventId; // Return the event ID after successful deletion
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Error deleting event");
    }
  }
);

export const searchEvents = createAsyncThunk<IEvent[], void, { rejectValue: string }>(
  'events/searchEvents',
  async (_, { rejectWithValue }) => { // Remove searchParams and use _ as a placeholder
    console.log('in searchEvents slice');
    try {
      const response = await axiosInstance.get<IEvent[]>(`${BASE_URL}/api/events`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// export const searchEvents = createAsyncThunk<IEvent[], Partial<IEvent>, { rejectValue: string }>(
//   'events/searchEvents',
//   async (searchParams, { rejectWithValue }) => {
//     console.log('in searchEvents slice')
//     try {
//       const response = await axiosInstance.get<IEvent[]>(`${BASE_URL}/api/events`, { params: searchParams });
//       return response.data;
//     } catch (error: any) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );



const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<IEvent[]>) => {
      state.events = action.payload;
    },
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