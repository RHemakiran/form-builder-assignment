import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { savedFormsActions } from '../store/savedFormsSlice';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';

export default function MyFormsPage() {
  const forms = useSelector((state: RootState) => state.savedForms.forms);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    dispatch(savedFormsActions.removeForm(id));
  };

  const handleOpenPreview = (id: string) => {
    navigate(`/preview/${id}`);
  };

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        My Forms
      </Typography>

      {forms.length === 0 ? (
        <Typography>No forms saved yet.</Typography>
      ) : (
        <List>
          {forms.map((form) => (
            <ListItem
              key={form.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(form.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton onClick={() => handleOpenPreview(form.id)}>
                <ListItemText
                  primary={form.name}
                  secondary={`Created at: ${new Date(form.createdAt).toLocaleString()}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </PageContainer>
  );
}
