import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FormSchema } from '../types';
import { loadFormsFromLocalStorage, saveFormsToLocalStorage } from '../utils/localStorage';

type State = {
  forms: FormSchema[];
};

// Load initial data from localStorage
const initialState: State = {
  forms: loadFormsFromLocalStorage()
};

const savedFormsSlice = createSlice({
  name: 'savedForms',
  initialState,
  reducers: {
    // Add a new form to saved list
    addForm(state, action: PayloadAction<FormSchema>) {
      state.forms.unshift(action.payload); // newest first
      saveFormsToLocalStorage(state.forms);
    },

    // Remove form by ID
    removeForm(state, action: PayloadAction<string>) {
      state.forms = state.forms.filter(form => form.id !== action.payload);
      saveFormsToLocalStorage(state.forms);
    },

    // Replace entire forms list (optional, for syncing)
    setForms(state, action: PayloadAction<FormSchema[]>) {
      state.forms = action.payload;
      saveFormsToLocalStorage(state.forms);
    }
  }
});

// Export reducer & actions
export const savedFormsReducer = savedFormsSlice.reducer;
export const savedFormsActions = savedFormsSlice.actions;
