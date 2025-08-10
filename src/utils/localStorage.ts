import type { FormSchema } from '../types';

const KEY = 'upliance_forms_v1';

export function loadFormsFromLocalStorage(): FormSchema[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FormSchema[]) : [];
  } catch {
    return [];
  }
}

export function saveFormsToLocalStorage(forms: FormSchema[]) {
  localStorage.setItem(KEY, JSON.stringify(forms));
}
