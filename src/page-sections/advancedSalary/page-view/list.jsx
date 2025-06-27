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
  deleteMultipleAdvancedSalaries,
  get,
} from "../request.js";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";
import { Alert, Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AdvancedSalaryForm from "../AdvancedSalaryForm.jsx";
import ApprovalForm from "../ApprovalForm.jsx";
import RejectionForm from "../RejectionForm.jsx";

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
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [selectedAdvancedSalary, setSelectedAdvancedSalary] = useState(null);

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
        setError(response?.message || "Failed to fetch advanced salaries");
        toast.error(response?.message || "Failed to fetch advanced salaries");
      }
    } catch (error) {
      console.error("Error fetching advanced salaries:", error);
      setError(error?.message || "Error loading advanced salaries");
      toast.error("Error loading advanced salaries");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, debouncedSearchString, order, orderBy, processedFilter]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      if (response.success) {
        toast.success(response.message || "Advanced salary deleted successfully");
        await fetchList();
      } else {
        toast.error(response.message || "Failed to delete advanced salary");
      }
    } catch (error) {
      console.error("Error deleting advanced salary:", error);
      toast.error("Error deleting advanced salary");
    }
  };

  const handleMultipleDelete = async () => {
    try {
      const response = await deleteMultipleAdvancedSalaries(selected);
      if (response.success) {
        toast.success(response.message || "Advanced salaries deleted successfully");
        await fetchList();
        handleSelectAllRows([])();
      } else {
        toast.error(response.message || "Failed to delete advanced salaries");
      }
    } catch (error) {
      console.error("Error deleting multiple advanced salaries:", error);
      toast.error("Error deleting advanced salaries");
    }
  };
  
  // Modal handlers
  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
  };
  
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };
  
  const handleOpenEditModal = (advancedSalary) => {
    setSelectedAdvancedSalary(advancedSalary);
    setOpenEditModal(true);
  };
  
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedAdvancedSalary(null);
  };
  
  const handleOpenViewModal = (advancedSalary) => {
    setSelectedAdvancedSalary(advancedSalary);
    setOpenViewModal(true);
  };
  
  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedAdvancedSalary(null);
  };
  
  const handleOpenApproveModal = async (advancedSalary) => {
    try {
      // Fetch complete data for the advanced salary to ensure we have all details
      const response = await get(advancedSalary._id);
      if (response.success) {
        setSelectedAdvancedSalary(response.data);
        setOpenApproveModal(true);
      } else {
        toast.error("Failed to load advanced salary details");
      }
    } catch (error) {
      console.error("Error fetching advanced salary details:", error);
      toast.error("Error loading advanced salary details");
    }
  };
  
  const handleCloseApproveModal = () => {
    setOpenApproveModal(false);
    setSelectedAdvancedSalary(null);
  };
  
  const handleOpenRejectModal = async (advancedSalary) => {
    try {
      // Fetch complete data for the advanced salary to ensure we have all details
      const response = await get(advancedSalary._id);
      if (response.success) {
        setSelectedAdvancedSalary(response.data);
        setOpenRejectModal(true);
      } else {
        toast.error("Failed to load advanced salary details");
      }
    } catch (error) {
      console.error("Error fetching advanced salary details:", error);
      toast.error("Error loading advanced salary details");
    }
  };
  
  const handleCloseRejectModal = () => {
    setOpenRejectModal(false);
    setSelectedAdvancedSalary(null);
  };
  
  const handleFormSubmitSuccess = () => {
    fetchList();
    handleCloseCreateModal();
    handleCloseEditModal();
    handleCloseApproveModal();
    handleCloseRejectModal();
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
                          onApprove={() => handleOpenApproveModal(item)}
                          onReject={() => handleOpenRejectModal(item)}
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
              <AdvancedSalaryForm 
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
              {selectedAdvancedSalary && (
                <AdvancedSalaryForm 
                  mode="edit" 
                  loanId={selectedAdvancedSalary._id}
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
              {selectedAdvancedSalary && (
                <AdvancedSalaryForm 
                  mode="view" 
                  loanId={selectedAdvancedSalary._id}
                  onCancel={handleCloseViewModal} 
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Approve Modal */}
          <Dialog
            open={openApproveModal}
            onClose={handleCloseApproveModal}
            maxWidth="sm"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleCloseApproveModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              {selectedAdvancedSalary && (
                <ApprovalForm 
                  advancedSalaryData={selectedAdvancedSalary}
                  onSuccess={handleFormSubmitSuccess} 
                  onCancel={handleCloseApproveModal} 
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Reject Modal */}
          <Dialog
            open={openRejectModal}
            onClose={handleCloseRejectModal}
            maxWidth="sm"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleCloseRejectModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              {selectedAdvancedSalary && (
                <RejectionForm 
                  advancedSalaryData={selectedAdvancedSalary}
                  onSuccess={handleFormSubmitSuccess} 
                  onCancel={handleCloseRejectModal} 
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
