import HeadingArea from "../HeadingArea.jsx";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import SearchArea from "../SearchArea.jsx";
import { useCallback, useState } from "react";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination"; // CUSTOM COMPONENTS
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table"; // CUSTOM PAGE SECTION COMPONENTS

import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable"; // CUSTOM DUMMY DATA
import { USER_LIST } from "@/__fakeData__/users";
import Table from "@mui/material/Table";
import TableHeadView from "../TableHead.jsx";
import TableBody from "@mui/material/TableBody";
import TableRowView from "../TableRow.jsx";
import { useEffect } from "react";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import {
  deleteRecord,
  getRecords,
  deleteMultipleService,
  getAllEmployees,
  processMonthAttendance
} from "../request.js";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";
import moment from "moment";

// Material UI Components for filtering
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import SyncIcon from "@mui/icons-material/Sync";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

// Flexbox components
import FlexBetween from "@/components/flexbox/FlexBetween";

export default function ListView() {
  const {
    page,
    rowsPerPage,
    order,
    orderBy,
    handleSelectRow,
    handleRequestSort,
    handleSelectAllRows,
    handleChangeRowsPerPage,
    selected,
    isSelected,
    handleChangePage,
  } = useMuiTable({ defaultOrderBy: "name" });

  const [data, setData] = useState([]);
  const [userFilter, setUserFilter] = useState({ role: "", search: "" });
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 2000);

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Current applied filters (used for API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    employeeId: "",
    status: "",
    hasOvertime: "",
    overtimeStatus: "",
    startDate: moment().startOf("month").format("YYYY-MM-DD"),
    endDate: moment().endOf("month").format("YYYY-MM-DD"),
    search: ""
  });
  
  // Temporary filter values (not applied until button click)
  const [tempFilters, setTempFilters] = useState({
    employeeId: "",
    status: "",
    hasOvertime: "",
    overtimeStatus: "",
    startDate: moment().startOf("month").format("YYYY-MM-DD"),
    endDate: moment().endOf("month").format("YYYY-MM-DD"),
    search: ""
  });
  
  // Process month dialog state
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processingMonth, setProcessingMonth] = useState(false);
  const [forceReprocess, setForceReprocess] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employees for filter dropdown
  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployees();
      if (response?.success) {
        setEmployees(response.data || []);
      } else {
        console.error("Failed to fetch employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      search: value
    }));
    setSearchString(value);
  };

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  // Date range handlers
  const handleDateChange = (field) => (e) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Employee filter handler
  const handleEmployeeFilterChange = (event, newValue) => {
    setTempFilters(prev => ({
      ...prev,
      employeeId: newValue ? newValue._id : ""
    }));
  };
  
  // Selected employee for processing handler
  const handleSelectedEmployeeChange = (event, newValue) => {
    setSelectedEmployee(newValue);
  };

  // Status filter handler
  const handleStatusFilterChange = (e) => {
    setTempFilters(prev => ({
      ...prev,
      status: e.target.value
    }));
  };

  // Overtime filter handler
  const handleOvertimeFilterChange = (e) => {
    setTempFilters(prev => ({
      ...prev,
      hasOvertime: e.target.value
    }));
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    // Update applied filters with temp filter values
    setAppliedFilters({
      ...tempFilters,
      search: searchString
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    const defaultFilters = {
      employeeId: "",
      status: "",
      hasOvertime: "",
      overtimeStatus: "",
      startDate: moment().startOf("month").format("YYYY-MM-DD"),
      endDate: moment().endOf("month").format("YYYY-MM-DD"),
      search: ""
    };
    
    // Reset both temp and applied filters
    setTempFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchString("");
  };

  // Refresh data
  const handleRefresh = () => {
    fetchList();
  };
  
  // Open process month dialog
  const handleOpenProcessDialog = () => {
    setProcessDialogOpen(true);
    setForceReprocess(false);
    setSelectedEmployee(null);
  };
  
  // Close process month dialog
  const handleCloseProcessDialog = () => {
    setProcessDialogOpen(false);
  };
  
  // Process month attendance
  const handleProcessMonth = async () => {
    try {
      setProcessingMonth(true);
      
      const startDate = moment(tempFilters.startDate);
      const month = startDate.month() + 1; // Moment months are 0-indexed
      const year = startDate.year();
      
      const response = await processMonthAttendance({
        month,
        year,
        employeeId: selectedEmployee ? selectedEmployee._id : undefined,
        forceReprocess
      });
      
      if (response?.success) {
        toast.success(`Successfully processed attendance for ${month}/${year}`);
        
        // Show detailed results
        const result = response.data;
        toast.info(`Processed ${result.processed} logs, created ${result.created} records (${result.absentsCreated || 0} absent records), fixed ${result.missingDaysFixed || 0} missing days`);
        
        // Refresh the data
        fetchList();
      } else {
        toast.error('Failed to process month attendance');
      }
    } catch (error) {
      console.error('Error processing month attendance:', error);
      toast.error('Error processing month attendance');
    } finally {
      setProcessingMonth(false);
      setProcessDialogOpen(false);
    }
  };

  const filteredUsers = stableSort(data, getComparator(order, orderBy)).filter(
    (item) => {
      if (userFilter.role) return item.role.toLowerCase() === userFilter.role;
      else if (userFilter.search)
        return item.name
          .toLowerCase()
          .includes(userFilter.search.toLowerCase());
      else return true;
    }
  );

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRecords(
        rowsPerPage,
        page,
        appliedFilters.startDate,
        appliedFilters.endDate,
        appliedFilters.employeeId || undefined,
        appliedFilters.status || undefined,
        appliedFilters.hasOvertime || undefined,
        appliedFilters.overtimeStatus || undefined,
        appliedFilters.search || undefined
      );
      console.log(response, "fetchList");
      if (response?.success) {
        setData(response?.data);
        setTotalRecords(response?.totalRecords);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [
    rowsPerPage,
    page,
    appliedFilters // Now only depends on appliedFilters, not individual filter states
  ]);

  // Add the Process Month button to the filter area
  const renderFilterActions = () => (
    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FilterAltIcon />}
        onClick={handleApplyFilters}
      >
        Apply Filters
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<SyncIcon />}
        onClick={handleOpenProcessDialog}
      >
        Process Month
      </Button>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
      >
        Refresh
      </Button>
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={handleResetFilters}
      >
        Reset Filters
      </Button>
    </Stack>
  );
  
  // Process Month Dialog
  const renderProcessMonthDialog = () => (
    <Dialog
      open={processDialogOpen}
      onClose={handleCloseProcessDialog}
      aria-labelledby="process-month-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="process-month-dialog-title">
        Process Month Attendance
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          This will process attendance for the selected month and create any missing attendance records.
        </DialogContentText>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Month"
              type="month"
              fullWidth
              value={`${moment(tempFilters.startDate).format('YYYY-MM')}`}
              onChange={(e) => {
                const date = moment(e.target.value);
                setTempFilters(prev => ({
                  ...prev,
                  startDate: date.startOf('month').format('YYYY-MM-DD'),
                  endDate: date.endOf('month').format('YYYY-MM-DD')
                }));
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => `${option.name} (${option.user_defined_code || option._id})`}
              renderInput={(params) => <TextField {...params} label="Employee (optional)" />}
              value={selectedEmployee}
              onChange={handleSelectedEmployeeChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={forceReprocess}
                  onChange={(e) => setForceReprocess(e.target.checked)}
                />
              }
              label="Force reprocess (will delete existing records and reprocess all logs)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              {forceReprocess ? 
                "Warning: This will delete all existing attendance records for the selected month and reprocess them from scratch." :
                "Only missing or unprocessed records will be created. Existing records will not be modified."
              }
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseProcessDialog}>Cancel</Button>
        <Button 
          onClick={handleProcessMonth} 
          variant="contained" 
          color="primary"
          disabled={processingMonth}
        >
          {processingMonth ? "Processing..." : "Process"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Initialize data on component mount and when applied filters change
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Update search in tempFilters when debounced search changes
  useEffect(() => {
    setTempFilters(prev => ({
      ...prev,
      search: debouncedSearchString
    }));
  }, [debouncedSearchString]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      if (response?.success) {
        toast.success("Record deleted successfully");
        fetchList();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      const response = await deleteMultipleService(selected);
      if (response?.success) {
        toast.success("Records deleted successfully");
        fetchList();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <>
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <Card>
            <Box p={2}>
              <HeadingArea />
              <SearchArea
                value={searchString}
                onChange={handleSearch}
                onFilterClick={toggleFilter}
                dateRange={tempFilters}
                onDateChange={handleDateChange}
                employees={employees}
                employeeFilter={tempFilters.employeeId}
                onEmployeeFilterChange={handleEmployeeFilterChange}
                statusFilter={tempFilters.status}
                onStatusFilterChange={handleStatusFilterChange}
                hasOvertimeFilter={tempFilters.hasOvertime}
                onOvertimeFilterChange={handleOvertimeFilterChange}
                filterOpen={filterOpen}
              />
              
              {renderFilterActions()}
              {renderProcessMonthDialog()}
            </Box>

            <TableContainer>
              <Scrollbar autoHide={false}>
                <Table>
                  <TableHeadView
                    order={order}
                    orderBy={orderBy}
                    numSelected={selected.length}
                    rowCount={data.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllRows={handleSelectAllRows(
                      data.map((row) => row._id)
                    )}
                  />

                  <TableBody>
                    {data?.map((item) => (
                      <TableRowView
                        key={item._id}
                        data={item}
                        isSelected={isSelected(item._id)}
                        handleSelectRow={handleSelectRow}
                        handleDelete={handleDelete}
                      />
                    ))}

                    {data?.length === 0 && <TableDataNotFound />}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <Box padding={2}>
              <TablePagination
                page={page}
                component="div"
                rowsPerPage={rowsPerPage}
                count={totalRecords}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Card>
        </>
      )}
    </>
  );
}
