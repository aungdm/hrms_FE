import { useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";

// Material UI components
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "@mui/material/Badge";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";

// Custom components
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import FlexBetween from "@/components/flexbox/FlexBetween";
import PunchModal from "../components/PunchModal";

// Hooks
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
import useDebounce from "@/hooks/debounceHook";

// Page section components
import TableHeadView from "../TableHead.jsx";
import TableRowView from "../TableRow.jsx";

// API
import { getPunches, deletePunch } from "../request.js";

export default function ListView() {
  const {
    page,
    rowsPerPage,
    order,
    orderBy,
    selected,
    isSelected,
    handleSelectRow,
    handleRequestSort,
    handleSelectAllRows,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useMuiTable({ defaultOrderBy: "date" });

  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [punchTypeFilter, setPunchTypeFilter] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const debouncedSearchText = useDebounce(searchText, 500);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Determine status based on selected tab
      let statusFilter;
      switch (tabValue) {
        case 1: statusFilter = "Pending"; break;
        case 2: statusFilter = "Approved"; break;
        case 3: statusFilter = "Rejected"; break;
        default: statusFilter = ""; // All requests
      }
      
      const params = {
        search: debouncedSearchText,
        perPage: rowsPerPage,
        page: page + 1,
        status: statusFilter || undefined,
        punchType: punchTypeFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      };
      
      const response = await getPunches(params);
      console.log('Punch API response:', response);

      if (response?.success) {
        setData(response.data || []);
        setTotalRecords(response.totalRecords || 0);
      } else {
        setData([]);
        setTotalRecords(0);
        if (!response.success) {
          toast.error("Failed to fetch punch requests");
        }
      }
    } catch (error) {
      console.error("Error fetching punch requests:", error);
      toast.error("An error occurred while fetching punch requests");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    debouncedSearchText,
    punchTypeFilter,
    tabValue,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data
  const filteredRecords = data && Array.isArray(data) ? stableSort(data, getComparator(order, orderBy)) : [];

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handlePunchTypeFilterChange = (e) => {
    setPunchTypeFilter(e.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset page to 0 when changing tabs
    handleChangePage(null, 0);
  };

  const handleDateChange = (field) => (e) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value,
    });
  };

  const handleRefresh = () => {
    fetchData();
  };

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleDeleteMultiple = async () => {
    try {
      // Implement batch delete if needed
      for (const id of selected) {
        await deletePunch(id);
      }
      toast.success("Selected punch requests deleted successfully");
      fetchData();
      handleSelectAllRows([])();
    } catch (error) {
      console.error("Error deleting punch requests:", error);
      toast.error("An error occurred while deleting punch requests");
    }
  };

  // Count by status for badges
  const counts = {
    all: data?.length || 0,
    pending: data?.filter(item => item.status === "Pending")?.length || 0,
    approved: data?.filter(item => item.status === "Approved")?.length || 0,
    rejected: data?.filter(item => item.status === "Rejected")?.length || 0
  };

  // Get status title based on active tab
  const getStatusTitle = () => {
    switch (tabValue) {
      case 0: return "Showing All Punch Requests";
      case 1: return "Showing Pending Punch Requests";
      case 2: return "Showing Approved Punch Requests";
      case 3: return "Showing Rejected Punch Requests";
      default: return "Showing Punch Requests";
    }
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
                    Punch Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submit and manage time punch requests
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateModal}
                  >
                    New Punch Request
                  </Button>
                  <IconButton onClick={handleRefresh} title="Refresh">
                    <RefreshIcon />
                  </IconButton>
                </Stack>
              </FlexBetween>

              {/* Tab navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    },
                  }}
                >
                  <Tab 
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>All</Typography>
                        <Badge badgeContent={counts.all} color="primary" />
                      </Stack>
                    } 
                  />
                  <Tab 
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Pending</Typography>
                        <Badge badgeContent={counts.pending} color="warning" />
                      </Stack>
                    } 
                  />
                  <Tab 
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Approved</Typography>
                        <Badge badgeContent={counts.approved} color="success" />
                      </Stack>
                    } 
                  />
                  <Tab 
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Rejected</Typography>
                        <Badge badgeContent={counts.rejected} color="error" />
                      </Stack>
                    } 
                  />
                </Tabs>
              </Box>

              {/* Status title */}
              <Box mb={3}>
                <Typography variant="h6" color="text.secondary">
                  {getStatusTitle()}
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
                          label="Punch Type"
                          fullWidth
                          size="small"
                          value={punchTypeFilter}
                          onChange={handlePunchTypeFilterChange}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="firstEntry">First Entry</MenuItem>
                          <MenuItem value="lastExit">Last Exit</MenuItem>
                          <MenuItem value="overtimeStart">Overtime Start</MenuItem>
                          <MenuItem value="overtimeEnd">Overtime End</MenuItem>
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

            {selected.length > 0 && (
              <TableToolbar
                selected={selected.length}
                handleDeleteRows={handleDeleteMultiple}
              />
            )}

            <TableContainer>
              <Scrollbar>
                <Table>
                  <TableHeadView
                    order={order}
                    orderBy={orderBy}
                    numSelected={selected.length}
                    rowCount={data.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllRows={handleSelectAllRows(
                      filteredRecords.map((row) => row._id)
                    )}
                  />

                  <TableBody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((item) => (
                        <TableRowView
                          key={item._id}
                          data={item}
                          isSelected={isSelected(item._id)}
                          handleSelectRow={handleSelectRow}
                          refetchList={fetchData}
                          isAdmin={true} // Set to true to show admin controls
                        />
                      ))
                    ) : (
                      <TableDataNotFound colSpan={7} />
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

          {/* Create Punch Modal */}
          <PunchModal
            open={createModalOpen}
            handleClose={handleCloseCreateModal}
            onSuccess={fetchData}
            mode="create"
          />
        </>
      )}
    </>
  );
}
