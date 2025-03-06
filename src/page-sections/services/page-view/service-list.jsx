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
import ServiceTableHead from "../ServiceTableHead.jsx";
import TableBody from "@mui/material/TableBody";
import ServiceTableRow from "../ServiceTableRow.jsx";
import { useEffect } from "react";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import {
  deleteService,
  getServices,
  deleteMultipleService,
} from "../request.js";
import { toast } from "react-toastify";

export default function ServiceList() {
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

  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState({ role: "", search: "" });
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const handleChangeFilter = (key, value) => {
    setUserFilter((state) => ({
      ...state,
      [key]: value,
    }));
  };

  const filteredUsers = stableSort(users, getComparator(order, orderBy)).filter(
    (item) => {
      if (userFilter.role) return item.role.toLowerCase() === userFilter.role;
      else if (userFilter.search)
        return item.name
          .toLowerCase()
          .includes(userFilter.search.toLowerCase());
      else return true;
    }
  );

  const handleDeleteUser = (id) => {
    setUsers((state) => state.filter((item) => item.id !== id));
  };

  const handleAllUserDelete = () => {
    setUsers((state) => state.filter((item) => !selected.includes(item.id)));
    handleSelectAllRows([])();
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getServices("", rowsPerPage, page);
      console.log(response);
      if (response.success) {
        setUsers(response.data);
        console.log(response.data, "response.data bookings");
        setTotalRecords(response.totalRecords);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, page]);

  const handleDeleteService = async (id) => {
    try {
      const response = await deleteService(id);
      console.log({ response }, "delete Service");
      if (response.success) {
        toast.success("Service deleted successfully");
        await fetchList();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleMultipleDeleteService = async () => {
    try {
      const response = await deleteMultipleService(selected);
      console.log({ response }, "delete Service");
      if (response.success) {
        console.log({ response }, "inner delete Service");

        toast.success("Services deleted successfully");
        fetchList();
        console.log({ response }, "inner second delete Service");
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
                value={userFilter.search}
                gridRoute="/dashboard/user-grid"
                listRoute="/dashboard/services-list"
                onChange={(e) => handleChangeFilter("search", e.target.value)}
              />
            </Box>

            {selected.length > 0 && (
              <TableToolbar
                selected={selected.length}
                handleDeleteRows={handleMultipleDeleteService}
              />
            )}

            <TableContainer>
              <Scrollbar autoHide={false}>
                <Table>
                  <ServiceTableHead
                    order={order}
                    orderBy={orderBy}
                    numSelected={selected.length}
                    rowCount={users.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllRows={handleSelectAllRows(
                      filteredUsers.map((row) => row.id)
                    )}
                  />

                  <TableBody>
                    {users
                      // .slice(
                      //   page * rowsPerPage,
                      //   page * rowsPerPage + rowsPerPage
                      // )
                      .map((user) => (
                        <ServiceTableRow
                          key={user.id}
                          user={user}
                          isSelected={isSelected(user.id)}
                          handleSelectRow={handleSelectRow}
                          handleDeleteService={handleDeleteService}
                        />
                      ))}

                    {users.length === 0 && <TableDataNotFound />}
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
