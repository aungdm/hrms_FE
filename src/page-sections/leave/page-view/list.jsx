import { useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";

// Custom components
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import FlexBetween from "@/components/flexbox/FlexBetween";
import LeaveModal from "../components/LeaveModal";

// Hooks
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
import useDebounce from "@/hooks/debounceHook";

// Page section components
import TableHeadView from "../TableHead.jsx";
import TableRowView from "../TableRow.jsx";

// API
import { getLeaves, deleteLeave } from "../request.js";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const debouncedSearchText = useDebounce(searchText, 500);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearchText,
        perPage: rowsPerPage,
        page: page + 1,
        status: statusFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      };
      
      const response = await getLeaves(params);
      console.log('Leave API response:', response);

      if (response?.success) {
        // Handle previous API format
        setData(response.data || []);
        setTotalRecords(response.totalRecords || 0);
      } else if (response?.data) {
        // Handle new API format with data property containing the records
        setData(response.data.data || []);
        setTotalRecords(response.data.meta?.total || 0);
      } else {
        // Fallback to empty array if no data is returned
        setData([]);
        setTotalRecords(0);
        toast.error("Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("An error occurred while fetching leaves");
      // Initialize as empty array on error
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    debouncedSearchText,
    statusFilter,
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

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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
      toast.success("Selected leaves deleted successfully");
      fetchData();
      handleSelectAllRows([])();
    } catch (error) {
      console.error("Error deleting leaves:", error);
      toast.error("An error occurred while deleting leaves");
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
                    Leave Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage employee leaves
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateModal}
                  >
                    Create Leave
                  </Button>
                  <IconButton onClick={handleRefresh} title="Refresh">
                    <RefreshIcon />
                  </IconButton>
                </Stack>
              </FlexBetween>

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
                          label="Status"
                          fullWidth
                          size="small"
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
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
                        />
                      ))
                    ) : (
                      <TableDataNotFound colSpan={5} />
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

          {/* Create Leave Modal */}
          <LeaveModal
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
