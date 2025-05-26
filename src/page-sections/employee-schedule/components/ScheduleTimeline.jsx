import React, { useState, useRef } from 'react';
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
  Divider
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  EventBusy as EventBusyIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import EditDayModal from './EditDayModal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, isSameMonth } from 'date-fns';

// Styled components
const ScheduleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[2],
}));

const EmployeeHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const EmployeeInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const EmployeeAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: theme.palette.secondary.main,
}));

const ScrollControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ScrollableArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
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

const DayCard = styled(Paper)(({ theme, isToday, isDayOff, isWeekend, isCurrentMonth }) => ({
  minWidth: '120px',
  width: '120px',
  height: '110px',
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isDayOff ? theme.palette.error.lighter : 
                 isWeekend ? theme.palette.grey[50] : 
                 theme.palette.background.paper,
  border: isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid',
  borderColor: theme.palette.divider,
  opacity: isCurrentMonth ? 1 : 0.4,
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
  },
}));

const DayHeader = styled(Box)(({ theme, isWeekend }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const DateText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
}));

const TimeInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  backgroundColor: theme.palette.background.neutral,
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
}));

const WeekdayLabel = styled(Box)(({ theme, isWeekend }) => ({
  color: isWeekend ? theme.palette.error.main : theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 'medium',
}));

const DAYS_TO_SHOW = 14; // Default number of days to show in the timeline

const ScheduleTimeline = ({ schedule, onUpdateDay, employeeName, employeeInitials }) => {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Generate all days in the current month
  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  
  // Create array of days for display
  const timelineDays = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  // Get day details from schedule
  const getDaySchedule = (date) => {
    if (!schedule || !schedule.schedules) return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySchedule = schedule.schedules.find(s => {
      try {
        if (!s.date) return false;
        return format(new Date(s.date), 'yyyy-MM-dd') === dateStr;
      } catch (error) {
        console.error("Invalid date format:", s.date, error);
        return false;
      }
    });
    return daySchedule;
  };
  
  // Scroll controls
  const scrollDays = (days) => {
    if (scrollRef.current) {
      const cardWidth = 120 + 8; // card width + margin
      scrollRef.current.scrollLeft += (cardWidth * days);
    }
  };
  
  const scrollToToday = () => {
    if (scrollRef.current) {
      const today = new Date();
      const startOfMonthDay = startOfMonth(currentMonth).getDate();
      const todayIndex = today.getDate() - startOfMonthDay;
      
      if (todayIndex >= 0) {
        const cardWidth = 120 + 8; // card width + margin
        scrollRef.current.scrollLeft = cardWidth * todayIndex;
      }
    }
  };
  
  // Handle day click for editing
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setIsEditModalOpen(true);
  };
  
  const handleEditSuccess = (updatedSchedule) => {
    if (onUpdateDay) {
      onUpdateDay(updatedSchedule);
    }
    setIsEditModalOpen(false);
  };
  
  return (
    <ScheduleContainer>
      <EmployeeHeader>
        <EmployeeInfo>
          <EmployeeAvatar>{employeeInitials || 'E'}</EmployeeAvatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {employeeName || 'Employee'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {format(currentMonth, 'MMMM yyyy')} • {schedule?.time_slot_id?.name || 'Schedule'}
            </Typography>
          </Box>
        </EmployeeInfo>
        
        <ScrollControls>
          <ButtonGroup size="small" variant="contained" color="secondary">
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
        </ScrollControls>
      </EmployeeHeader>
      
      <ScrollableArea ref={scrollRef}>
        {timelineDays.map((day) => {
          const daySchedule = getDaySchedule(day);
          const isToday = isSameDay(day, new Date());
          const isDayOff = daySchedule?.isDayOff || false;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isCurrentMonthDay = isSameMonth(day, currentMonth);
          const dayName = format(day, 'EEE');
          
          return (
            <DayCard 
              key={day.toString()}
              isToday={isToday}
              isDayOff={isDayOff}
              isWeekend={isWeekend}
              isCurrentMonth={isCurrentMonthDay}
              onClick={() => handleDayClick(day)}
            >
              <DayHeader isWeekend={isWeekend}>
                <Box>
                  <DateText variant="body2">{format(day, 'd')}</DateText>
                  <WeekdayLabel isWeekend={isWeekend}>{dayName}</WeekdayLabel>
                </Box>
                
                {isDayOff && (
                  <Chip 
                    label="Off"
                    color="error"
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </DayHeader>
              
              {daySchedule && !isDayOff && (
                <>
                  <TimeInfo>
                    <AccessTimeIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
                    <Typography variant="caption">
                      {format(new Date(daySchedule.start), 'h:mm a')} - {format(new Date(daySchedule.end), 'h:mm a')}
                    </Typography>
                  </TimeInfo>
                  
                  {daySchedule.day_changed && (
                    <Chip 
                      label="Next day"
                      color="warning"
                      size="small" 
                      sx={{ 
                        height: 20, 
                        fontSize: '0.65rem', 
                        mt: 0.5 
                      }}
                    />
                  )}
                  
               
                </>
              )}
              
              {/* Edit indicator */}
              <Tooltip title="Edit Day">
                <IconButton 
                  size="small" 
                  color="primary"
                  sx={{ 
                    position: 'absolute', 
                    right: isDayOff ? 24 : 4, 
                    top: 4,
                    opacity: 0.6,
                    '&:hover': { 
                      opacity: 1,
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: '0.875rem' }} />
                </IconButton>
              </Tooltip>
            </DayCard>
          );
        })}
      </ScrollableArea>
      
      {/* Edit Modal */}
      {selectedDay && (
        <EditDayModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          dayData={getDaySchedule(selectedDay)}
          date={selectedDay}
          onSuccess={handleEditSuccess}
        />
      )}
    </ScheduleContainer>
  );
};

export default ScheduleTimeline; 