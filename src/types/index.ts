export type FieldType = 'text'|'number'|'textarea'|'select'|'radio'|'checkbox'|'date';

export type ValidationRule =
  | { type: 'notEmpty' }
  | { type: 'minLength'; value: number }
  | { type: 'maxLength'; value: number }
  | { type: 'email' }
  | { type: 'password'; minLen: number; requireNumber: boolean };

export type Field = {
  id: string;           // unique id (uuid)
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: unknown;
  options?: string[];   // for select/radio/checkbox
  validations?: ValidationRule[];
  derived?: { parentIds: string[]; formula: string } | null;
};

export type FormSchema = {
  id: string;
  name: string;
  createdAt: string;    // ISO
  fields: Field[];
};
