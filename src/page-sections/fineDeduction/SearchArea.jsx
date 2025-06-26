import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// MUI
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Search from "@mui/icons-material/Search";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { 
  Button, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Stack
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { getAllEmployees } from "./request";

export default function SearchArea(props) {
  const { 
    search = "",
    onSearchChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    employeeId,
    onEmployeeChange,
    status,
    onStatusChange,
    onFilterApply
  } = props;

  const [employees, setEmployees] = useState([]);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getAllEmployees();
        if (response.success) {
          setEmployees(response.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    
    fetchEmployees();
  }, []);

  return (
    <Box mt={3} mb={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by type or description..."
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.disabled' }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={onStartDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
              slotProps={{
                textField: { fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={onEndDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
              slotProps={{
                textField: { fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Employee</InputLabel>
            <Select
              value={employeeId || ""}
              onChange={(e) => onEmployeeChange(e.target.value)}
              label="Employee"
            >
              <MenuItem value="">All Employees</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status || ""}
              onChange={(e) => onStatusChange(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={1}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={onFilterApply}
          >
            Filter
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
