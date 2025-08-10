import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FormSchema, Field, FieldType } from '../types';
import { v4 as uuidv4 } from 'uuid';

type FormBuilderState = {
  schema: FormSchema | null;
};

const initialState: FormBuilderState = {
  schema: {
    id: uuidv4(),
    name: '',
    createdAt: new Date().toISOString(),
    fields: []
  }
};

export const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    // Set form name
    setFormName: (state, action: PayloadAction<string>) => {
      if (state.schema) {
        state.schema.name = action.payload;
      }
    },

    // Add a new field
    addField: (
      state,
      action: PayloadAction<{ type: FieldType; label?: string }>
    ) => {
      if (state.schema) {
        const newField: Field = {
          id: uuidv4(),
          label: action.payload.label || 'Untitled Field',
          type: action.payload.type,
          required: false,
          defaultValue: '',
          options: [],
          validations: [],
          derived: null
        };
        state.schema.fields.push(newField);
      }
    },

    // Remove a field
    removeField: (state, action: PayloadAction<string>) => {
      if (state.schema) {
        state.schema.fields = state.schema.fields.filter(
          (f) => f.id !== action.payload
        );
      }
    },

    // Update field (for editing)
    updateField: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Field> }>
    ) => {
      if (state.schema) {
        const field = state.schema.fields.find(
          (f) => f.id === action.payload.id
        );
        if (field) {
          Object.assign(field, action.payload.updates);
        }
      }
    },

    // ✅ New reducer for drag-and-drop reordering
    setFields: (state, action: PayloadAction<Field[]>) => {
      if (state.schema) {
        state.schema.fields = action.payload;
      }
    },

    // Reset the schema for a new form
    resetSchema: (state) => {
      state.schema = {
        id: uuidv4(),
        name: '',
        createdAt: new Date().toISOString(),
        fields: []
      };
    }
  }
});

export const formBuilderActions = formBuilderSlice.actions;
export default formBuilderSlice.reducer;
