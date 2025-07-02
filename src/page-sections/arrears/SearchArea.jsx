import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { 
  Button, 
  Card, 
  Collapse, 
  FormControl, 
  Grid, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Select, 
  Stack 
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Autocomplete from "@mui/material/Autocomplete";

export default function SearchArea(props) {
  const { 
    value = "", 
    onChange, 
    onFilterChange,
    filters = {},
    employees = [],
    createRoute = "/arrears-create" 
  } = props;
  
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange(field, value);
    }
  };

  const handleResetFilters = () => {
    if (onFilterChange) {
      // Reset all filters
      onFilterChange("startDate", null);
      onFilterChange("endDate", null);
      onFilterChange("status", "");
      onFilterChange("employeeId", null);
      onFilterChange("processed", "");
    }
  };

  return (
    <Box mt={3} mb={3}>
      <Card sx={{ p: 2, mb: 2 }}>
        <FlexBetween gap={2} flexWrap="wrap">
          <TextField
            value={value}
            onChange={onChange}
            placeholder="Search arrears..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled" }} />
                </InputAdornment>
              )
            }}
            sx={{
              maxWidth: 400,
              width: "100%"
            }}
          />

          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(createRoute)}
            >
              Create Arrears
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Stack>
        </FlexBetween>

        <Collapse in={showFilters}>
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange("startDate", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small"
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange("endDate", date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small"
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6} lg={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ""}
                    label="Status"
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6} lg={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Processed</InputLabel>
                  <Select
                    value={filters.processed || ""}
                    label="Processed"
                    onChange={(e) => handleFilterChange("processed", e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Processed</MenuItem>
                    <MenuItem value="false">Not Processed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6} lg={2}>
                <Autocomplete
                  size="small"
                  options={employees}
                  getOptionLabel={(option) => option?.name || ""}
                  value={filters.employeeId}
                  onChange={(_, newValue) => handleFilterChange("employeeId", newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Employee" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Card>
    </Box>
  );
}
