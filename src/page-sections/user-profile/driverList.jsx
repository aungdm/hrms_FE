import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TabContext from "@mui/lab/TabContext";
import Tab from "@mui/material/Tab";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Table from "@mui/material/Table";
import UserTableHead from "../users/UserTableHead.jsx";
import TableBody from "@mui/material/TableBody";
import UserTableRow from "../users/UserTableRow.jsx";
import TableContainer from "@mui/material/TableContainer";
import Scrollbar from "@/components/scrollbar";
import { USER_LIST } from "@/__fakeData__/users";
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";

import DrvierProfileTableRow from "@/page-sections/user-profile/driver/DriverProfileTableRow.jsx";
import DriverProfileTableHead from "@/page-sections/user-profile/driver/DriverProfileTableHead.jsx";

import TablePagination from "@mui/material/TablePagination"; // CUSTOM DUMMY DATA
import { getProfile } from "@/page-sections/accounts/basic-information/request.js";
import { getProfileBookings } from "./request.js";
import { useSearchParams } from "react-router-dom";
import { TableDataNotFound, TableToolbar } from "@/components/table"; // CUSTOM PAGE SECTION COMPONENTS

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { Paragraph } from "@/components/typography/index.jsx";
import FlexBox from "@/components/flexbox/FlexBox.jsx";

const DriverUserProfile = () => {
  const navigate = useNavigate();
  const { id, role } = useParams();
  console.log({ id });
  console.log({ role });
  const [value, setValue] = React.useState("1");
  const [profileData, setProfileData] = useState({});
  const [userProfileData, setUserProfileData] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([...USER_LIST]);
  const [userFilter, setUserFilter] = useState({
    role: "",
    search: "",
  });
  const [totalRecords, setTotalRecords] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  console.log(userFilter);
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

  const handleChangeFilter = (key, value) => {
    setUserFilter((state) => ({
      ...state,
      [key]: value,
    }));
  };

  const handleChangeTab = (_, newValue) => {
    handleChangeFilter("role", newValue);
    console.log(newValue);
  };

  const filteredUsers = stableSort(
    userProfileData,
    getComparator(order, orderBy)
  ).filter((item) => {
    if (userFilter.role) return item.role.toLowerCase() === userFilter.role;
    else if (userFilter.search)
      return item.name.toLowerCase().includes(userFilter.search.toLowerCase());
    else return true;
  });

  const handleDeleteUser = (id) => {
    setUsers((state) => state.filter((item) => item.id !== id));
  };

  const handleAllUserDelete = () => {
    setUsers((state) => state.filter((item) => !selected.includes(item.id)));
    handleSelectAllRows([])();
  };
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      console.log({ response });
      setProfileData(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // const fetchData = async (customer_id) => {
  //   try {
  //     setLoading(true);
  //     const response = await getProfileBookings(customer_id);
  //     console.log({ response }, "getProfileBookings");
  //     setUserProfileData(response.data);
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchList = useCallback(
    async (rowsPerPage, role, id) => {
      try {
        setLoading(true);
        const response = await getProfileBookings(rowsPerPage, role, id, page);
        console.log(response);
        if (response.success) {
          setUserProfileData(response.data);
          setTotalRecords(response.totalRecords);
          setInitialData(response.data);
        }
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [rowsPerPage, page]
  );

  useEffect(() => {
    fetchProfile();
    fetchList(rowsPerPage, "truck-driver-id", id);
  }, [fetchList]);

  return (
    <div>
      <Box>
        <FlexBox
          sx={{
            alignItems: "center",
            marginBottom: "20px",
          }}
          onClick={() => navigate(`/user-list`)}
        >
          <KeyboardArrowLeft
            sx={{ color: "#6B7280", cursor: "pointer", marginRight: "5px" }}
            fontSize="large"
          />
          <Paragraph
            sx={{
              color: "#6B7280",
              cursor: "pointer",
              marginRight: "10px",
              fontWeight: "bold",
              fontSize: "17px",
              ":hover": {
                textDecoration: "underline",
              },
            }}
          >
            Users
          </Paragraph>
        </FlexBox>

        <Card sx={{ padding: "20px 20px 0 20px" }}>
          <Box sx={{ textAlign: "center", padding: "30px 0" }}>
            <Typography>
              {profileData.first_name || profileData.last_name
                ? `${profileData.first_name} ${profileData.last_name}`
                : ""}
            </Typography>
            <Typography>{profileData?.phone_number}</Typography>
          </Box>
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box
                sx={{
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <TabList
                  sx={{ border: "none" }}
                  onChange={handleChange}
                  aria-label="lab API tabs example"
                >
                  <Tab label="Booking" value="1" />
                  {/* {tabFilter(role)} */}
                </TabList>
              </Box>
            </TabContext>
          </Box>
        </Card>
      </Box>
      <Box sx={{ marginTop: "30px" }}>
        <Card sx={{ padding: "20px" }}>
          <TabContext value={value}>
            <TabPanel value="1">
              <TableContainer>
                <Scrollbar autoHide={false}>
                  <Table>
                    <DriverProfileTableHead
                      order={order}
                      orderBy={orderBy}
                      numSelected={selected.length}
                      rowCount={filteredUsers.length}
                      onRequestSort={handleRequestSort}
                      onSelectAllRows={handleSelectAllRows(
                        filteredUsers.map((row) => row.id)
                      )}
                    />

                    <TableBody>
                      {filteredUsers.map((user) => (
                        <DrvierProfileTableRow
                          key={user.id}
                          user={user}
                          isSelected={isSelected(user.id)}
                          handleSelectRow={handleSelectRow}
                          handleDeleteUser={handleDeleteUser}
                        />
                      ))}

                      {filteredUsers.length === 0 && <TableDataNotFound />}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </TabPanel>

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
          </TabContext>
        </Card>
      </Box>
    </div>
  );
};

export default DriverUserProfile;
