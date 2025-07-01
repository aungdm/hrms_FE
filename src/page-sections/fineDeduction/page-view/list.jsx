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
  deleteMultipleDeductions,
  updateStatus,
} from "../request.js";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";

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
  } = useMuiTable({ defaultOrderBy: "deductionDate" });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");
  
  const debouncedSearch = useDebounce(search, 500);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRecords(
        rowsPerPage,
        page,
        startDate ? startDate.toISOString().split('T')[0] : null,
        endDate ? endDate.toISOString().split('T')[0] : null,
        employeeId,
        status,
        order,
        orderBy,
        debouncedSearch
      );
      
      if (response?.success) {
        setData(response?.data);
        setTotalRecords(response?.totalRecords);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch fine deductions");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, startDate, endDate, employeeId, status, order, orderBy, debouncedSearch]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      if (response.success) {
        toast.success(response.message || "Fine deduction deleted successfully");
        await fetchList();
      } else {
        toast.error(response.message || "Failed to delete fine deduction");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting fine deduction");
    }
  };

  const handleMultipleDelete = async () => {
    try {
      const response = await deleteMultipleDeductions(selected);
      if (response.success) {
        toast.success(response.message || "Fine deductions deleted successfully");
        await fetchList();
        handleSelectAllRows([])();
      } else {
        toast.error(response.message || "Failed to delete fine deductions");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting fine deductions");
    }
  };
  
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await updateStatus(id, newStatus);
      if (response.success) {
        toast.success(response.message || `Status updated to ${newStatus}`);
        await fetchList();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
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
              <HeadingArea 
                selectedIds={selected}
                handleBulkDelete={handleMultipleDelete}
              />
              <SearchArea
                search={search}
                onSearchChange={setSearch}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                employeeId={employeeId}
                onEmployeeChange={setEmployeeId}
                status={status}
                onStatusChange={setStatus}
                onFilterApply={fetchList}
              />
            </Box>

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
                    showCheckbox={true}
                  />

                  <TableBody>
                    {data?.map((item) => (
                      <TableRowView
                        key={item._id}
                        data={item}
                        isSelected={isSelected(item._id)}
                        handleSelectRow={handleSelectRow}
                        handleDelete={handleDelete}
                        handleStatusChange={handleStatusChange}
                        showCheckbox={true}
                        onRefresh={fetchList}
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
