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
import Table from "@mui/material/Table";
import TableHeadView from "../TableHead.jsx";
import TableBody from "@mui/material/TableBody";
import TableRowView from "../TableRow.jsx";
import { useEffect } from "react";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import {
  deleteRecord,
  getRecords,
  getMachinesInfo
} from "../request.js";
import { getAllEmployees } from "@/page-sections/employee/request";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";
import { Button, Chip, Grid, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { forceSyncRecords } from "../request.js";

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
  } = useMuiTable({ defaultOrderBy: "recordTime" });

  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    employeeId: "",
    deviceId: "",
    processed: ""
  });
  
  const debouncedSearchString = useDebounce(searchString, 500);

  const handleSearch = (e) => {
    setSearchString(e.target.value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    handleChangePage(null, 0);
  };

  const handleDateRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleEmployeeChange = (value) => {
    setFilters(prev => ({
      ...prev,
      employeeId: value
    }));
  };

  const handleDeviceChange = (value) => {
    setFilters(prev => ({
      ...prev,
      deviceId: value
    }));
  };

  const handleProcessedChange = (value) => {
    setFilters(prev => ({
      ...prev,
      processed: value
    }));
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      
      // Make a copy of filters to avoid modifying the state directly
      const filterParams = { ...filters };
      
      // Ensure processed is empty string (not false) if not explicitly set
      if (filterParams.processed === false) {
        filterParams.processed = "";
      }
      
      console.log("Fetching with processed filter:", filterParams.processed);
      
      const response = await getRecords(
        rowsPerPage,
        page,
        filterParams.startDate,
        filterParams.endDate,
        filterParams.employeeId,
        filterParams.processed,
        filterParams.deviceId,
        debouncedSearchString
      );
      
      if (response?.success) {
        setData(response?.data);
        setTotalRecords(response?.meta?.total);
      }
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      toast.error("Failed to fetch attendance logs");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, filters, debouncedSearchString]);

  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployees();
      if (response?.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await getMachinesInfo();
      if (response?.success) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      if (response.success) {
        toast.success("Record deleted successfully");
        await fetchList();
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleSyncRecords = async () => {
    try {
      setSyncLoading(true);
      const response = await forceSyncRecords();
      
      if (response.success) {
        toast.success("Attendance logs synced successfully");
        await fetchList();
      } else {
        toast.error("Failed to sync attendance logs");
      }
    } catch (error) {
      console.error("Error syncing records:", error);
      toast.error("Failed to sync attendance logs");
    } finally {
      setSyncLoading(false);
    }
  };

  // Display active filters as chips
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.startDate) {
      activeFilters.push({ key: 'startDate', label: `From: ${filters.startDate}` });
    }
    
    if (filters.endDate) {
      activeFilters.push({ key: 'endDate', label: `To: ${filters.endDate}` });
    }
    
    if (filters.employeeId) {
      // Find employee by ID or user_defined_code
      const employee = employees.find(
        e => e._id === filters.employeeId || e.user_defined_code === filters.employeeId
      );
      const employeeName = employee ? employee.name : filters.employeeId;
      activeFilters.push({ key: 'employeeId', label: `Employee: ${employeeName}` });
    }
    
    if (filters.deviceId) {
      const deviceName = devices.find(d => d.ip === filters.deviceId)?.name || filters.deviceId;
      activeFilters.push({ key: 'deviceId', label: `Device: ${deviceName}` });
    }
    
    if (filters.processed) {
      activeFilters.push({ key: 'processed', label: `Status: ${filters.processed === 'true' ? 'Processed' : 'Not Processed'}` });
    }
    
    if (activeFilters.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
          Active Filters:
        </Typography>
        {activeFilters.map(filter => (
          <Chip
            key={filter.key}
            label={filter.label}
            size="small"
            onDelete={() => {
              setFilters(prev => ({
                ...prev,
                [filter.key]: filter.key.includes('Date') ? null : ''
              }));
            }}
          />
        ))}
      </Box>
    );
  };

  // Reset all filters to their default empty state
  const resetAllFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      employeeId: "",
      deviceId: "",
      processed: ""
    });
  };

  useEffect(() => {
    console.log("Fetching attendance logs with filters:", filters);
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchEmployees();
    fetchDevices();
    
    // Reset all filters when component mounts to ensure no default filtering
    resetAllFilters();
    console.log("Component mounted - reset all filters");
  }, []);

  return (
    <>
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <Card>
            <Box p={2}>
              <HeadingArea />
              <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                <Grid item>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleSyncRecords}
                    disabled={syncLoading}
                  >
                    {syncLoading ? "Syncing..." : "Sync Logs"}
                  </Button>
                </Grid>
              </Grid>
              
              <SearchArea
                value={searchString}
                onChange={handleSearch}
                onFilterChange={handleFilterChange}
                onDateRangeChange={handleDateRangeChange}
                onEmployeeChange={handleEmployeeChange}
                onDeviceChange={handleDeviceChange}
                onProcessedChange={handleProcessedChange}
                employees={employees}
                devices={devices}
                filters={filters}
              />
              
              {renderActiveFilters()}
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
