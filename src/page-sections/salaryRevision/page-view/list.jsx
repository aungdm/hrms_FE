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
  updateSalary,
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
  const [userFilter, setUserFilter] = useState({ role: "", search: "" });
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 2000);
  console.log({ debouncedSearchString });

  const handleSearch = (key, value) => {
    console.log({ key }, { value });
    setSearchString(value);
    // setUserFilter((state) => ({
    //   ...state,
    //   [key]: value,
    // }));
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

  // const handleDeleteUser = (id) => {

  //   // setData((state) => state.filter((item) => item.id !== id));
  // };

  // const handleAllUserDelete = () => {
  //   setData((state) => state.filter((item) => !selected.includes(item.id)));
  //   handleSelectAllRows([])();
  // };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRecords(
        debouncedSearchString,
        rowsPerPage,
        page
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
  }, [rowsPerPage, page, debouncedSearchString]);

  const handleDelete = async (id, employeeId, previousSalary) => {
    try {
      const response = await deleteRecord(id);
      const salaryData = await updateSalary(employeeId, {
        after_probation_gross_salary: previousSalary,
      });
      console.log({ salaryData });
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

  // const handleMultipleDeleteService = async () => {
  //   try {
  //     const response = await deleteMultipleService(selected);
  //     console.log({ response }, "delete Service");
  //     if (response.success) {
  //       console.log({ response }, "inner delete Service");

  //       toast.success("Services deleted successfully");
  //       fetchList();
  //       console.log({ response }, "inner second delete Service");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // };

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
                gridRoute="/dashboard/user-grid"
                listRoute="/dashboard/services-list"
                onChange={(e) => handleSearch("search", e.target.value)}
              />
            </Box>

            {/* {selected.length > 0 && (
              <TableToolbar
                selected={selected.length}
                handleDeleteRows={handleMultipleDeleteService}
              />
            )} */}

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
                    {data?.map((item) => (
                      <TableRowView
                        key={item.id}
                        data={item}
                        isSelected={isSelected(item.id)}
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
