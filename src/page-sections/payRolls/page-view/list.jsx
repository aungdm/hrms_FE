import HeadingArea from "../HeadingArea.jsx";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import SearchArea from "../SearchArea.jsx";
import { useCallback, useState } from "react";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table";
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
import Table from "@mui/material/Table";
import TableHeadView from "../TableHead.jsx";
import TableBody from "@mui/material/TableBody";
import TableRowView from "../TableRow.jsx";
import { useEffect } from "react";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import {
  deletePayroll,
  getPayrolls,
  approvePayroll,
  markPayrollAsPaid,
  generatePayrollPdf
} from "../request.js";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";

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
  } = useMuiTable({ defaultOrderBy: "employeeId" });

  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    startDate: null,
    endDate: null,
    employeeId: "",
    payrollStatus: "",
    payrollType: ""
  });
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const debouncedSearchString = useDebounce(filters.search, 2000);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = filters.startDate ? filters.startDate.toISOString() : null;
      const endDate = filters.endDate ? filters.endDate.toISOString() : null;
      
      const response = await getPayrolls(
        debouncedSearchString,
        rowsPerPage,
        page + 1,
        startDate,
        endDate,
        filters.employeeId,
        filters.payrollStatus,
        filters.payrollType
      );
      
      if (response?.success) {
        setData(response?.data);
        setTotalRecords(response?.totalRecords);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching payroll data");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, debouncedSearchString, filters.startDate, filters.endDate, filters.employeeId, filters.payrollStatus, filters.payrollType]);

  const handleDelete = async (id) => {
    try {
      const response = await deletePayroll(id);
      if (response.success) {
        toast.success("Payroll deleted successfully");
        await fetchList();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting payroll");
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await approvePayroll(id);
      if (response.success) {
        toast.success("Payroll approved successfully");
        await fetchList();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error approving payroll");
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      const response = await markPayrollAsPaid(id);
      if (response.success) {
        toast.success("Payroll marked as paid successfully");
        await fetchList();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error marking payroll as paid");
    }
  };

  const handleGeneratePdf = async (id) => {
    try {
      const response = await generatePayrollPdf(id);
      if (response.success) {
        // In a real implementation, you might want to provide a download link or open the PDF in a new window
        toast.success("PDF generated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF");
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
              <SearchArea
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              
              <Stack direction="row" spacing={2} mb={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange("startDate", date)}
                    renderInput={(params) => <TextField {...params} />}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    sx={{ width: '25%' }}
                  />
                  
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange("endDate", date)}
                    renderInput={(params) => <TextField {...params} />}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    sx={{ width: '25%' }}
                  />
                </LocalizationProvider>
                
                <FormControl size="small" sx={{ width: '25%' }}>
                  <InputLabel>Payroll Status</InputLabel>
                  <Select
                    value={filters.payrollStatus}
                    label="Payroll Status"
                    onChange={(e) => handleFilterChange("payrollStatus", e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ width: '25%' }}>
                  <InputLabel>Payroll Type</InputLabel>
                  <Select
                    value={filters.payrollType}
                    label="Payroll Type"
                    onChange={(e) => handleFilterChange("payrollType", e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Hourly">Hourly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
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
                        handleApprove={handleApprove}
                        handleMarkAsPaid={handleMarkAsPaid}
                        handleGeneratePdf={handleGeneratePdf}
                      />
                    ))}

                    {data?.length === 0 && <TableDataNotFound />}
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
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Card>
        </>
      )}
    </>
  );
}
