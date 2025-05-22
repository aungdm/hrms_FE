import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  styled,
  useTheme,
  Card,
  Avatar,
  Badge,
  ButtonGroup
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  EventBusy as EventBusyIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Event as EventIcon,
  Notes as NotesIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import EditDayModal from './EditDayModal';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

// Styled components with enhanced design
const DayBox = styled(Paper)(({ theme, isCurrentMonth, isDayOff, isWorkDay, isWeekend, isToday }) => ({
  height: '130px',
  padding: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.3s',
  borderRadius: theme.shape.borderRadius,
  boxShadow: isToday ? theme.shadows[3] : theme.shadows[1],
  border: isToday ? `2px solid ${theme.palette.primary.main}` : 'none',
  backgroundColor: isDayOff ? theme.palette.error.lighter : 
                 isWeekend ? theme.palette.grey[50] : 
                 theme.palette.background.paper,
  opacity: isCurrentMonth ? 1 : 0.4,
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-3px)'
  },
  overflow: 'hidden'
}));

const DayNumber = styled(Box)(({ theme, isToday }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(0.5)
}));

const DayNumberAvatar = styled(Avatar)(({ theme, isWeekend }) => ({
  width: 28,
  height: 28,
  fontSize: '0.85rem',
  backgroundColor: isWeekend ? theme.palette.grey[300] : theme.palette.primary.main,
  color: isWeekend ? theme.palette.text.secondary : theme.palette.primary.contrastText,
  fontWeight: 'bold'
}));

const ShiftTime = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.background.neutral,
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem'
}));

const StyledNotesText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  margin: theme.spacing(0.5, 0),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical'
}));

const MonthNavigator = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.neutral,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const WeekdayHeader = styled(Box)(({ theme, isWeekend }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
  backgroundColor: isWeekend ? theme.palette.error.lighter : theme.palette.primary.lighter,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  fontWeight: 'bold',
  color: isWeekend ? theme.palette.error.main : theme.palette.primary.main,
}));

const DayOffBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  height: 20,
  fontSize: '0.65rem',
  fontWeight: 'bold',
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  boxShadow: theme.shadows[2],
}));

const ScheduleCalendar = ({ schedule, onUpdateDay }) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Compute calendar days for the current month view
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  
  // Create array of days for the calendar view (including some days from adjacent months)
  const startDate = startOfMonth(currentMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from the previous Sunday
  
  const endDate = endOfMonth(currentMonth);
  if (endDate.getDay() < 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on the next Saturday
  }
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Get day details from schedule
  const getDaySchedule = (date) => {
    if (!schedule || !schedule.schedules) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.schedules.find(s => 
      format(new Date(s.date), 'yyyy-MM-dd') === dateStr
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (day) => {
    const scheduleDay = getDaySchedule(day);
    if (scheduleDay) {
      setSelectedDay(scheduleDay);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSuccess = (updatedSchedule) => {
    if (onUpdateDay) {
      onUpdateDay(updatedSchedule);
    }
  };

  // Calendar header with weekday names
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      {/* Enhanced calendar header and navigation */}
      <MonthNavigator>
        <Box>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Schedule for {schedule?.employee_id?.name || 'Employee'}
          </Typography>
        </Box>
        
        <ButtonGroup variant="contained" color="primary" size="small">
          <Button onClick={handlePreviousMonth} startIcon={<ChevronLeftIcon />}>
            Prev
          </Button>
          <Button onClick={handleCurrentMonth} startIcon={<TodayIcon />}>
            Today
          </Button>
          <Button onClick={handleNextMonth} endIcon={<ChevronRightIcon />}>
            Next
          </Button>
        </ButtonGroup>
      </MonthNavigator>

      {/* Weekday headers with improved styling */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {weekDays.map((day) => (
          <Grid item xs={12/7} key={day}>
            <WeekdayHeader isWeekend={day === 'Sun' || day === 'Sat'}>
              {day}
            </WeekdayHeader>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid with enhanced styling */}
      <Grid container spacing={1.5}>
        {calendarDays.map((day) => {
          const daySchedule = getDaySchedule(day);
          const isCurrentMonthDay = isSameMonth(day, currentMonth);
          const isDayOff = daySchedule?.isDayOff || false;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isToday = isSameDay(new Date(), day);

          return (
            <Grid item xs={12/7} key={day.toString()}>
              <DayBox 
                isCurrentMonth={isCurrentMonthDay}
                isDayOff={isDayOff}
                isWeekend={isWeekend}
                isToday={isToday}
                onClick={() => handleDayClick(day)}
                elevation={isToday ? 3 : 1}
              >
                {/* Day number with avatar for better visibility */}
                <DayNumber>
                  <DayNumberAvatar isWeekend={isWeekend}>
                    {format(day, 'd')}
                  </DayNumberAvatar>
                </DayNumber>
                
                {isDayOff && (
                  <DayOffBadge
                    size="small"
                    label="Day Off"
                    icon={<EventBusyIcon style={{ fontSize: '0.75rem' }} />}
                  />
                )}

                {/* Work schedule details with improved styling */}
                {daySchedule && !isDayOff && (
                  <>
                    <ShiftTime>
                      <AccessTimeIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
                      <Typography variant="caption" fontWeight="medium">
                        {format(new Date(daySchedule.start), 'h:mm a')} - {format(new Date(daySchedule.end), 'h:mm a')}
                      </Typography>
                    </ShiftTime>
                    
                    {daySchedule.day_changed && (
                      <Chip 
                        size="small"
                        label="Next day finish"
                        color="warning"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem', 
                          mt: 0.5,
                          fontWeight: 'medium' 
                        }}
                      />
                    )}
                    
                    {daySchedule.notes && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 0.5, gap: 0.5 }}>
                        <NotesIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.25 }} />
                        <StyledNotesText>{daySchedule.notes}</StyledNotesText>
                      </Box>
                    )}
                  </>
                )}

                {/* Edit button with enhanced styling */}
                <Tooltip title="Edit Schedule">
                  <IconButton 
                    size="small" 
                    color="primary"
                    sx={{ 
                      position: 'absolute', 
                      right: 4, 
                      bottom: 4,
                      opacity: 0.6,
                      backgroundColor: 'background.paper',
                      '&:hover': { 
                        opacity: 1,
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </DayBox>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit day modal */}
      <EditDayModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        day={selectedDay}
        scheduleId={schedule?._id}
        onSuccess={handleEditSuccess}
      />
    </Box>
  );
};

export default ScheduleCalendar; 