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
  deleteMultipleIncentives,
} from "../request.js";
import { toast } from "react-toastify";
import useDebounce from "@/hooks/debounceHook";
import { Typography, Alert } from "@mui/material";

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
  } = useMuiTable({ defaultOrderBy: "incentiveDate" });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 1000);

  const handleSearch = (value) => {
    setSearchString(value);
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching incentives with params:", {
        search: debouncedSearchString,
        perPage: rowsPerPage,
        page,
        order,
        orderBy
      });
      
      const response = await getRecords(
        debouncedSearchString,
        rowsPerPage,
        page,
        order,
        orderBy
      );
      
      console.log("API response:", response);
      
      if (response?.success) {
        setData(response?.data || []);
        setTotalRecords(response?.totalRecords || 0);
      } else {
        setError(response?.message || "Failed to fetch incentives");
        toast.error(response?.message || "Failed to fetch incentives");
      }
    } catch (error) {
      console.error("Error fetching incentives:", error);
      setError(error?.message || "Error loading incentives");
      toast.error("Error loading incentives");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page, debouncedSearchString, order, orderBy]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      if (response.success) {
        toast.success(response.message || "Incentive deleted successfully");
        await fetchList();
      } else {
        toast.error(response.message || "Failed to delete incentive");
      }
    } catch (error) {
      console.error("Error deleting incentive:", error);
      toast.error("Error deleting incentive");
    }
  };

  const handleMultipleDelete = async () => {
    try {
      const response = await deleteMultipleIncentives(selected);
      if (response.success) {
        toast.success(response.message || "Incentives deleted successfully");
        await fetchList();
        handleSelectAllRows([])();
      } else {
        toast.error(response.message || "Failed to delete incentives");
      }
    } catch (error) {
      console.error("Error deleting multiple incentives:", error);
      toast.error("Error deleting incentives");
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
                value={searchString}
                onChange={(e) => handleSearch(e.target.value)}
                createRoute="/create-other-incentive"
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
        </>
      )}
    </>
  );
}
