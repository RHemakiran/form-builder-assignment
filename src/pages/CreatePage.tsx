import { useAppDispatch, useAppSelector } from '../store/hooks';
import { formBuilderActions } from '../store/formBuilderSlice';
import { savedFormsActions } from '../store/savedFormsSlice';
import {
  Button,
  TextField,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  ListItem,
  ListItemText,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useState } from 'react';
import type { Field, FieldType } from '../types';
import PageContainer from '../components/PageContainer';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

type FieldListItemProps = {
  readonly field: Field;
  readonly index: number;
  readonly onEdit: (id: string) => void;
  readonly onRemove: (id: string) => void;
};

function FieldListItem({ field, index, onEdit, onRemove }: FieldListItemProps) {
  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          secondaryAction={
            <>
              <IconButton {...provided.dragHandleProps} sx={{ cursor: 'grab', mr: 1 }}>
                <DragIndicatorIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => onEdit(field.id)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => onRemove(field.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          }
        >
          <ListItemText
            primary={field.label}
            secondary={`Type: ${field.type} | Required: ${field.required}`}
          />
        </ListItem>
      )}
    </Draggable>
  );
}

export default function CreatePage() {
  const dispatch = useAppDispatch();
  const schema = useAppSelector((state) => state.formBuilder.schema);

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Field>>({});

  if (!schema) {
    return (
      <PageContainer>
        <p>Loading form builder...</p>
      </PageContainer>
    );
  }

  const handleAddField = () => {
    dispatch(formBuilderActions.addField({ type: 'text', label: 'New Field' }));
  };

  const handleRemoveField = (id: string) => {
    dispatch(formBuilderActions.removeField(id));
  };

  const handleEditField = (id: string) => {
    const fieldToEdit = schema?.fields.find((f) => f.id === id);
    if (fieldToEdit) {
      setEditingFieldId(id);
      setEditForm(fieldToEdit);
    }
  };

  const handleSaveEdit = () => {
    if (!editingFieldId) return;
    dispatch(formBuilderActions.updateField({ id: editingFieldId, updates: editForm }));
    setEditingFieldId(null);
    setEditForm({});
  };

  const handleSaveForm = () => {
    if (!schema?.name.trim()) {
      alert('Please enter a form name.');
      return;
    }
    if (!schema?.fields.length) {
      alert('Please add at least one field.');
      return;
    }
    dispatch(savedFormsActions.addForm(schema));
    dispatch(formBuilderActions.resetSchema());
    alert('Form saved successfully!');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedFields = Array.from(schema.fields);
    const [removed] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, removed);
    dispatch(formBuilderActions.setFields(reorderedFields));
  };

  // Helper to auto-extract parent field IDs from formula text
  const extractParentIds = (formula: string) => {
    const matches = formula.match(/\$\{(.*?)\}/g) || [];
    return matches.map(m => m.replace('${', '').replace('}', ''));
  };

  return (
    <PageContainer>
      <h2>Create Form</h2>

      <TextField
        label="Form Name"
        value={schema?.name || ''}
        onChange={(e) => dispatch(formBuilderActions.setFormName(e.target.value))}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddField} sx={{ mb: 2, mr: 2 }}>
        Add Field
      </Button>
      <Button variant="outlined" color="success" onClick={handleSaveForm} sx={{ mb: 2 }}>
        Save Form
      </Button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fieldsList">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {schema?.fields.map((field, index) => (
                <FieldListItem
                  key={field.id}
                  field={field}
                  index={index}
                  onEdit={handleEditField}
                  onRemove={handleRemoveField}
                />
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={!!editingFieldId} onClose={() => setEditingFieldId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent>
          <TextField
            label="Label"
            value={editForm.label || ''}
            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Type"
            value={editForm.type || 'text'}
            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as FieldType })}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="textarea">Textarea</MenuItem>
            <MenuItem value="select">Select</MenuItem>
            <MenuItem value="radio">Radio</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="date">Date</MenuItem>
          </TextField>

          {(editForm.type === 'select' || editForm.type === 'radio' || editForm.type === 'checkbox') && (
            <TextField
              label="Options (comma separated)"
              value={(editForm.options || []).join(',')}
              onChange={(e) => setEditForm({ ...editForm, options: e.target.value.split(',') })}
              fullWidth
              sx={{ mb: 2 }}
            />
          )}

          {/* Derived formula input */}
          {['text', 'number', 'date'].includes(editForm.type || '') && (
            <TextField
              label="Derived Formula"
              value={editForm.derived?.formula || ''}
              onChange={(e) => {
                const formula = e.target.value;
                setEditForm({
                  ...editForm,
                  derived: {
                    parentIds: extractParentIds(formula),
                    formula
                  }
                });
              }}
              fullWidth
              sx={{ mb: 2 }}
              placeholder="Example: ${field1} + ${field2}"
            />
          )}

          {/* Example validation toggles */}
          <FormControlLabel
            control={
              <Checkbox
                checked={!!editForm.validations?.some(v => v.type === 'notEmpty')}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    validations: e.target.checked
                      ? [...(editForm.validations || []), { type: 'notEmpty' }]
                      : (editForm.validations || []).filter(v => v.type !== 'notEmpty')
                  })
                }
              />
            }
            label="Required"
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={!!editForm.validations?.some(v => v.type === 'email')}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    validations: e.target.checked
                      ? [...(editForm.validations || []), { type: 'email' }]
                      : (editForm.validations || []).filter(v => v.type !== 'email')
                  })
                }
              />
            }
            label="Email Format"
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={!!editForm.validations?.some(v => v.type === 'password')}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    validations: e.target.checked
                      ? [
                          ...(editForm.validations || []),
                          { type: 'password', minLen: 8, requireNumber: true }
                        ]
                      : (editForm.validations || []).filter(v => v.type !== 'password')
                  })
                }
              />
            }
            label="Password Strength"
            sx={{ mb: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditingFieldId(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
