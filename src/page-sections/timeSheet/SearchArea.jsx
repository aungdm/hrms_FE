import { useLocation, useNavigate } from "react-router-dom"; // MUI

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Search from "@mui/icons-material/Search";
import FilterList from "@mui/icons-material/FilterList";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { Button, Grid, MenuItem, Collapse, Autocomplete } from "@mui/material";
import Apps from "@/icons/Apps";
import FormatBullets from "@/icons/FormatBullets";

export default function SearchArea(props) {
  const {
    value = "",
    onChange,
    gridRoute,
    listRoute,
    onFilterClick,
    dateRange,
    onDateChange,
    employees,
    employeeFilter,
    onEmployeeFilterChange,
    statusFilter,
    onStatusFilterChange,
    hasOvertimeFilter,
    onOvertimeFilterChange,
    filterOpen
  } = props;
  
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeColor = (path) =>
    pathname === path ? "primary.main" : "grey.400";
    
  // Status options for dropdown
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Present", label: "Present" },
    { value: "Absent", label: "Absent" },
    { value: "Late", label: "Late" },
    { value: "Half Day", label: "Half Day" },
    { value: "Less than Half Day", label: "Less than Half Day" },
    { value: "Check In Only", label: "Check In Only" },
    { value: "Weekend", label: "Weekend" }
  ];
  
  // Overtime options for dropdown
  const overtimeOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Has Overtime" },
    { value: "false", label: "No Overtime" }
  ];
  
  return (
    <Box mt={3} mb={3}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        {/* <TextField
          value={value}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Search..."
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.disabled" }} />,
          }}
          sx={{
            maxWidth: 400,
            width: "100%",
          }}
        /> */}
        
        <Button 
          variant="outlined" 
          startIcon={<FilterList />}
          onClick={onFilterClick}
        >
          Filters
        </Button>
      </Box>
      
      <Collapse in={filterOpen}>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={dateRange.startDate}
              onChange={onDateChange("startDate")}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={dateRange.endDate}
              onChange={onDateChange("endDate")}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Autocomplete
              options={employees || []}
              getOptionLabel={(option) => `${option.name} (${option.user_defined_code || option._id})`}
              renderInput={(params) => <TextField {...params} label="Employee" />}
              value={employees?.find(emp => emp._id === employeeFilter) || null}
              onChange={onEmployeeFilterChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              select
              label="Status"
              fullWidth
              value={statusFilter}
              onChange={onStatusFilterChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              select
              label="Overtime"
              fullWidth
              value={hasOvertimeFilter}
              onChange={onOvertimeFilterChange}
            >
              {overtimeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
}
