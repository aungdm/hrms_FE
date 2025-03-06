import { useState, useEffect } from "react"; // MUI

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination"; // CUSTOM COMPONENTS

import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table"; // CUSTOM PAGE SECTION COMPONENTS

import SearchArea from "../SearchArea";
import HeadingArea from "../HeadingArea";
import UserTableRow from "../UserTableRow";
import UserTableHead from "../UserTableHead"; // CUSTOM DEFINED HOOK
import useDebounce from "@/hooks/debounceHook";
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable"; // CUSTOM DUMMY DATA

import { USER_LIST } from "@/__fakeData__/users";
import { getData, deleteUser, deleteMultipleUser } from "../request";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";
import { toast } from "react-toastify";
import { useCallback } from "react";

export default function UserList1PageView() {
  const [users, setUsers] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [initialUsers, setInitialUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [role, setRole] = useState("customer");
  const debouncedSearchString = useDebounce(searchString, 2000);

  const [userFilter, setUserFilter] = useState({
    role: "customer",
    search: "",
  });
  const [loading, setLoading] = useState(false);

  const {
    page,
    order,
    orderBy,
    selected,
    isSelected,
    rowsPerPage,
    handleSelectRow,
    handleChangePage,
    handleRequestSort,
    handleSelectAllRows,
    handleChangeRowsPerPage,
  } = useMuiTable({
    defaultOrderBy: "name",
  });

  const handleChangeFilter = useCallback(
    (key, value) => {
      console.log(value, "valueeeee");
      setUserFilter((state) => ({ ...state, [key]: value }));
      fetchList(value);
      // const response = initialUsers.filter((item) => {
      //   return item?.roles[0]?.name == value;
      // });
      // console.log({ response }, "handleChangeFilter");

      // setUsers(response);
    },
    [role, page]
  );

  const handleSearch = (e) => {
    console.log(e.target.value, "eeeeee");
    setSearchString(e.target.value);
  };

  const handleChangeTab = (_, newValue) => {
    setRole(newValue);
    handleChangeFilter("role", newValue);
    fetchList(rowsPerPage, newValue);
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await deleteUser(id);
      console.log({ response }, "delete user");
      if (response.success) {
        toast.success("User deleted successfully");
        fetchList();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleAllUserDelete = () => {
    setUsers((state) => state.filter((item) => !selected.includes(item.id)));
    handleSelectAllRows([])();
  };

  const fetchList = useCallback(
    async (role) => {
      console.log(
        { role },
        "fetchList fetchList fetchList fetchList fetchList"
      );
      try {
        setLoading(true);
        const response = await getData(
          page,
          rowsPerPage,
          debouncedSearchString,
          role
        );
        console.log(response);
        if (response.success) {
          // setInitialUsers(response.data);
          setUsers(response.data);
          setTotalRecords(response.totalRecords);
        }
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [rowsPerPage, page, debouncedSearchString, role]
  );

  const handleMultipleDeleteService = async () => {
    try {
      const response = await deleteMultipleUser(selected);
      console.log({ response }, "delete user");
      if (response.success) {
        console.log({ response }, "inner delete user");

        toast.success("Users deleted successfully");
        fetchList();
        console.log({ response }, "inner second delete user");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    fetchList(role);
  }, [fetchList]);

  return (
    <>
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="pt-2 pb-4">
          <Card>
            <Box px={2} pt={2}>
              <HeadingArea
                value={userFilter.role}
                changeTab={handleChangeTab}
              />

              <SearchArea
                value={searchString}
                gridRoute="/dashboard/user-grid"
                listRoute="/dashboard/user-list"
                onChange={(e) => handleSearch(e)}
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
                  <UserTableHead
                    order={order}
                    orderBy={orderBy}
                    numSelected={selected.length}
                    rowCount={users.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllRows={handleSelectAllRows(
                      users.map((row) => row.id)
                    )}
                  />

                  <TableBody>
                    {users.map((user) => (
                      <UserTableRow
                        key={user.id}
                        role={role}
                        user={user}
                        isSelected={isSelected(user.id)}
                        handleSelectRow={handleSelectRow}
                        handleDeleteUser={handleDeleteUser}
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
        </div>
      )}
    </>
  );
}
