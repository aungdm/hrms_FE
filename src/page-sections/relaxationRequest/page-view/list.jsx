import { useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";

// Material UI components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "@mui/material/Badge";
import Autocomplete from "@mui/material/Autocomplete";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";

// Custom components
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound } from "@/components/table";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import FlexBetween from "@/components/flexbox/FlexBetween";

// Hooks
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
import useDebounce from "@/hooks/debounceHook";

// Page section components
import TableHeadView from "../TableHead.jsx";
import OvertimeTableRow from "../TableRow.jsx";

// API
import { getRelaxationRequestRecords, getRelaxationRequestStatistics } from "../request.js";
import { getAllEmployees } from "@/page-sections/employee/request.js";

export default function RelaxationRequestListView() {
  const {
    page,
    rowsPerPage,
    order,
    orderBy,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useMuiTable({ defaultOrderBy: "date" });

  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Pending, 2: Approved, 3: Rejected
  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf("month").format("YYYY-MM-DD"),
    endDate: moment().endOf("month").format("YYYY-MM-DD"),
  });
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const debouncedSearchText = useDebounce(searchText, 500);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await getAllEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getRelaxationRequestRecords(
        debouncedSearchText,
        rowsPerPage,
        page,
        dateRange.startDate,
        dateRange.endDate,
        approvalFilter,
        selectedEmployee?._id // Pass employeeId for filtering
      );

      if (response?.success) {
        let filteredData = response.data;
        console.log({ filteredData }, { approvalFilter });
        setData(filteredData);
        setTotalRecords(response.totalRecords);
      } else {
        toast.error("Failed to fetch relaxation request records");
      }
    } catch (error) {
      console.error("Error fetching relaxation request records:", error);
      toast.error("An error occurred while fetching relaxation request records");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    debouncedSearchText,
    dateRange.startDate,
    dateRange.endDate,
    approvalFilter,
    selectedEmployee,
  ]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await getRelaxationRequestStatistics(
        dateRange.startDate,
        dateRange.endDate,
        selectedEmployee?._id // Pass employeeId for filtering stats
      );

      if (response?.success) {
        setStats({
          totalRequests: response.data.relaxationRequestStats.totalRecords || 0,
          pendingRequests: response.data.relaxationRequestStats.totalPendingRecords || 0,
          approvedRequests: response.data.relaxationRequestStats.totalApprovedRecords || 0,
          rejectedRequests:
            (response.data.relaxationRequestStats.totalRecords || 0) -
            (response.data.relaxationRequestStats.totalPendingRecords || 0) -
            (response.data.relaxationRequestStats.totalApprovedRecords || 0),
        });
      }
    } catch (error) {
      console.error("Error fetching relaxation request statistics:", error);
    }
  }, [dateRange.startDate, dateRange.endDate, selectedEmployee]);

  useEffect(() => {
    if (tabValue === 0) {
      setApprovalFilter("All");
    } else if (tabValue === 1) {
      setApprovalFilter("Pending");
    } else if (tabValue === 2) {
      setApprovalFilter("Approved");
    } else if (tabValue === 3) {
      setApprovalFilter("Rejected");
    }
  }, [tabValue]);

  // Initial load
  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  // Filter data
  const filteredRecords = stableSort(data, getComparator(order, orderBy));

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleDateChange = (field) => (e) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value,
    });
  };

  const handleApprovalFilterChange = (e) => {
    console.log(e.target.value);
    setApprovalFilter(e.target.value);
  };

  const handleEmployeeChange = (event, newValue) => {
    setSelectedEmployee(newValue);
  };

  const handleRefresh = () => {
    fetchData();
    fetchStats();
  };

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset to first page when changing tabs
    handleChangePage(null, 0);
  };

  return (
    <>
      {loading && data.length === 0 ? (
        <TableSkeleton />
      ) : (
        <>
          <Card>
            <Box p={3}>
              <FlexBetween mb={3}>
                <Stack spacing={1}>
                  <Typography variant="h5" fontWeight={600}>
                  Relaxation Request
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage employee relaxation requests
                  </Typography>
                </Stack>

                <IconButton onClick={handleRefresh} title="Refresh">
                  <RefreshIcon />
                </IconButton>
              </FlexBetween>

              {/* Statistics cards */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ p: 2, bgcolor: "#f0f7ff" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Requests
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {stats.totalRequests}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card sx={{ p: 2, bgcolor: "#fff8e1" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pending Approval
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      color="warning.main"
                    >
                      {stats.pendingRequests}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card sx={{ p: 2, bgcolor: "#f0f9f0" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Approved
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      color="success.main"
                    >
                      {stats.approvedRequests}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabs for filtering by approval status */}
              <Box mb={3}>
                <Card sx={{ p: 0, overflow: "hidden" }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                      borderBottom: 1,
                      borderColor: "divider",
                      "& .MuiTabs-indicator": {
                        height: 3,
                      },
                    }}
                  >
                    <Tab
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>All</Typography>
                          <Badge
                            badgeContent={stats.totalRequests}
                            color="primary"
                          />
                        </Stack>
                      }
                      sx={{ py: 2 }}
                    />
                    <Tab
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>Pending</Typography>
                          <Badge
                            badgeContent={stats.pendingRequests}
                            color="warning"
                          />
                        </Stack>
                      }
                      sx={{ py: 2 }}
                    />
                    <Tab
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>Approved</Typography>
                          <Badge
                            badgeContent={stats.approvedRequests}
                            color="success"
                          />
                        </Stack>
                      }
                      sx={{ py: 2 }}
                    />
                    <Tab
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>Rejected</Typography>
                          <Badge
                            badgeContent={stats.rejectedRequests}
                            color="error"
                          />
                        </Stack>
                      }
                      sx={{ py: 2 }}
                    />
                  </Tabs>
                </Card>
              </Box>

              {/* Tab status title */}
              <Box mb={3}>
                <Typography variant="h6" color="text.secondary">
                  {tabValue === 0 && "Showing All Relaxation Requests"}
                  {tabValue === 1 && "Showing Pending Relaxation Requests"}
                  {tabValue === 2 && "Showing Approved Relaxation Requests"}
                  {tabValue === 3 && "Showing Rejected Relaxation Requests"}
                </Typography>
              </Box>

              {/* Search and filter controls */}
              <Box mb={3}>
                <FlexBetween>
                  <TextField
                    placeholder="Search..."
                    value={searchText}
                    onChange={handleSearchChange}
                    size="small"
                    sx={{ width: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    startIcon={<FilterListIcon />}
                    onClick={toggleFilter}
                    variant={filterOpen ? "contained" : "outlined"}
                    size="small"
                  >
                    {filterOpen ? "Hide Filters" : "Show Filters"}
                  </Button>
                </FlexBetween>

                {filterOpen && (
                  <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Start Date"
                          type="date"
                          fullWidth
                          size="small"
                          value={dateRange.startDate}
                          onChange={handleDateChange("startDate")}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="End Date"
                          type="date"
                          fullWidth
                          size="small"
                          value={dateRange.endDate}
                          onChange={handleDateChange("endDate")}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          select
                          label="Approval Status"
                          fullWidth
                          size="small"
                          value={approvalFilter}
                          onChange={handleApprovalFilterChange}
                          disabled={tabValue !== 0} // Only enable in "All" tab
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Autocomplete
                          id="employee-filter"
                          options={employees}
                          getOptionLabel={(option) => option.name || ""}
                          value={selectedEmployee}
                          onChange={handleEmployeeChange}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label="Filter by Employee" 
                              size="small"
                              fullWidth 
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Button
                          variant="contained"
                          onClick={fetchData}
                          fullWidth
                        >
                          Apply Filters
                        </Button>
                      </Grid>

                      {selectedEmployee && (
                        <Grid item xs={12} sm={3}>
                          <Button
                            variant="outlined"
                            onClick={() => setSelectedEmployee(null)}
                            fullWidth
                          >
                            Clear Employee Filter
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider />

            <TableContainer>
              <Scrollbar>
                <Table>
                  <TableHeadView
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={data.length}
                  />

                  <TableBody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((item) => (
                        <OvertimeTableRow
                        key={item._id}
                        data={item}
                          refetchData={handleRefresh}
                        />
                      ))
                    ) : (
                      <TableDataNotFound colSpan={10} />
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

              <TablePagination
                page={page}
                component="div"
                rowsPerPage={rowsPerPage}
                count={totalRecords}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
          </Card>
        </>
      )}
    </>
  );
}
