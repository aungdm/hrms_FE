import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import { useCallback, useState } from "react";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table";
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { useEffect } from "react";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import {
  getProcessingErrors,
  getMachinesInfo,
  resetProcessingErrors
} from "../request.js";
import { getAllEmployees } from "@/page-sections/employee/request";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";
import { Button, Chip, Grid, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorLogTableHead from "../ErrorLogTableHead.jsx";
import ErrorLogTableRow from "../ErrorLogTableRow.jsx";
import ErrorLogSearchArea from "../ErrorLogSearchArea.jsx";
import ErrorLogHeadingArea from "../ErrorLogHeadingArea.jsx";

export default function ErrorLogsView() {
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
    setSelected
  } = useMuiTable({ defaultOrderBy: "recordTime" });

  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    employeeId: "",
    deviceId: "",
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

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await getProcessingErrors(
        rowsPerPage,
        page,
        filters.startDate,
        filters.endDate,
        filters.employeeId,
        filters.deviceId,
        debouncedSearchString
      );
      
      if (response?.success) {
        setData(response?.data);
        setTotalRecords(response?.meta?.total);
      }
    } catch (error) {
      console.error("Error fetching processing errors:", error);
      toast.error("Failed to fetch processing errors");
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

  const handleResetSelected = async () => {
    if (selected.length === 0) {
      toast.info("No logs selected");
      return;
    }

    try {
      setResetLoading(true);
      const response = await resetProcessingErrors(selected);
      
      if (response.success) {
        toast.success(`${selected.length} log(s) reset for reprocessing`);
        setSelected([]);
        await fetchList();
      } else {
        toast.error("Failed to reset logs");
      }
    } catch (error) {
      console.error("Error resetting logs:", error);
      toast.error("Failed to reset logs");
    } finally {
      setResetLoading(false);
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
    });
    setSearchString("");
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchEmployees();
    fetchDevices();
  }, []);

  return (
    <Box py={3}>
      <Card>
        <Box p={3}>
          <ErrorLogHeadingArea onRefresh={fetchList} />
          
          <Box mt={3}>
            <ErrorLogSearchArea
              handleSearch={handleSearch}
              handleFilterChange={handleFilterChange}
              employees={employees}
              devices={devices}
            />

            {renderActiveFilters()}

            <Box>
              <TableToolbar
                title={`${totalRecords} Error Logs`}
                selected={selected.length}
                onDeleteSelected={handleResetSelected}
                deleteButtonText="Reset Selected"
                actionButtonProps={{
                  startIcon: <RefreshIcon />,
                }}
              />

              <Scrollbar>
                <TableContainer sx={{ minWidth: 800, maxHeight: 700 }}>
                  {loading ? (
                    <TableSkeleton
                      columnCount={7}
                      rowCount={rowsPerPage}
                      isCheck={true}
                    />
                  ) : (
                    <Table stickyHeader>
                      <ErrorLogTableHead
                        order={order}
                        orderBy={orderBy}
                        numSelected={selected.length}
                        rowCount={data.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllRows={(e) =>
                          handleSelectAllRows(
                            e,
                            data.map((row) => row._id)
                          )
                        }
                      />

                      <TableBody>
                        {data.length === 0 ? (
                          <TableDataNotFound col={7} />
                        ) : (
                          stableSort(data, getComparator(order, orderBy)).map(
                            (row) => (
                              <ErrorLogTableRow
                                key={row._id}
                                log={row}
                                selected={isSelected(row._id)}
                                handleSelectRow={handleSelectRow}
                                fetchList={fetchList}
                              />
                            )
                          )
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TableContainer>
              </Scrollbar>

              <TablePagination
                page={page}
                component="div"
                count={totalRecords}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
} 