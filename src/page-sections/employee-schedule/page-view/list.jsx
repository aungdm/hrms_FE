import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Stack, 
  Button, 
  styled, 
  useTheme, 
  Grid, 
  Typography, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { H6 } from '@/components/typography';
import { 
  CalendarMonth, 
  People, 
  Sync, 
  Search as SearchIcon, 
  FilterAlt as FilterAltIcon,
  ViewDay as ViewDayIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ScheduleCalendar from '../components/ScheduleCalendar';
import { getEmployeeSchedule, getEmployeeSchedules, generateAllEmployeeSchedules } from '../request';
import { getAllEmployees } from '../../employee/request';
import { format } from 'date-fns';

// styled components
const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: 12,
  gap: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
}));

const FilterCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.neutral
}));

const ActionButton = styled(Button)(({ theme }) => ({
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(3),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

// Get current month and year for default values
const today = new Date();
const currentMonth = today.getMonth() + 1; // Adding 1 because JavaScript months are 0-indexed
const currentYear = today.getFullYear();

// Available years for selection
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

// Available months for selection
const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

export default function ListView() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State for filters and data
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatingSchedules, setGeneratingSchedules] = useState(false);
  
  // Fetch employees for the dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getAllEmployees();
        if (response.success) {
          setEmployees(response.data);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    
    fetchEmployees();
  }, []);
  
  // Fetch schedule data
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      
      // If an employee is selected, fetch their specific schedule
      if (selectedEmployee) {
        const response = await getEmployeeSchedule(selectedEmployee, month, year);
        if (response.success) {
          setSchedule(response.data);
        } else {
          setError('No schedule found for this employee in the selected month');
          setSchedule(null);
        }
      } else {
        setError('Please select an employee to view their schedule');
        setSchedule(null);
      }
    } catch (err) {
      setError('Error fetching schedule: ' + (err.message || 'Unknown error'));
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate schedules for all employees
  const handleGenerateAll = async () => {
    try {
      setGeneratingSchedules(true);
      setError('');
      setSuccessMessage('');
      
      const response = await generateAllEmployeeSchedules(month, year);
      
      if (response.success) {
        setSuccessMessage(
          `Successfully generated schedules for ${response.data.success} employees. ${response.data.failed} failed.`
        );
        
        // If we have a selected employee, refresh their schedule
        if (selectedEmployee) {
          fetchSchedule();
        }
      } else {
        setError('Failed to generate schedules');
      }
    } catch (err) {
      setError('Error generating schedules: ' + (err.message || 'Unknown error'));
    } finally {
      setGeneratingSchedules(false);
    }
  };
  
  // Handle filter changes
  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };
  
  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };
  
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  
  // Handle schedule updates
  const handleScheduleUpdate = (updatedSchedule) => {
    if (updatedSchedule && schedule) {
      // Merge the updated schedule with existing schedule to preserve time_slot_id if needed
      updatedSchedule = {
        ...updatedSchedule,
        time_slot_id: updatedSchedule.time_slot_id || schedule.time_slot_id
      };
    }
    
    setSchedule(updatedSchedule);
    setSuccessMessage('Schedule updated successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Find current employee name
  const getCurrentEmployeeName = () => {
    if (!selectedEmployee || !employees.length) return null;
    const employee = employees.find(e => e._id === selectedEmployee);
    return employee ? employee.name : null;
  };

  const employeeName = getCurrentEmployeeName();
  const monthName = months.find(m => m.value === month)?.label;
  
  return (
    <Box pt={3} pb={4}>
      {/* Page header */}
      <HeaderSection>
        <PageTitle>
          <CalendarMonth color="primary" />
          Employee Schedule
        </PageTitle>

        <Box>
          <ActionButton 
            variant="contained" 
            color="primary"
            startIcon={<Sync />}
            onClick={handleGenerateAll}
            disabled={generatingSchedules}
          >
            {generatingSchedules ? <CircularProgress size={20} color="inherit" /> : 'Generate All Schedules'}
          </ActionButton>
        </Box>
      </HeaderSection>

      {/* Filters card */}
      <FilterCard elevation={0}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2
        }}>
          <FilterAltIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Schedule Filters</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="employee-select-label">Select Employee</InputLabel>
              <Select
                labelId="employee-select-label"
                id="employee-select"
                value={selectedEmployee}
                label="Select Employee"
                onChange={handleEmployeeChange}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Select an employee</em>
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={month}
                label="Month"
                onChange={handleMonthChange}
                startAdornment={
                  <InputAdornment position="start">
                    <CalendarTodayIcon color="primary" />
                  </InputAdornment>
                }
              >
                {months.map((monthOption) => (
                  <MenuItem key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={year}
                label="Year"
                onChange={handleYearChange}
                startAdornment={
                  <InputAdornment position="start">
                    <CalendarTodayIcon color="primary" />
                  </InputAdornment>
                }
              >
                {years.map((yearOption) => (
                  <MenuItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <ActionButton 
              fullWidth 
              variant="contained" 
              color="primary"
              onClick={fetchSchedule}
              disabled={loading || !selectedEmployee}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ViewDayIcon />}
              sx={{ height: '56px' }}
            >
              {loading ? 'Loading...' : 'View Schedule'}
            </ActionButton>
          </Grid>
        </Grid>
      </FilterCard>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: 1, 
            boxShadow: 1,
            '& .MuiAlert-icon': { alignItems: 'center' } 
          }}
        >
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 1, 
            boxShadow: 1,
            '& .MuiAlert-icon': { alignItems: 'center' } 
          }}
        >
          {error}
        </Alert>
      )}

      {/* Schedule content card */}
      <Card 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          boxShadow: 3,
          overflow: 'hidden'
        }}
      >
        {/* Schedule information header */}
        {schedule && employeeName && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
              {employeeName}'s Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Viewing schedule for {monthName} {year} 
              {schedule.time_slot_id?.name && <> • Time slot: {schedule.time_slot_id.name}</>} 
              {schedule.time_slot_id?.workDays && Array.isArray(schedule.time_slot_id.workDays) && (
                <> • Working days: {[...schedule.time_slot_id.workDays].sort().map(d => 
                  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
                ).join(', ')}</>
              )}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>
        )}
      
        {/* Schedule Calendar */}
        {schedule ? (
          <ScheduleCalendar 
            schedule={schedule} 
            onUpdateDay={handleScheduleUpdate} 
          />
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '500px',
              backgroundColor: theme.palette.background.neutral,
              borderRadius: 2,
              p: 4
            }}
          >
            <CalendarMonth sx={{ fontSize: 80, color: 'action.disabled', mb: 3, opacity: 0.7 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="medium">
              No Schedule Selected
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
              Select an employee and a month/year from the filters above, then click "View Schedule" to see their schedule.
            </Typography>
            
            <StyledButton 
              variant="outlined" 
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => navigate(0)}
            >
              Refresh Page
            </StyledButton>
          </Box>
        )}
      </Card>
    </Box>
  );
} 