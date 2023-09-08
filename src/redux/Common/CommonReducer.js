import { createSlice } from '@reduxjs/toolkit'

const initialState = { pageLoading: true, raiseNotificationBell: false, isLoggedIn: false, loading: false, contentloading: false, alert: null, user: {}, token: null, cart: {}, categories: [], chatVisibility: false, loading_chat_user: false }

export const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        callCommonAction: (state, action) => {
            return state = { ...state, ...action.payload }
        }
    },
})

// Action creators are generated for each case reducer function
export const { callCommonAction } = commonSlice.actions

export default commonSlice.reducer