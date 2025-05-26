import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  styled
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  EventBusy as EventBusyIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { updateEmployeeScheduleDay } from '../request';
import { getAllWorkSchedules } from '../../workSchedule/request';

// Styled components
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const TimeSlotCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.neutral,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`
}));

const EditDayModal = ({ open, onClose, dayData, date, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDayOff, setIsDayOff] = useState(false);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Initialize form when day data changes
  useEffect(() => {
    if (dayData) {
      setIsDayOff(dayData.isDayOff || false);
      if (dayData.time_slot_id && !dayData.isDayOff) {
        setSelectedTimeSlotId(dayData.time_slot_id._id || dayData.time_slot_id);
      } else {
        setSelectedTimeSlotId('');
        setSelectedTimeSlot(null);
      }
    } else {
      setIsDayOff(false);
      setSelectedTimeSlotId('');
      setSelectedTimeSlot(null);
    }
  }, [dayData]);

  // Load available time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await getAllWorkSchedules();
        if (response.success) {
          setTimeSlots(response.data);
          
          // If we have a time slot ID already selected, find it in the loaded time slots
          if (selectedTimeSlotId && dayData && !dayData.isDayOff) {
            const timeSlot = response.data.find(slot => 
              slot._id === selectedTimeSlotId || 
              (dayData.time_slot_id && slot._id === dayData.time_slot_id._id)
            );
            setSelectedTimeSlot(timeSlot || null);
          }
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load time slots. Please try again.');
      }
    };

    if (open) {
      fetchTimeSlots();
    }
  }, [open, selectedTimeSlotId, dayData]);

  // Handle time slot selection
  const handleTimeSlotChange = (e) => {
    const timeSlotId = e.target.value;
    setSelectedTimeSlotId(timeSlotId);
    
    // Find the selected time slot
    const timeSlot = timeSlots.find(slot => slot._id === timeSlotId);
    setSelectedTimeSlot(timeSlot);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Basic data structure for all updates
      let updatedData = {
        date: dayData?.date || date.toISOString(),
        isDayOff
      };

      // If this is not a day off and we have a selected time slot
      if (!isDayOff && selectedTimeSlot) {
        // Include the time_slot_id so backend can use it
        updatedData.time_slot_id = selectedTimeSlot._id;
        
        // We're still calculating and including the start/end times and day_changed
        // to keep compatibility with the current implementation
        const dateObj = new Date(dayData?.date || date);
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        
        // Parse start time
        const [startHours, startMinutes] = selectedTimeSlot.shiftStart.split(':').map(Number);
        const startTime = new Date(`${dateStr}T${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`);
        
        // Parse end time
        const [endHours, endMinutes] = selectedTimeSlot.shiftEnd.split(':').map(Number);
        const endTime = new Date(`${dateStr}T${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`);
        
        // If end time is earlier than start time, it's a next-day shift
        const isNextDayShift = endHours < startHours || (endHours === startHours && endMinutes < startMinutes);
        if (isNextDayShift) {
          endTime.setDate(endTime.getDate() + 1);
        }
        
        updatedData = {
          ...updatedData,
          start: startTime,
          end: endTime,
          day_changed: isNextDayShift,
          notes: `Using schedule: ${selectedTimeSlot.name}`
        };
      }

      // If we already have a dayData object, include its ID for the update
      if (dayData && dayData._id) {
        updatedData._id = dayData._id;
      }
      
      // IMPORTANT: Include the schedule_id field which is required by the backend
      // Look for it in different possible locations
      if (dayData && dayData.schedule_id) {
        updatedData.schedule_id = dayData.schedule_id;
      } else if (dayData && dayData.schedule && dayData.schedule._id) {
        updatedData.schedule_id = dayData.schedule._id;
      } else if (dayData && dayData.employee_schedule_id) {
        updatedData.schedule_id = dayData.employee_schedule_id;
      }
      
      // Log the payload for debugging
      console.log('Updating employee schedule with data:', updatedData);
      
      const response = await updateEmployeeScheduleDay(updatedData);
      
      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        setError(response.message || 'Failed to update schedule');
      }
    } catch (err) {
      console.error('Error updating schedule day:', err);
      setError('Error updating schedule day. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : '';
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon color="primary" />
          <Typography variant="h6">Edit Schedule Day</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="h6" color="primary" gutterBottom>
          {formattedDate}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <StyledFormControl fullWidth>
          <FormControlLabel
            control={
              <Switch 
                checked={isDayOff}
                onChange={(e) => setIsDayOff(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <EventBusyIcon color={isDayOff ? "error" : "disabled"} />
                <Typography>
                  {isDayOff ? "Mark as day off" : "Mark as working day"}
                </Typography>
              </Box>
            }
          />
        </StyledFormControl>
        
        {!isDayOff && (
          <StyledFormControl fullWidth>
            <InputLabel id="time-slot-select-label">Select Time Slot</InputLabel>
            <Select
              labelId="time-slot-select-label"
              id="time-slot-select"
              value={selectedTimeSlotId}
              onChange={handleTimeSlotChange}
              label="Select Time Slot"
              startAdornment={<AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />}
              disabled={loading}
              required
            >
              {timeSlots.map((slot) => (
                <MenuItem key={slot._id} value={slot._id}>
                  {slot.name} ({slot.shiftStart} - {slot.shiftEnd})
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
        )}
        
        {selectedTimeSlot && !isDayOff && (
          <TimeSlotCard>
            <Typography variant="subtitle2" gutterBottom>
              Selected Schedule: {selectedTimeSlot.name}
            </Typography>
            <Box mt={1}>
              <Typography variant="body2">
                <strong>Shift Hours:</strong> {selectedTimeSlot.shiftStart} - {selectedTimeSlot.shiftEnd}
              </Typography>
              <Typography variant="body2">
                <strong>Working Days:</strong> {selectedTimeSlot.workDays?.map(day => 
                  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
                ).join(', ')}
              </Typography>
            </Box>
          </TimeSlotCard>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={loading || (!isDayOff && !selectedTimeSlotId)}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Updating...' : 'Update Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDayModal; 