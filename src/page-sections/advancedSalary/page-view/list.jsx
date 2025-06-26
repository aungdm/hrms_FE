import { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table";
import useMuiTable from "@/hooks/useMuiTable";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRowView from "../TableRow.jsx";
import TableHeadView from "../TableHead.jsx";
import HeadingArea from "../HeadingArea.jsx";
import SearchArea from "../SearchArea.jsx";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import {
  deleteRecord,
  getRecords,
  deleteMultipleLoans,
} from "../request.js";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";
import { Alert, Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoanForm from "../LoanForm.jsx";

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
  } = useMuiTable({ defaultOrderBy: "requestDate" });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [processedFilter, setProcessedFilter] = useState("");
  const debouncedSearchString = useDebounce(searchString, 1000);
  
  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const handleSearch = (value) => {
    setSearchString(value);
  };
  
  const handleProcessedFilterChange = (event) => {
    setProcessedFilter(event.target.value);
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getRecords(
        debouncedSearchString,
        rowsPerPage,
        page,
        order,
        orderBy,
        null, // startDate
        null, // endDate
        null, // status
        null, // employeeId
        processedFilter // processed filter
      );
      
      if (response?.success) {
        setData(response?.data || []);
        setTotalRecords(response?.totalRecords || 0);
      } else {
        setError(response?.message || "Failed to fetch loans");
        toast.error(response?.message || "Failed to fetch loans");
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      setError(error?.message || "Error loading loans");
      toast.error("Error loading loans");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, debouncedSearchString, order, orderBy, processedFilter]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      if (response.success) {
        toast.success(response.message || "Loan deleted successfully");
        await fetchList();
      } else {
        toast.error(response.message || "Failed to delete loan");
      }
    } catch (error) {
      console.error("Error deleting loan:", error);
      toast.error("Error deleting loan");
    }
  };

  const handleMultipleDelete = async () => {
    try {
      const response = await deleteMultipleLoans(selected);
      if (response.success) {
        toast.success(response.message || "Loans deleted successfully");
        await fetchList();
        handleSelectAllRows([])();
      } else {
        toast.error(response.message || "Failed to delete loans");
      }
    } catch (error) {
      console.error("Error deleting multiple loans:", error);
      toast.error("Error deleting loans");
    }
  };
  
  // Modal handlers
  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
  };
  
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };
  
  const handleOpenEditModal = (loan) => {
    setSelectedLoan(loan);
    setOpenEditModal(true);
  };
  
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedLoan(null);
  };
  
  const handleOpenViewModal = (loan) => {
    setSelectedLoan(loan);
    setOpenViewModal(true);
  };
  
  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedLoan(null);
  };
  
  const handleFormSubmitSuccess = () => {
    fetchList();
    handleCloseCreateModal();
    handleCloseEditModal();
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
              <HeadingArea onCreateClick={handleOpenCreateModal} />
              <SearchArea
                value={searchString}
                onChange={(e) => handleSearch(e.target.value)}
                processed={processedFilter}
                onProcessedChange={handleProcessedFilterChange}
              />
            </Box>

            {error && (
              <Box px={2} mb={2}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Box>
            )}

            {selected.length > 0 && (
              <TableToolbar
                selected={selected.length}
                handleDeleteRows={handleMultipleDelete}
              />
            )}

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
                    {data.length > 0 ? (
                      data.map((item) => (
                        <TableRowView
                          key={item._id}
                          data={item}
                          isSelected={isSelected(item._id)}
                          handleSelectRow={handleSelectRow}
                          handleDelete={handleDelete}
                          onEdit={() => handleOpenEditModal(item)}
                          onView={() => handleOpenViewModal(item)}
                        />
                      ))
                    ) : (
                      <TableDataNotFound />
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
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Card>
          
          {/* Create Modal */}
          <Dialog
            open={openCreateModal}
            onClose={handleCloseCreateModal}
            maxWidth="md"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleCloseCreateModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <LoanForm 
                mode="create" 
                onSuccess={handleFormSubmitSuccess} 
                onCancel={handleCloseCreateModal} 
              />
            </DialogContent>
          </Dialog>
          
          {/* Edit Modal */}
          <Dialog
            open={openEditModal}
            onClose={handleCloseEditModal}
            maxWidth="md"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleCloseEditModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              {selectedLoan && (
                <LoanForm 
                  mode="edit" 
                  loanId={selectedLoan._id}
                  onSuccess={handleFormSubmitSuccess} 
                  onCancel={handleCloseEditModal} 
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* View Modal */}
          <Dialog
            open={openViewModal}
            onClose={handleCloseViewModal}
            maxWidth="md"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleCloseViewModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              {selectedLoan && (
                <LoanForm 
                  mode="view" 
                  loanId={selectedLoan._id}
                  onCancel={handleCloseViewModal} 
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
