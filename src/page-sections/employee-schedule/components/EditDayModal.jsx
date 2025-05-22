import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  CircularProgress,
  FormHelperText,
  IconButton,
  Divider,
  Paper,
  styled
} from '@mui/material';
import { 
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Notes as NotesIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { updateEmployeeScheduleDay } from '../request';
import { format, parse, isValid } from 'date-fns';

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const TimePickerWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const EditDayModal = ({ open, onClose, day, scheduleId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    isDayOff: false,
    start: null,
    end: null,
    notes: ''
  });

  useEffect(() => {
    if (day) {
      setFormData({
        isDayOff: day.isDayOff || false,
        start: day.start ? new Date(day.start) : null,
        end: day.end ? new Date(day.end) : null,
        notes: day.notes || ''
      });
    }
  }, [day]);

  const handleChange = (field) => (event) => {
    if (field === 'isDayOff') {
      setFormData({
        ...formData,
        isDayOff: event.target.checked
      });
    } else {
      setFormData({
        ...formData,
        [field]: event.target.value
      });
    }
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Basic validation
      if (!formData.isDayOff && (!formData.start || !formData.end)) {
        setError('Start time and end time are required for work days');
        setLoading(false);
        return;
      }

      // Format dates for API
      const payload = {
        schedule_id: scheduleId,
        date: day.date,
        isDayOff: formData.isDayOff,
        notes: formData.notes
      };

      // Only send start and end times if not a day off
      if (!formData.isDayOff) {
        payload.start = formData.start;
        payload.end = formData.end;
      }

      const result = await updateEmployeeScheduleDay(
        scheduleId,
        day.date,
        formData.isDayOff,
        formData.start,
        formData.end,
        formData.notes
      );

      if (result.success) {
        if (onSuccess && result.data) {
          onSuccess(result.data);
        }
        onClose();
      } else {
        setError(result.error || 'Failed to update schedule');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!day) return null;

  const dateStr = day.date ? format(new Date(day.date), 'EEEE, MMMM dd, yyyy') : '';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon />
            <Typography variant="h6">Edit Schedule</Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        
        <StyledDialogContent>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            {dateStr}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDayOff}
                  onChange={handleChange('isDayOff')}
                  color="primary"
                  sx={{ mr: 1 }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {formData.isDayOff ? 
                    <EventBusyIcon color="error" /> : 
                    <EventAvailableIcon color="success" />
                  }
                  <Typography>{formData.isDayOff ? 'Day Off' : 'Work Day'}</Typography>
                </Box>
              }
            />
          </Box>

          <Divider sx={{ my: 3 }} />
          
          {!formData.isDayOff && (
            <>
              <SectionTitle variant="subtitle1">
                <AccessTimeIcon fontSize="small" />
                Work Hours
              </SectionTitle>
              
              <TimePickerWrapper>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TimePicker
                      label="Start Time"
                      value={formData.start}
                      onChange={handleDateChange('start')}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          variant="outlined"
                          placeholder="Select start time"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TimePicker
                      label="End Time"
                      value={formData.end}
                      onChange={handleDateChange('end')}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          variant="outlined"
                          placeholder="Select end time"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </TimePickerWrapper>
            </>
          )}

          <SectionTitle variant="subtitle1">
            <NotesIcon fontSize="small" />
            Notes
          </SectionTitle>
          
          <TextField
            label="Add notes about this day"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Enter any special instructions or notes for this day"
            sx={{ mb: 2 }}
          />

          {error && (
            <Box 
              sx={{ 
                p: 2, 
                mb: 2, 
                backgroundColor: 'error.lighter', 
                borderRadius: 1, 
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1 
              }}
            >
              <CloseIcon fontSize="small" />
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}
        </StyledDialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EventAvailableIcon />}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EditDayModal; 