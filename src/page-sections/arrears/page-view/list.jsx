import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Typography } from "@mui/material";
import SearchArea from "../SearchArea";
import TableRowView from "../TableRow";
import TableHeadView from "../TableHead";
import HeadingArea from "../HeadingArea";
import { deleteRecord, getRecords, getAllEmployees } from "../request";
import useDebounce from "@/hooks/debounceHook";
import { toast } from "react-toastify";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { format } from "date-fns";

export default function ListView() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("deductionDate");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: "",
    employeeId: null,
    processed: ""
  });

  const debouncedSearch = useDebounce(search, 500);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      // Prepare filter parameters
      const employeeId = filters.employeeId?._id || "";
      const startDate = filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : "";
      const endDate = filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : "";
      const status = filters.status || "";
      const processed = filters.processed || "";
      
      const result = await getRecords(
        debouncedSearch,
        rowsPerPage,
        page,
        order,
        orderBy,
        startDate,
        endDate,
        status,
        employeeId,
        processed
      );
      
      if (result.success) {
        setRecords(result.data);
        setTotalRecords(result.totalRecords);
      } else {
        toast.error(result.message || "Failed to fetch records");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const result = await getAllEmployees();
      if (result.success) {
        setEmployees(result.data || []);
      } else {
        console.error("Failed to fetch employees:", result.message);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, rowsPerPage, order, orderBy, debouncedSearch, filters]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllRows = (event) => {
    if (event.target.checked) {
      const newSelectedIds = records.map((n) => n._id);
      setSelectedIds(newSelectedIds);
      return;
    }
    setSelectedIds([]);
  };

  const handleSelectRow = (event, id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelectedIds = [];

    if (selectedIndex === -1) {
      newSelectedIds = [...selectedIds, id];
    } else if (selectedIndex === 0) {
      newSelectedIds = [...selectedIds.slice(1)];
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelectedIds = [...selectedIds.slice(0, -1)];
    } else if (selectedIndex > 0) {
      newSelectedIds = [
        ...selectedIds.slice(0, selectedIndex),
        ...selectedIds.slice(selectedIndex + 1),
      ];
    }
    setSelectedIds(newSelectedIds);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    
    try {
      setLoading(true);
      const result = await deleteRecord(recordToDelete);
      
      if (result.success) {
        toast.success(result.message || "Record deleted successfully");
        fetchRecords();
        setSelectedIds(selectedIds.filter(id => id !== recordToDelete));
      } else {
        toast.error(result.message || "Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Error deleting record");
    } finally {
      setLoading(false);
      setConfirmDialog(false);
      setRecordToDelete(null);
    }
  };

  const handleDelete = (id) => {
    setRecordToDelete(id);
    setConfirmDialog(true);
  };

  const isSelected = (id) => selectedIds.indexOf(id) !== -1;

  // Render active filters as chips
  const renderFilterChips = () => {
    const activeFilters = [];
    
    if (filters.startDate) {
      activeFilters.push(
        <Chip 
          key="startDate" 
          label={`From: ${format(filters.startDate, "dd MMM yyyy")}`} 
          onDelete={() => handleFilterChange("startDate", null)}
          size="small"
          sx={{ mr: 1 }}
        />
      );
    }
    
    if (filters.endDate) {
      activeFilters.push(
        <Chip 
          key="endDate" 
          label={`To: ${format(filters.endDate, "dd MMM yyyy")}`} 
          onDelete={() => handleFilterChange("endDate", null)}
          size="small"
          sx={{ mr: 1 }}
        />
      );
    }
    
    if (filters.status) {
      activeFilters.push(
        <Chip 
          key="status" 
          label={`Status: ${filters.status}`} 
          onDelete={() => handleFilterChange("status", "")}
          size="small"
          sx={{ mr: 1 }}
        />
      );
    }
    
    if (filters.employeeId) {
      activeFilters.push(
        <Chip 
          key="employee" 
          label={`Employee: ${filters.employeeId.name}`} 
          onDelete={() => handleFilterChange("employeeId", null)}
          size="small"
          sx={{ mr: 1 }}
        />
      );
    }
    
    if (filters.processed) {
      activeFilters.push(
        <Chip 
          key="processed" 
          label={`${filters.processed === "true" ? "Processed" : "Not Processed"}`} 
          onDelete={() => handleFilterChange("processed", "")}
          size="small"
          sx={{ mr: 1 }}
        />
      );
    }
    
    return activeFilters.length > 0 ? (
      <Box sx={{ mt: 2, mb: 1 }}>
        {activeFilters}
      </Box>
    ) : null;
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
    setPage(0);
  };

  return (
    <Fragment>
      <Box pt={2} pb={4}>
        <HeadingArea />

        <SearchArea 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          onFilterChange={handleFilterChange}
          filters={filters}
          employees={employees}
        />

        {renderFilterChips()}

        <Card>
          <TableContainer>
            <Table>
              <TableHeadView
                order={order}
                orderBy={orderBy}
                numSelected={selectedIds.length}
                rowCount={records.length}
                onSelectAllRows={handleSelectAllRows}
                onRequestSort={handleRequestSort}
              />

              <TableBody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                      <CircularProgress />
                    </td>
                  </tr>
                ) : records.length > 0 ? (
                  records.map((record) => (
                    <TableRowView
                      key={record._id}
                      data={record}
                      isSelected={isSelected(record._id)}
                      handleSelectRow={handleSelectRow}
                      handleDelete={handleDelete}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Typography variant="body1" color="text.secondary">
                        No records found
                      </Typography>
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
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
      </Box>

      <Dialog
        open={confirmDialog}
        onClose={() => {
          setConfirmDialog(false);
          setRecordToDelete(null);
        }}
      >
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setConfirmDialog(false);
              setRecordToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            autoFocus
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
