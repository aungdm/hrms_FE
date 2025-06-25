import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Search from "@mui/icons-material/Search";
import FilterList from "@mui/icons-material/FilterList";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { 
  Button, 
  Grid, 
  Card, 
  Collapse, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Stack,
  Typography,
  Divider
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format } from "date-fns";

export default function SearchArea(props) {
  const { 
    value = "", 
    onChange, 
    onFilterChange,
    onDateRangeChange,
    onEmployeeChange,
    onDeviceChange,
    onProcessedChange,
    employees = [],
    devices = [],
    filters = {},
    gridRoute, 
    listRoute 
  } = props;

  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleDateChange = (type, date) => {
    if (onDateRangeChange) {
      const formattedDate = date ? format(date, "yyyy-MM-dd") : null;
      onDateRangeChange(type, formattedDate);
    }
  };

  const handleFilterReset = () => {
    if (onFilterChange) {
      onFilterChange({
        startDate: null,
        endDate: null,
        employeeId: "",
        deviceId: "",
        processed: ""
      });
    }
  };

  return (
    <Box mt={3} mb={3}>
      <FlexBetween mb={2}>
        <Box display="flex" alignItems="center">
          <TextField
            value={value}
            onChange={onChange}
            placeholder="Search..."
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
          <IconButton 
            onClick={handleFilterToggle} 
            sx={{ 
              ml: 1, 
              bgcolor: showFilters ? 'primary.light' : 'transparent',
              color: showFilters ? 'primary.main' : 'text.secondary',
              '&:hover': {
                bgcolor: showFilters ? 'primary.light' : 'action.hover',
              }
            }}
          >
            <FilterList />
          </IconButton>
        </Box>

        <Button 
          variant="contained" 
          onClick={() => onFilterChange(filters)}
          disabled={!filters}
        >
          Apply Filters
        </Button>
      </FlexBetween>

      <Collapse in={showFilters}>
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="600" mb={1}>
            Advanced Filters
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate ? new Date(filters.startDate) : null}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate ? new Date(filters.endDate) : null}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={filters.employeeId || ""}
                    onChange={(e) => onEmployeeChange(e.target.value)}
                    label="Employee"
                  >
                    <MenuItem value="">All Employees</MenuItem>
                    {employees.map((employee) => (
                      <MenuItem 
                        key={employee._id} 
                        value={employee.user_defined_code || employee._id}
                      >
                        {employee.name} ({employee.user_defined_code || "No ID"})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Device</InputLabel>
                  <Select
                    value={filters.deviceId || ""}
                    onChange={(e) => onDeviceChange(e.target.value)}
                    label="Device"
                  >
                    <MenuItem value="">All Devices</MenuItem>
                    {devices.map((device) => (
                      <MenuItem key={device.ip} value={device.ip}>
                        {device.name || device.ip}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.processed || ""}
                    onChange={(e) => onProcessedChange(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Processed</MenuItem>
                    <MenuItem value="false">Not Processed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
          
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleFilterReset}
              sx={{ mr: 1 }}
            >
              Reset Filters
            </Button>
          </Box>
        </Card>
      </Collapse>
    </Box>
  );
}
