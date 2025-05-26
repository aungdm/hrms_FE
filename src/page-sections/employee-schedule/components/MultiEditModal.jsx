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
  Checkbox,
  CircularProgress,
  Grid,
  TextField,
  Switch,
  Divider,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  styled,
  FormGroup,
  useTheme
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  EventBusy as EventBusyIcon,
  Notes as NotesIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getAllWorkSchedules } from '../../workSchedule/request';

// Styled components
const HeaderText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center'
}));

const SlotsList = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  maxHeight: '200px',
  overflow: 'auto'
}));

const FieldsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.neutral,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`
}));

const TimeSlotCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.lighter,
  marginTop: theme.spacing(1)
}));

const FieldCheckWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const FieldHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5)
}));

const FieldContent = styled(Box)(({ theme }) => ({
  flex: 1
}));

const InfoText = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5)
}));

const MultiEditModal = ({ open, onClose, selectedSlots, onSuccess }) => {
  console.log(selectedSlots);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDayOff, setIsDayOff] = useState(false);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  // Track which fields should be updated
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    isDayOff: false,
    timeSlot: false
  });
  
  // Log selected slots for debugging
  useEffect(() => {
    if (open && selectedSlots && selectedSlots.length > 0) {
      console.log('MultiEditModal opened with selected slots:', selectedSlots);
    }
  }, [open, selectedSlots]);
  
  // Reset the form when the modal opens
  useEffect(() => {
    if (open) {
      // Reset state
      setIsDayOff(false);
      setSelectedTimeSlotId('');
      setSelectedTimeSlot(null);
      setFieldsToUpdate({
        isDayOff: false,
        timeSlot: false
      });
      setError(null);
    }
  }, [open]);
  
  // Load available time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await getAllWorkSchedules();
        if (response.success) {
          setTimeSlots(response.data);
        } else {
          setError('Failed to load time slots');
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load time slots. Please try again.');
      }
    };

    if (open) {
      fetchTimeSlots();
    }
  }, [open]);
  
  // Toggle field selection for update
  const handleToggleField = (field) => {
    setFieldsToUpdate({
      ...fieldsToUpdate,
      [field]: !fieldsToUpdate[field]
    });
  };
  
  // Handler for changing day off status
  const handleDayOffChange = (event) => {
    setIsDayOff(event.target.checked);
  };
  
  // Handle time slot selection
  const handleTimeSlotChange = (e) => {
    const timeSlotId = e.target.value;
    setSelectedTimeSlotId(timeSlotId);
    
    // Find the selected time slot
    const timeSlot = timeSlots.find(slot => slot._id === timeSlotId);
    setSelectedTimeSlot(timeSlot);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create the update object with only the fields that should be updated
      const updates = {};
      
      // Handle isDayOff field - explicitly include this field if selected
      if (fieldsToUpdate.isDayOff) {
        updates.isDayOff = isDayOff;
      }
      
      // Handle time slot field
      if (fieldsToUpdate.timeSlot && selectedTimeSlot) {
        // Make sure isDayOff is explicitly set to false when assigning a time slot
        // This ensures all slots get proper time_slot_id assignment
        if (!fieldsToUpdate.isDayOff) {
          updates.isDayOff = false;
        }
        
        // For time slot updates, ensure we pass the time_slot_id to the backend
        // which will use it to retrieve the shift hours
        updates.timeSlotInfo = {
          time_slot_id: selectedTimeSlot._id,
          shiftStart: selectedTimeSlot.shiftStart,
          shiftEnd: selectedTimeSlot.shiftEnd,
          name: selectedTimeSlot.name
        };
      }
      
      // Prevent assigning a time slot when marking as day off
      if (updates.isDayOff === true && updates.timeSlotInfo) {
        delete updates.timeSlotInfo;
      }
      
      // Check if there are any updates to apply
      if (Object.keys(updates).length === 0) {
        setError('Please select at least one field to update');
        setLoading(false);
        return;
      }
      
      // Log the updates for debugging
      console.log('Sending updates:', updates);
      
      // Call success handler with updates
      setTimeout(() => {
        onSuccess(updates);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error processing updates:', err);
      setError('An error occurred while processing updates');
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon color="primary" />
          <Typography variant="h6">Edit Multiple Schedule Slots</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Selected slots summary */}
        <HeaderText variant="subtitle1">
          <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Selected Slots ({selectedSlots.length})
        </HeaderText>
        
        <SlotsList>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="35%">Employee</TableCell>
                  <TableCell width="25%">Date</TableCell>
                  <TableCell width="40%">Current Schedule</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedSlots.map((slot, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{slot?.employeeName || 'Employee'}</TableCell>
                    <TableCell>
                      {slot.daySchedule && slot.daySchedule.date 
                        ? formatDate(slot.daySchedule.date)
                        : slot.day 
                          ? formatDate(slot.day) 
                          : 'Unknown date'}
                    </TableCell>
                    <TableCell>
                      {!slot.daySchedule ? (
                        <Chip 
                          label="No schedule" 
                          size="small" 
                          color="default"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ) : slot.daySchedule.isDayOff ? (
                        <Chip 
                          label="Day Off" 
                          size="small" 
                          color="error"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ) : slot.daySchedule.start && slot.daySchedule.end ? (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {format(new Date(slot.daySchedule.start), 'h:mm a')} - 
                            {format(new Date(slot.daySchedule.end), 'h:mm a')}
                          </Typography>
                          {slot.daySchedule.day_changed && (
                            <Chip 
                              label="Next day" 
                              size="small" 
                              color="warning"
                              sx={{ fontSize: '0.7rem', ml: 1 }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Chip 
                          label="Schedule pending" 
                          size="small" 
                          color="info"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SlotsList>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Fields to update */}
        <FieldsContainer>
          <HeaderText variant="subtitle1">
            <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Select Fields to Update
          </HeaderText>
          
          <Grid container spacing={2}>
            {/* Day Off Status */}
            <Grid item xs={12} sm={6}>
              <FieldCheckWrapper>
                <FieldHeader>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={fieldsToUpdate.isDayOff}
                        onChange={() => handleToggleField('isDayOff')}
                        color="primary"
                      />
                    }
                    label="Day Off Status"
                    sx={{ marginRight: 'auto' }}
                  />
                </FieldHeader>
                
                <FieldContent>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isDayOff}
                          onChange={handleDayOffChange}
                          disabled={!fieldsToUpdate.isDayOff}
                          color="primary"
                        />
                      }
                      label={isDayOff ? "Mark as Day Off" : "Regular Working Day"}
                    />
                  </FormGroup>
                  
                  {fieldsToUpdate.isDayOff && isDayOff && (
                    <InfoText>
                      <InfoIcon fontSize="small" color="info" sx={{ mr: 0.5 }} />
                      This will clear any existing shift assignments
                    </InfoText>
                  )}
                </FieldContent>
              </FieldCheckWrapper>
            </Grid>
            
            {/* Time Slot */}
            <Grid item xs={12} sm={6}>
              <FieldCheckWrapper>
                <FieldHeader>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={fieldsToUpdate.timeSlot}
                        onChange={() => handleToggleField('timeSlot')}
                        color="primary"
                        disabled={isDayOff && fieldsToUpdate.isDayOff}
                      />
                    }
                    label="Time Slot"
                    sx={{ marginRight: 'auto' }}
                  />
                </FieldHeader>
                
                <FieldContent>
                  <FormControl 
                    fullWidth 
                    variant="outlined" 
                    size="small"
                    disabled={!fieldsToUpdate.timeSlot || (isDayOff && fieldsToUpdate.isDayOff)}
                  >
                    <InputLabel id="time-slot-select-label">Select Time Slot</InputLabel>
                    <Select
                      labelId="time-slot-select-label"
                      id="time-slot-select"
                      value={selectedTimeSlotId}
                      onChange={handleTimeSlotChange}
                      label="Select Time Slot"
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot._id} value={slot._id}>
                          {slot.name} ({slot.shiftStart} - {slot.shiftEnd})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {isDayOff && fieldsToUpdate.isDayOff && (
                    <InfoText sx={{ color: theme.palette.warning.main }}>
                      <WarningIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                      Time slot selection is disabled when marking as day off
                    </InfoText>
                  )}
                </FieldContent>
              </FieldCheckWrapper>
            </Grid>
            
            {/* Time Slot Preview */}
            <Grid item xs={12}>
              {selectedTimeSlot && fieldsToUpdate.timeSlot && !(isDayOff && fieldsToUpdate.isDayOff) && (
                <TimeSlotCard>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Schedule: {selectedTimeSlot.name}
                  </Typography>
                  <Box mt={1}>
                    <Typography variant="body2">
                      <strong>Shift Hours:</strong> {selectedTimeSlot.shiftStart} - {selectedTimeSlot.shiftEnd}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Working Days:</strong> {selectedTimeSlot.workDays.map(day => 
                        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
                      ).join(', ')}
                    </Typography>
                  </Box>
                </TimeSlotCard>
              )}
            </Grid>
          </Grid>
        </FieldsContainer>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#FFF9C4', 
          padding: 2, 
          borderRadius: 1 
        }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Changes will be applied to all {selectedSlots.length} selected slots. This action cannot be undone.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={
            loading || 
            // No fields selected to update
            !Object.values(fieldsToUpdate).some(v => v) || 
            // Time slot selected but no value chosen
            (fieldsToUpdate.timeSlot && !selectedTimeSlotId && !isDayOff) ||
            // Invalid combination: day off is true but trying to set time slot
            (fieldsToUpdate.isDayOff && isDayOff && fieldsToUpdate.timeSlot)
          }
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          {loading ? 'Updating...' : 'Update All Selected Slots'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultiEditModal; 