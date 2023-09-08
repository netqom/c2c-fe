import { configureStore } from '@reduxjs/toolkit';
import CommonReducer from '../redux/Common/CommonReducer';

export const store = configureStore({
  reducer: {
    common: CommonReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});
