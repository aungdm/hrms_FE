import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  styled,
  useTheme,
  Avatar,
  Chip,
  ButtonGroup,
  Button,
  Badge,
  Switch,
  FormControlLabel,
  Fab
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Brightness2 as NightIcon,
  WbSunny as MorningIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  EditAttributes as EditAttributesIcon
} from '@mui/icons-material';
import EditDayModal from './EditDayModal';
import MultiEditModal from './MultiEditModal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parse, addDays } from 'date-fns';
import { updateMultipleEmployeeScheduleDays } from '../request';

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3),
}));

const ScrollControlsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.neutral,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const MultiSelectSwitch = styled(FormControlLabel)(({ theme }) => ({
  marginLeft: 0,
  '& .MuiFormControlLabel-label': {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
  }
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.background.neutral,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.light,
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

const GridHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: theme.palette.background.neutral,
}));

const EmployeeColumn = styled(Box)(({ theme }) => ({
  minWidth: '150px',
  width: '150px',
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const DayCell = styled(Box)(({ theme, isWeekend, isToday }) => ({
  minWidth: '120px',
  width: '120px',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: isToday ? theme.palette.primary.lighter : 
                 isWeekend ? theme.palette.grey[50] : 
                 theme.palette.background.neutral,
}));

const DayNumber = styled(Typography)(({ theme, isWeekend, isToday }) => ({
  fontWeight: 'bold',
  fontSize: '1.2rem',
  color: isToday ? theme.palette.primary.main : 
         isWeekend ? theme.palette.error.main : 
         theme.palette.text.primary,
}));

const DayName = styled(Typography)(({ theme, isWeekend }) => ({
  fontSize: '0.75rem',
  color: isWeekend ? theme.palette.error.main : theme.palette.text.secondary,
}));

const GridRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const EmployeeNameCell = styled(Box)(({ theme }) => ({
  minWidth: '150px',
  width: '150px',
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.neutral,
  display: 'flex',
  alignItems: 'center',
}));

const EmployeeAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: "#6b6b6b",
  marginRight: theme.spacing(1),
  padding: theme.spacing(0.5)
}));

const ScheduleCell = styled(Box)(({ theme, isDayOff, isWeekend, isToday, isSelected }) => ({
  minWidth: '120px',
  width: '120px',
  height: '80px',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  backgroundColor: isSelected ? theme.palette.primary.lighter + '99' : 
               isDayOff ? theme.palette.error.lighter : 
               isToday ? theme.palette.primary.lighter :
               isWeekend ? theme.palette.grey[50] : 
               theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.2s',
  outline: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxShadow: isSelected ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    boxShadow: 'inset 0 0 0 1px ' + theme.palette.primary.main,
  }
}));

// Enhanced shift time box with better styling
const TimeInfoCard = styled(Box)(({ theme, shiftType }) => {
  // Define color schemes based on shift type
  const getColorScheme = () => {
    // switch(shiftType) {
      // case 'morning':
      //   return {
      //     bg: '#e8f5e9',
      //     border: '#81c784',
      //     text: '#2e7d32'
      //   };
      // case 'evening':
      //   return {
      //     bg: '#e3f2fd',
      //     border: '#64b5f6',
      //     text: '#1976d2'
      //   };
      // case 'night':
        return {
          bg: '#e8eaf6',
          border: '#7986cb',
          text: '#3f51b5'
        };
      // default:
      //   return {
      //     bg: theme.palette.background.neutral,
      //     border: theme.palette.divider,
      //     text: theme.palette.text.primary
      //   };
    // }
  };
  
  const colors = getColorScheme();
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1, 0.5),
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
    width: '100%',
    fontSize: '0.8rem',
    fontWeight: 500,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    position: 'relative'
  };
});

// Edit button styled as a floating action button
const EditButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 4,
  bottom: 4,
  width: 24,
  height: 24,
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  opacity: 0.7,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    opacity: 1
  },
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

