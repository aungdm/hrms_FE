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

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";

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
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hasOvertimeFilter, setHasOvertimeFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf("month").format("YYYY-MM-DD"),
    endDate: moment().endOf("month").format("YYYY-MM-DD"),
  });
  const [overtimeStatusFilter, setOvertimeStatusFilter] = useState("");

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
    console.log({ key }, { value });
    setSearchString(value);
  };

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  // Date range handlers
  const handleDateChange = (field) => (e) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value,
    });
  };

  // Employee filter handler
  const handleEmployeeFilterChange = (event, newValue) => {
    setEmployeeFilter(newValue ? newValue._id : "");
  };

  // Status filter handler
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Overtime filter handler
  const handleOvertimeFilterChange = (e) => {
    setHasOvertimeFilter(e.target.value);
  };

  // Reset filters
  const handleResetFilters = () => {
    setDateRange({
      startDate: moment().startOf("month").format("YYYY-MM-DD"),
      endDate: moment().endOf("month").format("YYYY-MM-DD"),
    });
    setEmployeeFilter("");
    setStatusFilter("");
    setHasOvertimeFilter("");
    setOvertimeStatusFilter("");
    setSearchString("");
    fetchList(); // Fetch data with reset filters
  };

  // Refresh data
  const handleRefresh = () => {
    fetchList();
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
        dateRange.startDate,
        dateRange.endDate,
        employeeFilter || undefined,
        statusFilter || undefined,
        hasOvertimeFilter || undefined,
        overtimeStatusFilter || undefined
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
    debouncedSearchString,
    dateRange.startDate,
    dateRange.endDate,
    employeeFilter,
    statusFilter,
    hasOvertimeFilter,
    overtimeStatusFilter,
  ]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      console.log({ response }, "delete Service");
      if (response.success) {
        toast.success("Deleted successfully");
        await fetchList();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <>
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <Card>
            <Box p={2}>
              <HeadingArea />

              <FlexBetween justifyContent="flex-end" mb={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<FilterListIcon />}
                    onClick={toggleFilter}
                    variant={filterOpen ? "contained" : "outlined"}
                    size="small"
                  >
                    {filterOpen ? "Hide Filters" : "Show Filters"}
                  </Button>
                  <IconButton onClick={handleRefresh} title="Refresh">
                    <RefreshIcon />
                  </IconButton>
                </Stack>
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

                    <Grid item xs={12} sm={2}>
                      <Autocomplete
                        fullWidth
                        size="small"
                        options={employees}
                        getOptionLabel={(option) => option.name || ""}
                        onChange={handleEmployeeFilterChange}
                        value={employees.find(emp => emp._id === employeeFilter) || null}
                        filterOptions={(options, { inputValue }) => 
                          options.filter(option => 
                            option.name.toLowerCase().includes(inputValue.toLowerCase())
                          )
                        }
                        clearOnEscape
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Employee"
                            placeholder="Search Employee"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <TextField
                        select
                        label="Status"
                        fullWidth
                        size="small"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="Present">Present</MenuItem>
                        <MenuItem value="Absent">Absent</MenuItem>
                        <MenuItem value="Half Day">Half Day</MenuItem>
                        <MenuItem value="Day Off">Day Off</MenuItem>
                        <MenuItem value="Weekend">Weekend</MenuItem>
                        <MenuItem value="Holiday">Holiday</MenuItem>
                        <MenuItem value="Leave">Leave</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <TextField
                        select
                        label="Overtime"
                        fullWidth
                        size="small"
                        value={hasOvertimeFilter}
                        onChange={handleOvertimeFilterChange}
                      >
                        <MenuItem value="">All Records</MenuItem>
                        <MenuItem value="true">With Overtime</MenuItem>
                        <MenuItem value="false">Without Overtime</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      {hasOvertimeFilter === "true" && (
                        <TextField
                          select
                          label="Overtime Status"
                          fullWidth
                          size="small"
                          value={overtimeStatusFilter || ""}
                          onChange={(e) =>
                            setOvertimeStatusFilter(e.target.value)
                          }
                        >
                          <MenuItem value="">All Statuses</MenuItem>
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </TextField>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        onClick={fetchList}
                        sx={{ mr: 1 }}
                      >
                        Apply Filters
                      </Button>
                      <Button variant="outlined" onClick={handleResetFilters}>
                        Reset Filters
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>

            <Divider />

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
                      filteredUsers.map((row) => row.id)
                    )}
                  />

                  <TableBody>
                    {data?.length > 0 ? (
                      data.map((item) => (
                      <TableRowView
                        key={item.id}
                        data={item}
                        isSelected={isSelected(item.id)}
                        handleSelectRow={handleSelectRow}
                        handleDelete={handleDelete}
                      />
                      ))
                    ) : (
                      <TableDataNotFound colSpan={12} />
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <Box padding={1}>
              <TablePagination
                page={page}
                component="div"
                rowsPerPage={rowsPerPage}
                count={totalRecords}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[10, 20, 30, 50]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Card>
        </>
      )}
    </>
  );
}
