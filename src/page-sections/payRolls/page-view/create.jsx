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
} from "@mui/material";
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import { Paragraph } from "@/components/typography";
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

export default function CreateView() {
  const [mode, setMode] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeData, setEmployeeData] = useState({
    employee: {},
    percentCalculateStatus: false,
  });

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

  const payrollTypeList = [
    { id: 1, label: "PKR", value: "PKR" },
    { id: 2, label: "USD", value: "USD" },
    { id: 3, label: "Euro", value: "Euro" },
  ];

  const taxStructureList = [
    {
      id: 1,
      label: "Tax Structure 2020-2021",
      value: "Tax Structure 2020-2021",
    },
    {
      id: 2,
      label: "Tax Structure 2021-2022",
      value: "Tax Structure 2021-2022",
    },
    {
      id: 3,
      label: "Tax Structure 2022-2023",
      value: "Tax Structure 2022-2023",
    },
    {
      id: 4,
      label: "Tax Structure 2023-2024",
      value: "Tax Structure 2023-2024",
    },
    {
      id: 5,
      label: "Tax Structure 2024-2025",
      value: "Tax Structure 2024-2025",
    },
  ];

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

  return (
    <>
      {/* Header Section */}
      <Box mb={4} p={2}>
        <FlexBox alignItems="center">
          <IconWrapper>
            <ShoppingCart sx={{ color: "primary.main" }} />
          </IconWrapper>
          <Paragraph sx={{ fontWeight: 600 }} fontSize={16}>
            Pay Roll
          </Paragraph>
        </FlexBox>
      </Box>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        <Card elevation={22} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* Employee Selection */}
            {/* <Grid p={3} md={6} sm={12} xs={12}>
              <Autocomplete
                fullWidth
                disablePortal
                options={employees}
                getOptionLabel={(option) => option?.name || ""}
                value={values.employment}
                onChange={(event, newValue) => {
                  setFieldValue("employment", newValue);
                  setEmployeeData({ ...employeeData, employee: newValue });
                  setFieldValue(
                    "previousSalary",
                    newValue?.after_probation_gross_salary || ""
                  );
                  setFieldValue("name", newValue?.name || "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Employee"
                    onChange={(e) => setSearchString(e.target.value)}
                    helperText={touched.employment && errors.employment}
                    error={Boolean(touched.employment && errors.employment)}
                  />
                )}
              />
            </Grid> */}
            <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="text"
                readOnly
                fullWidth
                name="name"
                label="Name"
                value={values.name}
                onChange={handleChange}
                helperText={touched.name && errors.name}
                error={Boolean(touched.name && errors.name)}
              />
            </Grid>

            <Grid p={3} md={6} sm={12} xs={12}>
              <Autocomplete
                fullWidth
                disablePortal
                options={payrollTypeList}
                getOptionLabel={(option) => option.label}
                value={
                  payrollTypeList.find(
                    (opt) => opt.value === values.currency
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "currency",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="currency"
                    label="Currency"
                    helperText={touched.currency && errors.currency}
                    error={Boolean(touched.currency && errors.currency)}
                  />
                )}
              />
            </Grid>

            {/* <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="number"
                readOnly
                fullWidth
                name="amount"
                label="Amount"
                value={values.amount}
                onChange={handleChange}
                helperText={touched.amount && errors.amount}
                error={Boolean(touched.amount && errors.amount)}
              />
            </Grid> */}
            {/* Effective Date */}
            {/* <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="date"
                fullWidth
                label="Date"
                name="date"
                value={values.date}
                onChange={handleChange}
                helperText={touched.date && errors.date}
                error={Boolean(touched.date && errors.date)}
              />
            </Grid>*/}
          </Grid>

          <Grid container spacing={2}>
            {/* Previous Salary */}
            {/* <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="number"
                readOnly
                fullWidth
                name="amount"
                label="Amount"
                value={values.amount}
                onChange={handleChange}
                helperText={touched.amount && errors.amount}
                error={Boolean(touched.amount && errors.amount)}
              />
            </Grid> */}
            <Grid p={3} md={6} sm={12} xs={12}>
              <Autocomplete
                fullWidth
                disablePortal
                options={taxStructureList}
                getOptionLabel={(option) => option.label}
                value={
                  taxStructureList.find(
                    (opt) => opt.value === values.taxStructure
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "taxStructure",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="taxStructure"
                    label="Tax Structure"
                    helperText={touched.taxStructure && errors.taxStructure}
                    error={Boolean(touched.taxStructure && errors.taxStructure)}
                  />
                )}
              />
            </Grid>

            {/* Salary Type Switch */}
            {mode !== "view" && (
              <Grid p={3} sm={6} xs={12}>
                <Typography fontSize={16}>Payroll Processing</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography color="#6950E8" fontWeight={600} fontSize={13}>
                    Process From Date
                  </Typography>
                  <Switch
                    checked={percentCalculateStatus}
                    onChange={(e) =>
                      setEmployeeData({
                        ...employeeData,
                        percentCalculateStatus: e.target.checked,
                      })
                    }
                  />
                  <Typography color="#6950E8" fontWeight={600} fontSize={13}>
                    Process at Month End
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="number"
                fullWidth
                name="payrollProcessingDate"
                label="Payroll Processing Date"
                value={values.payrollProcessingDate}
                onChange={handleChange}
                helperText={
                  touched.payrollProcessingDate && errors.payrollProcessingDate
                }
                error={Boolean(
                  touched.payrollProcessingDate && errors.payrollProcessingDate
                )}
              />
            </Grid>
            {mode !== "view" && (
              <Grid p={3} sm={6} xs={12}>
                <Typography fontSize={16}>Applicable Days</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography color="#6950E8" fontWeight={600} fontSize={13}>
                    Actual
                  </Typography>
                  <Switch
                    checked={percentCalculateStatus}
                    onChange={(e) =>
                      setEmployeeData({
                        ...employeeData,
                        percentCalculateStatus: e.target.checked,
                      })
                    }
                  />
                  <Typography color="#6950E8" fontWeight={600} fontSize={13}>
                    Fixed
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>
          <Grid container spacing={2}>
            <Grid p={3} md={6} sm={12} xs={12}>
              <Autocomplete
                fullWidth
                disablePortal
                options={taxStructureList}
                getOptionLabel={(option) => option.label}
                value={
                  taxStructureList.find(
                    (opt) => opt.value === values.taxStructure
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "taxStructure",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="taxStructure"
                    label="Tax Structure"
                    helperText={touched.taxStructure && errors.taxStructure}
                    error={Boolean(touched.taxStructure && errors.taxStructure)}
                  />
                )}
              />
            </Grid>
            <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" ? true : false }}
                type="text"
                fullWidth
                name="description"
                multiline
                rows={4}
                label="Description"
                value={values.description}
                onChange={handleChange}
                helperText={touched.description && errors.description}
                error={Boolean(touched.description && errors.description)}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Submit Button */}
        {mode !== "view" && (
          <Grid pt={3} pb={6} xs={12}>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Grid>
        )}
      </form>
    </>
  );
}