// Selection checkbox for multi-select mode
const SelectCheckbox = styled(Box)(({ theme, checked }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: checked ? theme.palette.primary.main : theme.palette.action.active,
  opacity: checked ? 1 : 0.7,
  transition: 'all 0.2s ease',
  backgroundColor: checked ? theme.palette.background.paper + '99' : 'transparent',
  borderRadius: '50%',
  width: 24,
  height: 24,
  zIndex: 10 // Add z-index to ensure it's above other elements
}));

// Shift type indicator
const ShiftIcon = styled(Box)(({ theme, shiftType }) => ({
  position: 'absolute',
  top: 4,
  left: 4,
  borderRadius: '50%',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  backgroundColor: shiftType === 'morning' 
    ? '#f57c00' 
    : shiftType === 'night' 
      ? '#512da8' 
      : '#1976d2'
}));

// Multi-edit floating action button
const MultiEditFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1000,
  boxShadow: theme.shadows[3]
}));

const ScheduleTimelineGrid = ({ schedules, onUpdateDay }) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // New states for multi-select functionality
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isMultiEditModalOpen, setIsMultiEditModalOpen] = useState(false);

  // Create array of days for the timeline
  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  const timelineDays = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  // Toggle multi-select mode
  const handleToggleMultiSelect = (event) => {
    const checked = event.target.checked;
    setMultiSelectMode(checked);
    if (!checked) {
      // Clear selected slots when disabling
      setSelectedSlots([]);
    }
  };
  
  // Check if a slot is selected
  const isSlotSelected = (employeeIndex, dayIndex) => {
    return selectedSlots.some(slot => 
      slot.employeeIndex === employeeIndex && slot.dayIndex === dayIndex
    );
  };
  
  // Handle selecting/deselecting a slot
  const handleSelectSlot = (employeeIndex, dayIndex, day, daySchedule) => {
    const isAlreadySelected = isSlotSelected(employeeIndex, dayIndex);
    
    if (isAlreadySelected) {
      // Deselect the slot
      setSelectedSlots(selectedSlots.filter(slot => 
        !(slot.employeeIndex === employeeIndex && slot.dayIndex === dayIndex)
      ));
    } else {
      // Select the slot - regardless of whether daySchedule exists or not
      // Get the schedule for this employee
      const schedule = schedules[employeeIndex];
      if (!schedule) return; // Guard against invalid employee index
      
      // Get the date string for this day
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Find the day schedule if it wasn't provided
      let slotDaySchedule = daySchedule;
      if (!slotDaySchedule) {
        slotDaySchedule = schedule.schedules?.find(s => {
          try {
            if (!s.date) return false;
            return format(new Date(s.date), 'yyyy-MM-dd') === dateStr;
          } catch (error) {
            console.error("Invalid date format:", s.date, error);
            return false;
          }
        });
      }
      
      // If we still don't have a day schedule, create a minimal one
      if (!slotDaySchedule) {
        slotDaySchedule = {
          date: day.toISOString(),
          isDayOff: false
        };
      }
      
      // Add to selected slots
      setSelectedSlots([
        ...selectedSlots, 
        { 
          employeeIndex, 
          dayIndex, 
          day,
          daySchedule: slotDaySchedule,
          scheduleId: schedule._id,
          employeeName: schedule.employee_id.name || `Employee ${employeeIndex + 1}`
        }
      ]);
    }
  };
  
  // Open multi-edit modal
  const handleOpenMultiEdit = () => {
    if (selectedSlots.length > 0) {
      setIsMultiEditModalOpen(true);
    }
  };
  
  // Handle multi-edit modal submission
  const handleMultiEditSubmit = (updates) => {
    // Create array of updates to send to backend
    const schedulesToUpdate = selectedSlots.map(slot => {
      const schedule = schedules[slot.employeeIndex];
      const dayDate = timelineDays[slot.dayIndex];
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      
      // Find the existing day schedule if it exists
      let daySchedule = schedule.schedules?.find(s => {
        try {
          if (!s.date) return false;
          return format(new Date(s.date), 'yyyy-MM-dd') === dateStr;
        } catch (error) {
          console.error("Invalid date format:", s.date, error);
          return false;
        }
      });
      
      // If no existing schedule, create a new one
      if (!daySchedule) {
        daySchedule = {
          date: dayDate.toISOString(),
          employee_id: schedule.employee_id,
          employee_name: schedule.employee_name,
          isDayOff: false
        };
      }
      
      // Apply updates
      const updatedSchedule = { ...daySchedule };
      
      // IMPORTANT: Include the schedule_id which is required by the backend
      if (schedule && schedule._id) {
        updatedSchedule.schedule_id = schedule._id;
      }
      
      // Day Off status - apply to all selected slots
      if (updates.isDayOff !== undefined) {
        updatedSchedule.isDayOff = updates.isDayOff;
      }
      
      // Time slot - if we're setting a time slot and this is not a day off based on the UPDATES
      // (ignore the previous state of the day)
      if (updates.timeSlotInfo && updates.isDayOff === false) {
        try {
          // Include the time_slot_id so backend can use it to retrieve shift details
          updatedSchedule.time_slot_id = updates.timeSlotInfo.time_slot_id;
          
          // Continue calculating times for frontend display and compatibility
          const startDate = new Date(daySchedule.date);
          const endDate = new Date(daySchedule.date);
          
          // Parse start time
          const [startHours, startMinutes] = updates.timeSlotInfo.shiftStart.split(':').map(Number);
          startDate.setHours(startHours, startMinutes, 0, 0);
          
          // Parse end time
          const [endHours, endMinutes] = updates.timeSlotInfo.shiftEnd.split(':').map(Number);
          endDate.setHours(endHours, endMinutes, 0, 0);
          
          // Check if end time is earlier than start time (next day)
          if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) {
            endDate.setDate(endDate.getDate() + 1);
          }
          
          updatedSchedule.start = startDate.toISOString();
          updatedSchedule.end = endDate.toISOString();
          updatedSchedule.day_changed = endDate.getDate() !== startDate.getDate();
          // Add a note about which schedule is being used
          updatedSchedule.notes = `Using schedule: ${updates.timeSlotInfo.name}`;
        } catch (error) {
          console.error("Error processing time slot update:", error);
        }
      } else if (updates.isDayOff === true) {
        // If marking as day off, explicitly clear all time slot related fields
        updatedSchedule.time_slot_id = null;
        updatedSchedule.start = null;
        updatedSchedule.end = null;
        updatedSchedule.day_changed = false;
        updatedSchedule.is_full_overtime_shift = false;
        updatedSchedule.actual_expected_minutes = 0;
        updatedSchedule.notes = "Day off";
      }
      
      return updatedSchedule;
    });

    // Log the batch update payload for debugging
    console.log('Batch updating schedules:', schedulesToUpdate);
    
    // Use the new batch update function
    updateMultipleEmployeeScheduleDays(schedulesToUpdate)
      .then(response => {
        console.log('Batch update successful:', response);
        
        // Refresh the schedules via the parent component's handler
        if (onUpdateDay) {
          // Call with special flag to indicate full refresh is needed
          onUpdateDay({ needsRefresh: true }, -1);
        }
        
        // Clear selections and close modal
        setSelectedSlots([]);
        setIsMultiEditModalOpen(false);
      })
      .catch(error => {
        console.error('Error in batch update:', error);
        // Keep modal open to show error
        alert('Failed to update schedules. Please try again.');
      });
  };
  
  // Determine shift type from time
  const getShiftType = (startTimeStr, endTimeStr) => {
    try {
      const startTime = new Date(startTimeStr);
      const startHour = startTime.getHours();
      
      if (startHour >= 5 && startHour < 12) {
        return 'morning';
      } else if (startHour >= 12 && startHour < 18) {
        return 'evening';
      } else {
        return 'night';
      }
    } catch (e) {
      return 'evening'; // default
    }
  };
  
  // Format time for display
  const formatTimeDisplay = (startTimeStr, endTimeStr) => {
    try {
      const startTime = new Date(startTimeStr);
      const endTime = new Date(endTimeStr);
      return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
    } catch (e) {
      return "Invalid Time";
    }
  };
  
  // Scroll controls
  const scrollDays = (days) => {
    if (scrollContainerRef.current) {
      const dayWidth = 120; // Width of day cell
      scrollContainerRef.current.scrollLeft += (dayWidth * days);
    }
  };
  
  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const today = new Date();
      const startOfMonthDay = startOfMonth(currentMonth).getDate();
      const todayIndex = today.getDate() - startOfMonthDay;
      
      if (todayIndex >= 0) {
        const dayWidth = 120; // Width of day cell
        scrollContainerRef.current.scrollLeft = dayWidth * todayIndex;
      }
    }
  };

  // Synchronize scrolling between header and body
  const handleScroll = (event) => {
    const scrollLeft = event.target.scrollLeft;
    document.querySelectorAll('.scrollable-row').forEach(el => {
      if (el !== event.target) {
        el.scrollLeft = scrollLeft;
      }
    });
  };

  useEffect(() => {
    const allScrollables = document.querySelectorAll('.scrollable-row');
    allScrollables.forEach(el => {
      el.addEventListener('scroll', handleScroll);
    });

    return () => {
      allScrollables.forEach(el => {
        el.removeEventListener('scroll', handleScroll);
      });
    };
  }, [schedules]);

  // Handle day click for editing
  const handleDayClick = (day, employeeIndex, dayIndex) => {
    if (multiSelectMode) {
      // In multi-select mode, toggle selection of the clicked day
      // Find the schedule for this day to pass to handleSelectSlot
      const schedule = schedules[employeeIndex];
      const dateStr = format(day, 'yyyy-MM-dd');
      
      const daySchedule = schedule.schedules?.find(s => {
        try {
          if (!s.date) return false;
          return format(new Date(s.date), 'yyyy-MM-dd') === dateStr;
        } catch (error) {
          console.error("Invalid date format:", s.date, error);
          return false;
        }
      });
      
      handleSelectSlot(employeeIndex, dayIndex, day, daySchedule);
      return;
    }
    
    // Regular click handling for opening edit modal
    setSelectedDay(day);
    setSelectedEmployeeIndex(employeeIndex);
    
    // Find the schedule for this day
    const schedule = schedules[employeeIndex];
    const dateStr = format(day, 'yyyy-MM-dd');
    
    const daySchedule = schedule.schedules?.find(s => {
      try {
        if (!s.date) return false;
        return format(new Date(s.date), 'yyyy-MM-dd') === dateStr;
      } catch (error) {
        console.error("Invalid date format:", s.date, error);
        return false;
      }
    });
    
    setIsEditModalOpen(true);
  };
  
  // Handle edit success
  const handleEditSuccess = (updatedSchedule) => {
    if (onUpdateDay) {
      onUpdateDay(updatedSchedule, selectedEmployeeIndex);
    }
  };

  return (
    <Container>
      {/* Scroll controls and multi-select toggle */}
      <ScrollControlsBar>
        <ActionButtons>
          <MultiSelectSwitch
            control={
              <Switch 
                checked={multiSelectMode} 
                onChange={handleToggleMultiSelect}
                color="primary"
                size="small"
              />
            }
            label="Enable Multiple Select"
          />
          
          {multiSelectMode && selectedSlots.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<EditAttributesIcon />}
              onClick={handleOpenMultiEdit}
              sx={{ ml: 1 }}
            >
              Edit {selectedSlots.length} Selected Slot{selectedSlots.length > 1 ? 's' : ''}
            </Button>
          )}
        </ActionButtons>
        
        <ButtonGroup size="small" variant="contained" color="primary">
          <Button onClick={() => scrollDays(-7)} startIcon={<ChevronLeftIcon />}>
            -7d
          </Button>
          <Button onClick={scrollToToday} startIcon={<TodayIcon />}>
            Today
          </Button>
          <Button onClick={() => scrollDays(7)} endIcon={<ChevronRightIcon />}>
            +7d
          </Button>
        </ButtonGroup>
      </ScrollControlsBar>
      
      {/* Days header */}
      <ScrollableContainer className="scrollable-row" ref={scrollContainerRef}>
        <GridHeader>
          <EmployeeColumn>
            <Typography variant="subtitle1" fontWeight="bold">
              Employees
            </Typography>
          </EmployeeColumn>
          
          {timelineDays.map((day, dayIndex) => {
            const isToday = isSameDay(day, new Date());
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const dayName = format(day, 'EEE');
            
            return (
              <DayCell 
                key={day.toString()} 
                isWeekend={isWeekend}
                isToday={isToday}
              >
                <DayNumber isWeekend={isWeekend} isToday={isToday}>
                  {format(day, 'd')}
                </DayNumber>
                <DayName isWeekend={isWeekend}>
                  {dayName}
                </DayName>
              </DayCell>
            );
          })}
        </GridHeader>
        
        {/* Employee rows */}
        {schedules.map((schedule, employeeIndex) => {
          // Get employee name and initials
          const employeeName = schedule.employee_id.name || 'Employee';
          const employeeInitials = getEmployeeInitials(employeeName);
          const timeSlotName = schedule.time_slot_id?.name || 'Schedule';
          
          return (
            <GridRow key={schedule._id || employeeIndex}>
              <EmployeeNameCell>
                <EmployeeAvatar>{employeeInitials}</EmployeeAvatar>
                <Box>
                  <Typography variant="subtitle2" noWrap>
                    {employeeName}
                  </Typography>
                </Box>
              </EmployeeNameCell>
              
              {/* Schedule cells */}
              {timelineDays.map((day, dayIndex) => {
                const isToday = isSameDay(day, new Date());
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isCurrentMonthDay = isSameMonth(day, currentMonth);
                
                // Find schedule for this day
                const dateStr = format(day, 'yyyy-MM-dd');
                const daySchedule = schedule.schedules?.find(s => {
                  try {
                    if (!s.date) return false;
                    return format(new Date(s.date), 'yyyy-MM-dd') === dateStr;
                  } catch (error) {
                    console.error("Invalid date format:", s.date, error);
                    return false;
                  }
                });
                
                const isDayOff = daySchedule?.isDayOff || false;
                
                // Determine shift type for styling
                const shiftType = daySchedule && !isDayOff 
                  ? getShiftType(daySchedule.start, daySchedule.end) 
                  : null;
                
                // Check if this slot is selected in multi-select mode
                const isSelected = isSlotSelected(employeeIndex, dayIndex);

                return (
                  <ScheduleCell
                    key={`${schedule._id}-${day.toString()}`}
                    isWeekend={isWeekend}
                    isDayOff={isDayOff}
                    isToday={isToday}
                    isSelected={isSelected}
                    onClick={() => handleDayClick(day, employeeIndex, dayIndex)}
                    sx={{
                      opacity: isCurrentMonthDay ? 1 : 0.4,
                    }}
                  >
                    {daySchedule && !isDayOff && (
                      <>
                        {/* Shift type indicator */}
                        <ShiftIcon shiftType={shiftType}>
                          {shiftType === 'morning' ? (
                            <MorningIcon sx={{ fontSize: 14 }} />
                          ) : shiftType === 'night' ? (
                            <NightIcon sx={{ fontSize: 14 }} />
                          ) : (
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                          )}
                        </ShiftIcon>
                          
                        {/* Enhanced time display */}
                        <TimeInfoCard shiftType={shiftType}>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium"
                            align="center"
                            sx={{ 
                              fontSize: '0.8rem', 
                              lineHeight: 1.1,
                              width: '100%'
                            }}
                          >
                            {formatTimeDisplay(daySchedule.start, daySchedule.end)}
                          </Typography>
                        </TimeInfoCard>
                      </>
                    )}
                    
                    {/* Selection checkbox for multi-select mode - moved outside to show for all slots */}
                    {multiSelectMode && (
                      <SelectCheckbox checked={isSelected}>
                        {isSelected ? (
                          <CheckBoxIcon fontSize="small" />
                        ) : (
                          <CheckBoxOutlineBlankIcon fontSize="small" />
                        )}
                      </SelectCheckbox>
                    )}
                    
                    {isDayOff && (
                      <Chip 
                        label="Day Off"
                        color="error"
                        size="small"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem', 
                          fontWeight: 'bold',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          opacity: isSelected ? 1 : 0.9,
                          boxShadow: isSelected ? '0 0 5px rgba(0,0,0,0.2)' : 'none'
                        }}
                      />
                    )}
                    
                    {/* Edit button (only show in single edit mode) */}
                    {!multiSelectMode && !isDayOff && (
                      <EditButton size="small">
                        <EditIcon sx={{ fontSize: 12 }} />
                      </EditButton>
                    )}
                  </ScheduleCell>
                );
              })}
            </GridRow>
          );
        })}
      </ScrollableContainer>
      
      {/* Floating button for multi-edit (mobile friendly) */}
      {multiSelectMode && selectedSlots.length > 0 && (
        <MultiEditFab 
          color="primary" 
          size="medium" 
          onClick={handleOpenMultiEdit}
          aria-label="edit selected slots"
        >
          <EditAttributesIcon />
        </MultiEditFab>
      )}
      
      {/* Edit Modals */}
      {selectedDay && !multiSelectMode && (
        <EditDayModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          dayData={(() => {
            // Find the day schedule
            const daySchedule = schedules[selectedEmployeeIndex]?.schedules?.find(
              s => {
                try {
                  if (!s.date) return false;
                  return format(new Date(s.date), 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
                } catch (error) {
                  console.error("Invalid date format:", s.date, error);
                  return false;
                }
              }
            );
            
            // Add the schedule_id to the dayData if we have a daySchedule
            if (daySchedule) {
              return {
                ...daySchedule,
                schedule_id: schedules[selectedEmployeeIndex]?._id
              };
            }
            
            return daySchedule;
          })()}
          date={selectedDay}
          onSuccess={(updatedDaySchedule) => {
            handleEditSuccess(updatedDaySchedule);
            setIsEditModalOpen(false);
          }}
        />
      )}
      
      {/* Multi-Edit Modal */}
      {selectedSlots.length > 0 && (
        <MultiEditModal
          open={isMultiEditModalOpen}
          onClose={() => {
            setIsMultiEditModalOpen(false);
            // Don't clear selections to allow user to continue selecting
          }}
          selectedSlots={selectedSlots.map(slot => {
            const schedule = schedules[slot.employeeIndex];
            const dayDate = timelineDays[slot.dayIndex];
            const dateStr = format(dayDate, 'yyyy-MM-dd');
            
            // Find the day schedule with validation
            const daySchedule = schedule.schedules?.find(s => {
              try {
                if (!s.date) return false;
                return format(new Date(s.date), 'yyyy-MM-dd') === dateStr;
              } catch (error) {
                console.error("Invalid date format:", s.date, error);
                return false;
              }
            });
            
            return {
              employeeIndex: slot.employeeIndex,
              employeeName: schedule.employee_id.name || 'Employee',
              dayIndex: slot.dayIndex,
              daySchedule: daySchedule || { 
                date: dayDate.toISOString(),
                isDayOff: false
              }
            };
          })}
          onSuccess={handleMultiEditSubmit}
        />
      )}
    </Container>
  );
};

// Helper function to get initials from a name
const getEmployeeInitials = (name) => {
  if (!name) return 'E';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0);
  return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
};

export default ScheduleTimelineGrid; 