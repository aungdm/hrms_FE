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
  getWorkSchedules,
  deleteMultipleWorkSchedules,
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
  } = useMuiTable({ defaultOrderBy: "name" });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 2000);
  
  const handleSearch = (key, value) => {
    setSearchString(value);
  };

  const filteredSchedules = stableSort(data, getComparator(order, orderBy));

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getWorkSchedules(
        debouncedSearchString,
        rowsPerPage,
        page
      );
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
  }, [rowsPerPage, page, debouncedSearchString]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecord(id);
      if (response.success) {
        toast.success("Work schedule deleted successfully");
        await fetchList();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleMultipleDelete = async () => {
    try {
      const response = await deleteMultipleWorkSchedules(selected);
      if (response.success) {
        toast.success("Work schedules deleted successfully");
        fetchList();
        handleSelectAllRows([])();
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
              <SearchArea
                value={searchString}
                gridRoute="/dashboard/workSchedule-grid"
                listRoute="/dashboard/workSchedule-list"
                onChange={(e) => handleSearch("search", e.target.value)}
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
                      filteredSchedules.map((row) => row._id)
                    )}
                  />

                  <TableBody>
                    {filteredSchedules.map((item) => (
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
