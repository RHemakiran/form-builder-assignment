import { useParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useState, useEffect, type ChangeEvent } from 'react';
import type { RootState } from '../store';
import type { Field } from '../types';
import { evaluateDerivedField } from '../utils/derivedEvaluator';
import { validateField } from '../utils/validations';
import {
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material';
import PageContainer from '../components/PageContainer';

export default function PreviewPage() {
  const { formId } = useParams<{ formId: string }>();

  const form = useAppSelector((state: RootState) =>
    state.savedForms.forms.find((f) => f.id === formId)
  );

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (form?.fields) {
      const initialValues: Record<string, unknown> = {};
      form.fields.forEach((field) => {
        initialValues[field.id] = field.defaultValue || '';
      });
      setValues(initialValues);
    }
  }, [form]);

  useEffect(() => {
    if (!form?.fields) return;
    setValues((prevValues) => {
      const updatedValues = { ...prevValues };
      let changed = false;
      form.fields.forEach((field) => {
        if (field.derived) {
          const newValue = evaluateDerivedField(field.derived, updatedValues);
          if (updatedValues[field.id] !== newValue) {
            updatedValues[field.id] = newValue;
            changed = true;
          }
        }
      });
      return changed ? updatedValues : prevValues;
    });
  }, [form]);

  if (!form) return <Typography>Form not found</Typography>;

  const handleChange = (id: string, value: unknown) => {
    const updatedValues = { ...values, [id]: value };
    setValues(updatedValues);

    const field = form.fields.find((f) => f.id === id);
    if (field?.validations) {
      const validationError = validateField(field.validations, value);
      setErrors({ ...errors, [id]: validationError || '' });
    }
  };

  const handleSubmit = () => {
    let formValid = true;
    const newErrors: Record<string, string> = {};
    form?.fields.forEach((field) => {
      if (field.validations) {
        const err = validateField(field.validations, values[field.id]);
        if (err) {
          newErrors[field.id] = err;
          formValid = false;
        }
      }
    });
    setErrors(newErrors);
    if (formValid) {
      alert('Form submitted successfully!');
      console.log('Submitted data:', values);
    }
  };

  const renderField = (field: Field) => {
    const commonProps = {
      key: field.id,
      label: field.label,
      value: values[field.id] ?? '',
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        handleChange(field.id, e.target.value),
      fullWidth: true,
      sx: { mb: 2 },
      error: !!errors[field.id],
      helperText: errors[field.id] || ''
    };

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <TextField
            type={field.type}
            {...commonProps}
            slotProps={{ input: { readOnly: !!field.derived } }} // 🔒 derived fields are read-only
          />
        );

      case 'textarea':
        return <TextField multiline rows={4} {...commonProps} />;

      case 'select':
        return (
          <TextField select {...commonProps}>
            {(field.options || []).map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'radio':
        return (
          <div key={field.id} style={{ marginBottom: '1rem' }}>
            <Typography variant="subtitle1">{field.label}</Typography>
            {(field.options || []).map((opt) => (
              <FormControlLabel
                key={opt}
                control={
                  <Checkbox
                    checked={values[field.id] === opt}
                    onChange={() => handleChange(field.id, opt)}
                  />
                }
                label={opt}
              />
            ))}
            {errors[field.id] && (
              <Typography color="error">{errors[field.id]}</Typography>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.id}
            control={
              <Checkbox
                checked={!!values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        {form?.name ?? 'Untitled Form'}
      </Typography>
      {form?.fields.map(renderField)}
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </PageContainer>
  );
}
