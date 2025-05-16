import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  Stack,
  styled,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
} from "@mui/material";
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import { Paragraph, H6, Small } from "@/components/typography";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import FlexBox from "@/components/flexbox/FlexBox.jsx";
import Autocomplete from "@mui/material/Autocomplete";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  create,
  update,
  // searchEmployees,
  get,
  // updateSalary,
} from "../request.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useDebounce from "@/hooks/debounceHook.js";
import { format } from "date-fns";
import { toast } from "react-toastify";
import axios from "axios";
import HistoryIcon from "@mui/icons-material/History";

// Styled components
const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3),
}));

const InfoItem = ({ label, value, isLoading }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Box sx={{ backgroundColor: "#f9f9f9" ,padding:"10px" }}>
      <Small color="black" mb={0.5} display="block">
        {label}
      </Small>
    </Box>
    <Typography fontSize={12} color="text.primary" padding="10px">
      {value || "N/A"}
    </Typography>
  </Grid>
);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  "&.header": {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
  },
}));

const LOADING_TIMEOUT = 5000; // 5 seconds timeout

const PayItemsTable = ({ payItems, isLoading, onHistoryClick }) => {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (isLoading) {
      // Set a timeout to hide skeleton after LOADING_TIMEOUT
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, LOADING_TIMEOUT);

      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading]);

  const defaultPayItems = [
    { name: "Leave Deduction", value: 21333, manuallyUpdated: true },
    { name: "Standard Salary", value: 160000, manuallyUpdated: false },
    { name: "Monthly Basic Salary", value: 160000, manuallyUpdated: false },
    { name: "Commission", value: 0, manuallyUpdated: false },
    { name: "Other Incentives", value: 0, manuallyUpdated: false },
    { name: "Arrear's", value: 0, manuallyUpdated: false },
    { name: "Other Deduction", value: 0, manuallyUpdated: false },
    { name: "Personal Loan", value: 0, manuallyUpdated: false },
    { name: "Advance Against Salary", value: 0, manuallyUpdated: false },
  ];

  if (showSkeleton && isLoading) {
    return <Skeleton height={400} />;
  }

  // Use API data if available, otherwise use default data
  const items = payItems || defaultPayItems;

  return (
    <Card sx={{ mt: 3 }}>
      <Box p={2}>
        <Typography variant="h6" component="h2" mb={2}>
          Payitems
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell className="header">Name</StyledTableCell>
              <StyledTableCell className="header">Value</StyledTableCell>
              <StyledTableCell className="header" align="center">
                Manually Updated
              </StyledTableCell>
              <StyledTableCell className="header" align="center">
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.name} hover>
                <StyledTableCell sx={{ backgroundColor: "grey.50" }}>
                  {item.name}
                </StyledTableCell>
                <StyledTableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography component="span" color="text.secondary">
                      Rs
                    </Typography>
                    {item.value.toLocaleString()}
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Checkbox checked={item.manuallyUpdated} disabled />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onHistoryClick(item.name)}
                    title="View History"
                  >
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default function CreateView() {
  const [mode, setMode] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeData, setEmployeeData] = useState({
    employee: {},
    percentCalculateStatus: false,
  });
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payItems, setPayItems] = useState(null);
  const [payItemsLoading, setPayItemsLoading] = useState(true);

  const { employee, percentCalculateStatus } = employeeData;
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 1000);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const id = params.id;

  // Initial Form Values
  const initialValues = {
    date: "",
    previousSalary: "",
    salary: "",
    name: "",
    percentage: "", // Added percentage field
    employment: null,
    description: "",
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    date: Yup.date().required("Effective Date is Required!"),
    employment: Yup.object()
      .nullable()
      .required("Employee selection is required"),
    salary: Yup.number().required("Salary is Required!"),
    previousSalary: Yup.number().required("Previous Salary is Required!"),
    name: Yup.string().required("Name is Required!"),
    description: Yup.string(),
  });

  // Formik Hook
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    touched,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      // console.log({ values });
      // const object = { ...values, employment: values.employment?._id };
      // console.log({ object });
      // try {
      //   let responseData;
      //   // if (!mode) {
      //   responseData = await create(object);
      //   const salaryData = await updateSalary(values.employment?._id, {
      //     after_probation_gross_salary: values.salary,
      //   });
      //   console.log({ salaryData });
      //   if (responseData.success) {
      //     toast.success("Salary Revision created successfully ");
      //     resetForm();
      //     navigate("/salary-revisions-list");
      //   }
      //   // } else {
      //   // responseData = await update(id, values);
      //   // }
      //   console.log("Response:", responseData);
      // } catch (error) {
      //   console.error(error);
      //   toast.error("Error Creating Salary Revision");
      // }
    },
  });

  // Fetch employee list when user types in the search field
  const fetchList = useCallback(async () => {
    try {
      const response = await searchEmployees(debouncedSearchString);
      console.log({ response }, " employee in salary revision");

      if (response?.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [debouncedSearchString]);

  // Handles percentage input and updates salary dynamically
  const handlePercentageChange = (e) => {
    const percent = parseFloat(e.target.value);
    const baseSalary = Number(employee?.after_probation_gross_salary) || 0;

    if (!isNaN(percent)) {
      const incrementedSalary = baseSalary + (baseSalary * percent) / 100;
      setValues({
        ...values,
        salary: incrementedSalary,
        percentage: e.target.value,
      });
    } else {
      setValues({ ...values, salary: baseSalary, percentage: "" });
    }
  };

  const fetchRecord = async (id) => {
    try {
      const response = await get(id);
      console.log(response?.data);
      const { date, previousSalary, salary, description, employment, name } =
        response.data;
      if (response.success) {
        setValues({
          date: date ? format(new Date(date), "yyyy-MM-dd") : "",
          employment: employment || "",
          previousSalary: previousSalary || "",
          salary: salary || "",
          description: description || "",
          name: name || "",
        });
        setEmployeeData({ ...employeeData, employee: employment });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Fetch employee list when search string changes
  // useEffect(() => {
  //   if (debouncedSearchString) {
  //     fetchList();
  //   }
  // }, [debouncedSearchString, fetchList]);

  // Determine mode (view/edit) based on the URL
  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }

    if (location.pathname.includes("view")) {
      setMode("view");
    } else if (id) {
      // fetchRecord(id);
      setMode("edit");
    }
  }, [id, location.pathname]);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/v1/employees/${id}`);
        setEmployeeDetails(response.data.data);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        // You might want to show an error message to the user
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  // Add new useEffect for fetching payitems
  useEffect(() => {
    const fetchPayItems = async () => {
      if (!id) return;

      try {
        setPayItemsLoading(true);
        const response = await axios.get(`/api/v1/payitems/${id}`);
        setPayItems(response.data.data);
      } catch (error) {
        console.error("Error fetching payitems:", error);
        toast.error("Failed to load pay items");
      } finally {
        setPayItemsLoading(false);
      }
    };

    fetchPayItems();
  }, [id]);

  const handleHistoryClick = async (itemName) => {
    try {
      const response = await axios.get(
        `/api/v1/payitems/history/${id}/${itemName}`
      );
      // Here you would typically open a modal or dialog to show the history
      console.log("History data:", response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load history");
    }
  };

  return (
    <>
      {/* Header Section */}
      <Box mb={4} p={2}>
        <FlexBox alignItems="center">
          <IconWrapper>
            <ShoppingCart sx={{ color: "primary.main" }} />
          </IconWrapper>
          <Paragraph sx={{ fontWeight: 600 }} fontSize={16}>
            Pay Slip
          </Paragraph>
        </FlexBox>
      </Box>

      {/* Form Section */}

      <StyledBox>
        <Grid container spacing={3}>
          <InfoItem
            label="Employee Code"
            value={employeeDetails?.employeeCode}
            isLoading={isLoading}
          />
          <InfoItem
            label="Name"
            value={employeeDetails?.name}
            isLoading={isLoading}
          />
          <InfoItem
            label="Company"
            value={employeeDetails?.company}
            isLoading={isLoading}
          />
          <InfoItem
            label="Location"
            value={employeeDetails?.location}
            isLoading={isLoading}
          />
          <InfoItem
            label="Branch"
            value={employeeDetails?.branch}
            isLoading={isLoading}
          />
          <InfoItem
            label="Department"
            value={employeeDetails?.department}
            isLoading={isLoading}
          />
          <InfoItem
            label="Job Title"
            value={employeeDetails?.jobTitle}
            isLoading={isLoading}
          />
          <InfoItem
            label="Joining Date"
            value={employeeDetails?.joiningDate}
            isLoading={isLoading}
          />
        </Grid>
      </StyledBox>

      <PayItemsTable
        payItems={payItems}
        isLoading={payItemsLoading}
        onHistoryClick={handleHistoryClick}
      />
      <Grid pt={3} pb={6} xs={12}>
        <Button type="submit" variant="contained">
          cancel
        </Button>
      </Grid>
    </>
  );
}
