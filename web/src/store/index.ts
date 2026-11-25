import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/store/api';

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: defaults => defaults().concat(api.middleware),
  devTools: import.meta.env.DEV
});
