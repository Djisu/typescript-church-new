import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import eventReducer from '../features/event/eventSlice'
import memberReducer from '../features/member/memberSlice'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        events: eventReducer,
        members: memberReducer,
        users: userReducer
    }
})

// Infer the type of `store 
export type AppStore = typeof store

// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch

//Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>

// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>