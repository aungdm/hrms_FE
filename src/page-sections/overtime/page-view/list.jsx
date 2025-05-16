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
import { getOvertimeRecords, getOvertimeStatistics } from "../request.js";

export default function OvertimeListView() {
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
    totalOvertime: 0,
    pendingOvertime: 0,
    approvedOvertime: 0,
    rejectedOvertime: 0,
  });

  const debouncedSearchText = useDebounce(searchText, 500);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let approvalStatus;

      const response = await getOvertimeRecords(
        debouncedSearchText,
        rowsPerPage,
        page,
        dateRange.startDate,
        dateRange.endDate,
        approvalFilter,
        // employeeId
        // approvalStatus
      );

      if (response?.success) {
        // If on rejected tab, filter for rejected records
        let filteredData = response.data;

        console.log({ filteredData }, { approvalFilter });
        setData(filteredData);
        setTotalRecords(response.totalRecords);
      } else {
        toast.error("Failed to fetch overtime records");
      }
    } catch (error) {
      console.error("Error fetching overtime records:", error);
      toast.error("An error occurred while fetching overtime records");
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
    // tabValue,
  ]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await getOvertimeStatistics(
        dateRange.startDate,
        dateRange.endDate
      );

      if (response?.success) {
        setStats({
          totalOvertime: response.data.overtimeStats.totalOvertimeRecords || 0,
          pendingOvertime:
            response.data.overtimeStats.totalPendingOvertimeRecords || 0,
          approvedOvertime:
            response.data.overtimeStats.totalApprovedOvertimeRecords || 0,
          rejectedOvertime:
            response.data.overtimeStats.totalOvertimeRecords -
            (response.data.overtimeStats.totalPendingOvertimeRecords || 0) -
            (response.data.overtimeStats.totalApprovedOvertimeRecords || 0),
        });
      }
    } catch (error) {
      console.error("Error fetching overtime statistics:", error);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (tabValue === 0) {
      setApprovalFilter("All");
    } else if (tabValue === 1) {
      setApprovalFilter("Pending");
    } else if (tabValue === 2) {
      setApprovalFilter("Approved");
    } else if (tabValue === 3) {
      // For rejected tab, we keep approval filter as "all" since
      // rejected status is filtered in fetchData function
      setApprovalFilter("Rejected");
    }
  }, [tabValue]);

  // Initial load
  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  // Update approval filter when tab changes

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
    // Reset approval filter when changing tabs
    // setApprovalFilter("all");
    // Fetch data will be called via the useEffect dependency
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
                    Overtime Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage employee overtime requests
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
                      Total Overtime
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {stats.totalOvertime}
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
                      {stats.pendingOvertime}
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
                      {stats.approvedOvertime}
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
                            badgeContent={stats.totalOvertime}
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
                            badgeContent={stats.pendingOvertime}
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
                            badgeContent={stats.approvedOvertime}
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
                            badgeContent={stats.rejectedOvertime}
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
                  {tabValue === 0 && "Showing All Overtime Requests"}
                  {tabValue === 1 && "Showing Pending Overtime Requests"}
                  {tabValue === 2 && "Showing Approved Overtime Requests"}
                  {tabValue === 3 && "Showing Rejected Overtime Requests"}
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
                        <Button
                          variant="contained"
                          onClick={fetchData}
                          fullWidth
                        >
                          Apply Filters
                        </Button>
                      </Grid>
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
