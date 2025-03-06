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
// import WorkshopProfileTableHead from "./workshop/workshopProfileTableHead.jsx";
// import WorkshopProfileTableRow from "./workshop/WorkshopProfileTableRow.jsx";

// import CustomerProfileTableHead from "./customer/CustomerProfileTableHead.jsx";
// import CustomerProfileTableRow from "./customer/CustomerProfileTableRow.jsx";
import CustomerProfileTableRow from "@/page-sections/user-profile/customer/CustomerProfileTableRow.jsx";
import CustomerProfileTableHead from "@/page-sections/user-profile/customer/CustomerProfileTableHead.jsx";

import { TableDataNotFound, TableToolbar } from "@/components/table"; // CUSTOM PAGE SECTION COMPONENTS

import TablePagination from "@mui/material/TablePagination"; // CUSTOM DUMMY DATA
import { getProfile } from "@/page-sections/accounts/basic-information/request.js";
import { getProfileBookings } from "./request.js";
import { useSearchParams } from "react-router-dom";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { KeyboardArrowLeft } from "@mui/icons-material";
import FlexBox from "@/components/flexbox/FlexBox.jsx";
import { Paragraph } from "@/components/typography/index.jsx";

const CustomerUserProfile = () => {
  const navigate = useNavigate();
  const { id, role } = useParams();
  console.log({ id });
  console.log({ role });
  const [value, setValue] = React.useState("car");
  const [profileData, setProfileData] = useState({});
  const [userProfileData, setUserProfileData] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState({
    role: "",
    search: "",
  });
  const [totalRecords, setTotalRecords] = useState(0);

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
    setValue(newValue);
    handleChangeFilter("role", newValue);
    console.log({ newValue }, "newValue");
  };

  // const filteredUsers = stableSort(
  //   userProfileData,
  //   getComparator(order, orderBy)
  // ).filter((item) => {
  //   if (userFilter.role) return item.role.toLowerCase() === userFilter.role;
  //   else if (userFilter.search)
  //     return item.name.toLowerCase().includes(userFilter.search.toLowerCase());
  //   else return true;
  // });

  const handleDeleteUser = (id) => {
    setUserProfileData((state) => state.filter((item) => item.id !== id));
  };

  const handleAllUserDelete = () => {
    setUserProfileData((state) =>
      state.filter((item) => !selected.includes(item.id))
    );
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
    [rowsPerPage, value, page]
  );

  useEffect(() => {
    fetchProfile();
    fetchList(rowsPerPage, "customer_id", id);
  }, [fetchList, value]);

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
                  onChange={handleChangeTab}
                  aria-label="lab API tabs example"
                >
                  <Tab label="Car" value="car" />
                  <Tab label="Booking" value="booking" />
                </TabList>
              </Box>
            </TabContext>
          </Box>
        </Card>
      </Box>
      <Box sx={{ marginTop: "30px" }}>
        <Card sx={{ padding: "20px" }}>
          <TabContext value={value}>
            <TabPanel value="car">
              <TableContainer>
                <Scrollbar autoHide={false}>
                  <Table>
                    <CustomerProfileTableHead
                      role={value}
                      order={order}
                      orderBy={orderBy}
                      numSelected={selected.length}
                      rowCount={userProfileData.length}
                      onRequestSort={handleRequestSort}
                      onSelectAllRows={handleSelectAllRows(
                        userProfileData.map((row) => row.id)
                      )}
                    />

                    <TableBody>
                      {userProfileData.map((user) => (
                        <CustomerProfileTableRow
                          key={user.id}
                          role={value}
                          data={user}
                          isSelected={isSelected(user.id)}
                          handleSelectRow={handleSelectRow}
                          handleDeleteUser={handleDeleteUser}
                        />
                      ))}

                      {userProfileData.length === 0 && <TableDataNotFound />}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </TabPanel>
            <TabPanel value="booking">
              <TableContainer>
                <Scrollbar autoHide={false}>
                  <Table>
                    <CustomerProfileTableHead
                      role={value}
                      order={order}
                      orderBy={orderBy}
                      numSelected={selected.length}
                      rowCount={userProfileData.length}
                      onRequestSort={handleRequestSort}
                      onSelectAllRows={handleSelectAllRows(
                        userProfileData.map((row) => row.id)
                      )}
                    />

                    <TableBody>
                      {userProfileData.map((user) => (
                        <CustomerProfileTableRow
                          key={user.id}
                          role={value}
                          data={user}
                          isSelected={isSelected(user.id)}
                          handleSelectRow={handleSelectRow}
                          handleDeleteUser={handleDeleteUser}
                        />
                      ))}

                      {userProfileData.length === 0 && <TableDataNotFound />}
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

export default CustomerUserProfile;
