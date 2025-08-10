import { configureStore } from '@reduxjs/toolkit';
import formBuilderReducer from './formBuilderSlice';
import {savedFormsReducer } from './savedFormsSlice';
import { loadFormsFromLocalStorage, saveFormsToLocalStorage } from '../utils/localStorage';

export const store = configureStore({
  reducer: {
    formBuilder: formBuilderReducer,
    savedForms: savedFormsReducer,
  },
  preloadedState: {
    savedForms: {
      forms: loadFormsFromLocalStorage(),
    }
  }
});

store.subscribe(() => {
  const state = store.getState();
  saveFormsToLocalStorage(state.savedForms.forms);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
