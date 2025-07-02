import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Autocomplete,
  TextField,
  Switch,
  FormControlLabel
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
  Refresh as RefreshIcon,
  CompareArrows as CompareArrowsIcon,
  Group as GroupIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  SelectAll as SelectAllIcon,
  ClearAll as ClearAllIcon,
  GridOn as GridOnIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ScheduleCalendar from '../components/ScheduleCalendar';
import ScheduleTimeline from '../components/ScheduleTimeline';
import ScheduleTimelineGrid from '../components/ScheduleTimelineGrid';
import { getEmployeeSchedule, getEmployeeSchedules, generateAllEmployeeSchedules, getMultipleEmployeeSchedules, revertEmployeeSchedulesToDefault } from '../request';
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

const EmployeeChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  fontWeight: selected ? 'bold' : 'normal',
  boxShadow: selected ? theme.shadows[2] : 'none',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  }
}));

const ViewToggleWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
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
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatingSchedules, setGeneratingSchedules] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
  
  // Add state for departments
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // Extract unique departments from employees
  useEffect(() => {
    if (employees.length > 0) {
      const uniqueDepartments = [...new Set(employees.map(emp => emp.department))]
        .filter(Boolean)
        .sort()
        .map(dept => ({ value: dept, label: dept }));
      
      setDepartments([{ value: '', label: 'All Departments' }, ...uniqueDepartments]);
    }
  }, [employees]);
  
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
  
  // Filtered employees based on selected department
  const filteredEmployees = useMemo(() => {
    if (!selectedDepartment) {
      return employees;
    }
    return employees.filter(emp => emp.department === selectedDepartment);
  }, [employees, selectedDepartment]);
  
  // Fetch schedules data
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (selectedEmployees.length === 0) {
        setError('Please select at least one employee to view schedules');
        setSchedules([]);
        setLoading(false);
        return;
      }
      
      if (selectedEmployees.length === 1) {
        // For single employee, use the existing function to maintain all functionality
        const response = await getEmployeeSchedule(selectedEmployees[0], month, year);
        if (response.success) {
          // Add employee name to each schedule
          const employeeObj = employees.find(emp => emp._id === selectedEmployees[0]);
          if (response.data && employeeObj) {
            response.data.employee_name = employeeObj.name;
          }
          setSchedules([response.data]);
          setSuccessMessage('Schedule loaded successfully');
        } else {
          setError('Failed to load employee schedule');
          setSchedules([]);
        }
      } else {
        // For multiple employees, use the new function
        const response = await getMultipleEmployeeSchedules(selectedEmployees, month, year);
        if (response.success) {
          // Add employee names to each schedule
          const schedulesWithNames = response.data.map(schedule => {
            const employeeObj = employees.find(emp => emp._id === schedule.employee_id);
            return {
              ...schedule,
              employee_name: employeeObj ? employeeObj.name : 'Employee'
            };
          });
          
          setSchedules(schedulesWithNames);
          if (response.failedCount > 0) {
            setSuccessMessage(`Loaded ${schedulesWithNames.length} schedules. ${response.failedCount} failed to load.`);
          } else {
            setSuccessMessage('All schedules loaded successfully');
          }
        } else {
          setError('Failed to load employee schedules');
          setSchedules([]);
        }
      }
    } catch (err) {
      setError('Error fetching schedules: ' + (err.message || 'Unknown error'));
      setSchedules([]);
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
        
        // If we have selected employees, refresh their schedules
        if (selectedEmployees.length > 0) {
          fetchSchedules();
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
  
  // Handle employee selection
  const handleEmployeeChange = (event, newValue) => {
    // Remove the limit check
    setSelectedEmployees(newValue.map(employee => employee._id));
  };
  
  // Handle department change
  const handleDepartmentChange = (event) => {
    const dept = event.target.value;
    setSelectedDepartment(dept);
    
    // If department changes, reset selected employees
    setSelectedEmployees([]);
  };
  
  // Helper to select all employees from current department
  const handleSelectAllEmployees = () => {
    if (selectedDepartment) {
      const deptEmployeeIds = filteredEmployees.map(emp => emp._id);
      setSelectedEmployees(deptEmployeeIds);
    } else {
      // If no department is selected, don't allow selecting all employees
      setError('Please select a department first to use this feature');
    }
  };
  
  // Helper to clear employee selection
  const handleClearEmployeeSelection = () => {
    setSelectedEmployees([]);
  };
  
  // Handle month and year changes
  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };
  
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  
  // Handle schedule updates for a specific employee
  const handleScheduleUpdate = (updatedSchedule, employeeIndex) => {
    // Check if this is a refresh request from batch update
    if (updatedSchedule && updatedSchedule.needsRefresh) {
      console.log('Refreshing all schedules after batch update');
      // Refetch all schedules
      fetchSchedules();
      setSuccessMessage('Multiple schedules updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return;
    }
    
    // Handle single schedule update
    if (updatedSchedule && schedules[employeeIndex]) {
      // Make sure we preserve important schedule data that might not be in the updated schedule
      updatedSchedule = {
        ...updatedSchedule,
        // If the updated schedule doesn't have time_slot_id but the original does, keep the original
        time_slot_id: updatedSchedule.time_slot_id || schedules[employeeIndex].time_slot_id,
        // Always preserve employee name and ID
        employee_name: schedules[employeeIndex].employee_name,
        employee_id: updatedSchedule.employee_id || schedules[employeeIndex].employee_id,
      };
      
      // Update the specific employee's schedule in the list
      const newSchedules = [...schedules];
      newSchedules[employeeIndex] = updatedSchedule;
      
      setSchedules(newSchedules);
      setSuccessMessage('Schedule updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  // Handle reverting schedules to default
  const handleRevertSchedules = async () => {
    try {
      setLoading(true); // Use loading state for this operation
      setError('');
      setSuccessMessage('');

      const response = await revertEmployeeSchedulesToDefault(selectedEmployees, month, year);

      if (response.success) {
        setSuccessMessage(
          response.message || `Successfully reverted schedules for ${response.data.success.length} employees.`
        );
        // Refresh the schedules after successful revert
        fetchSchedules();
      } else {
        setError(response.message || 'Failed to revert schedules to default');
      }
    } catch (err) {
      setError('Error reverting schedules: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Toggle between view modes
  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Helper to get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e._id === employeeId);
    return employee ? employee.name : 'Employee';
  };
  
  // Helper to get employee initials
  const getEmployeeInitials = (employeeName) => {
    if (!employeeName) return 'E';
    const nameParts = employeeName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0);
    return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
  };

  // Helper to get employee object from ID
  const getEmployeeObject = (employeeId) => {
    return employees.find(e => e._id === employeeId) || null;
  };
  
  const monthName = months.find(m => m.value === month)?.label;
  
  return (
    <Box pt={3} pb={4}>
      {/* Page header */}
      <HeaderSection>
        <PageTitle>
          <CalendarMonth color="primary" />
          Employee Schedules
        </PageTitle>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <ActionButton 
            variant="outlined" 
            color="primary"
            startIcon={showFilters ? <ClearAllIcon /> : <FilterAltIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </ActionButton>

          <ActionButton 
            variant="contained" 
            color="primary"
            startIcon={<Sync />}
            onClick={handleGenerateAll}
            disabled={generatingSchedules}
          >
            {generatingSchedules ? <CircularProgress size={20} color="inherit" /> : 'Generate All Schedules'}
          </ActionButton>

          {/* {selectedEmployees.length > 0 && ( // Only show button if employees are selected
            <ActionButton
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />} // Use Refresh icon for revert
              onClick={handleRevertSchedules}
              disabled={loading || generatingSchedules} // Disable if loading or generating
            >
              Revert to Default
            </ActionButton>
          )} */}
        </Box>
      </HeaderSection>

      {/* Filters card */}
      {showFilters && (
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
            {/* Department Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="department-select-label">Department</InputLabel>
                <Select
                  labelId="department-select-label"
                  id="department-select"
                  value={selectedDepartment}
                  label="Department"
                  onChange={handleDepartmentChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupIcon color="primary" />
                    </InputAdornment>
                  }
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Employee Selection - update width */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Autocomplete
                  multiple
                  fullWidth
                  id="employee-select"
                  options={filteredEmployees}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  value={employees.filter(emp => selectedEmployees.includes(emp._id))}
                  onChange={handleEmployeeChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Select Employees"
                      variant="outlined"
                      placeholder="Search employees..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <GroupIcon color="primary" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        avatar={<Avatar>{getEmployeeInitials(option.name)}</Avatar>}
                        label={option.name}
                        {...getTagProps({ index })}
                        variant="outlined"
                        color="primary"
                        key={option._id}
                      />
                    ))
                  }
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {selectedEmployees.length} employees selected
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedEmployees.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={handleClearEmployeeSelection}
                        startIcon={<ClearAllIcon />}
                      >
                        Clear
                      </Button>
                    )}
                    
                    {selectedDepartment && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={handleSelectAllEmployees}
                        startIcon={<SelectAllIcon />}
                        disabled={filteredEmployees.length === 0}
                      >
                        Select All {filteredEmployees.length > 0 ? `(${filteredEmployees.length})` : ''}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            {/* Month and Year selection - update width */}
            <Grid item xs={6} md={1.5}>
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
            
            <Grid item xs={6} md={1.5}>
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
            
            {/* View Button */}
            <Grid item xs={12} md={1}>
              <ActionButton 
                fullWidth 
                variant="contained" 
                color="primary"
                onClick={fetchSchedules}
                disabled={loading || selectedEmployees.length === 0}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ViewDayIcon />}
                sx={{ height: '56px' }}
              >
                {loading ? 'Loading...' : 'View'}
              </ActionButton>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Viewing schedules for {monthName} {year}
              {selectedDepartment && ` • Department: ${selectedDepartment}`}
              {selectedEmployees.length > 0 && ` • ${selectedEmployees.length} employees selected`}
            </Typography>
            
            {/* View Mode Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                View Mode:
              </Typography>
              <ViewToggleWrapper>
                <Tooltip title="Grid View">
                  <IconButton
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => handleToggleViewMode('grid')}
                    size="small"
                    sx={{ borderRadius: 0, p: 1 }}
                  >
                    <GridOnIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Timeline View">
                  <IconButton
                    color={viewMode === 'timeline' ? 'primary' : 'default'}
                    onClick={() => handleToggleViewMode('timeline')}
                    size="small"
                    sx={{ borderRadius: 0, p: 1 }}
                  >
                    <ViewListIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ViewToggleWrapper>
            </Box>
          </Box>
        </FilterCard>
      )}
      
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

      {/* Schedule content */}
      {schedules.length > 0 ? (
        <Box sx={{ pt: 2 }}>
          {viewMode === 'grid' ? (
            // Grid view - days displayed only once at top
            <ScheduleTimelineGrid 
              schedules={schedules} 
              onUpdateDay={handleScheduleUpdate}
            />
          ) : (
            // Timeline view - individual timelines for each employee
            schedules.map((schedule, index) => {
              const employeeName = schedule.employee_name || 'Employee';
              const employeeInitials = getEmployeeInitials(employeeName);
              
              return (
                <ScheduleTimeline
                  key={schedule._id || index}
                  schedule={schedule}
                  employeeName={employeeName}
                  employeeInitials={employeeInitials}
                  onUpdateDay={(updatedSchedule) => handleScheduleUpdate(updatedSchedule, index)}
                />
              );
            })
          )}
        </Box>
      ) : (
        // No schedules view
        <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
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
              No Schedules Selected
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
              Select employees and a month/year from the filters above, then click "View Schedules" to see their schedules.
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
        </Card>
      )}
    </Box>
  );
} 