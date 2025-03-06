import Box from "@mui/material/Box";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS
import { Paragraph } from "../../../components/typography/index.jsx";
import HeadingArea from "../HeadingArea.jsx";
import SearchArea from "../SearchArea.jsx";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import BookingTableHead from "../BookingTableHead.jsx";
import TableBody from "@mui/material/TableBody";
import BookingTableRow from "../BookingTableRow.jsx";
import TablePagination from "@mui/material/TablePagination";
import Card from "@mui/material/Card";
import { useEffect, useState, useCallback } from "react";
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable"; // CUSTOM DUMMY DATA
import { USER_LIST } from "@/__fakeData__/users";
import Scrollbar from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table"; // CUSTOM PAGE SECTION COMPONENTS

import { getBookings } from "../request.js";
import { useNavigate } from "react-router-dom";
import TableSkeleton from "@/components/loader/TableSkeleton.jsx";

import { utils } from "../../../utils/functionUtils.js";

export default function BookingListView() {
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

  const [filterObj, setfilterObj] = useState({ status: "", service_id: "" });
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState({ role: "", search: "" });

  const handleChangeFilter = (e) => {
    console.log(e, "eeeeee");
    const fieldName = e.target.name;
    const selectedValue = e.target.value;
    console.log(fieldName, selectedValue);
    setfilterObj({
      status: fieldName === "status" ? selectedValue : "",
      service_id: fieldName === "service_id" ? selectedValue : "",
      created_at: fieldName === "created_at" ? selectedValue : "",
    });
  };

  const filteredTableData = stableSort(
    tableData,
    getComparator(order, orderBy)
  ).filter((item) => {
    if (userFilter.role) {
      // console.log("role filter");
      return item.role.toLowerCase() === userFilter.role;
    } else if (userFilter.search) {
      return item.service.name
        .toLowerCase()
        .includes(userFilter.search.toLowerCase());
    } else return true;
  });

  const handleDeleteBooking = (id) => {
    setTableData((state) => state.filter((item) => item.id !== id));
  };

  const handleAllUserDelete = () => {
    setTableData((state) =>
      state.filter((item) => !selected.includes(item.id))
    );
    handleSelectAllRows([])();
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBookings(rowsPerPage, page, filterObj);
      console.log(response);

      if (response.success) {
        setTableData(response.data);
        console.log(response.data, "response.data bookings");
        setTotalRecords(response.totalRecords);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterObj]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <>
      {/* {loading ? (
        <TableSkeleton />
      ) : (
        <> */}

      <Card sx={{ mt: 3 }}>
        <Box p={2}>
          <HeadingArea />
          <SearchArea
            value={userFilter.search}
            gridRoute="/dashboard/user-grid"
            listRoute="/dashboard/bookings-list"
            onChange={(e) => handleChangeFilter(e)}
          />
        </Box>
        {selected.length > 0 && (
          <TableToolbar
            selected={selected.length}
            handleDeleteRows={handleAllUserDelete}
          />
        )}

        <TableContainer>
          <Scrollbar autoHide={false}>
            <Table>
              <BookingTableHead
                order={order}
                orderBy={orderBy}
                numSelected={selected.length}
                rowCount={tableData.length}
                onRequestSort={handleRequestSort}
                onSelectAllRows={handleSelectAllRows(
                  tableData.map((row) => row.id)
                )}
              />

              <TableBody>
                {tableData.map((booking) => (
                  <BookingTableRow
                    key={booking.id}
                    booking={booking}
                    isSelected={isSelected(booking.id)}
                    handleSelectRow={handleSelectRow}
                    handleDeleteBookingr={handleDeleteBooking}
                  />
                ))}

                {tableData.length === 0 && <TableDataNotFound />}
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
      {/* </>
      )} */}
    </>
  );
}
