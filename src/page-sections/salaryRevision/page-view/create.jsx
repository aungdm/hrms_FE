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
import { create, update, searchEmployees, get } from "../request.js";
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
    effectiveDate: "",
    previousSalary: "",
    salary: "",
    percentage: "", // Added percentage field
    employment: null,
    description: "",
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    effectiveDate: Yup.date().required("Effective Date is Required!"),
    employment: Yup.object()
      .nullable()
      .required("Employee selection is required"),
    salary: Yup.number().required("Salary is Required!"),
    previousSalary: Yup.number().required("Previous Salary is Required!"),
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
      console.log({ values });
      const object = { ...values, employment: values.employment?._id };
      console.log({ object });
      try {
        let responseData;
        // if (!mode) {
        responseData = await create(object);
        if (responseData.success) {
          toast.success("Salary Revision created successfully ");
          resetForm();
          navigate("/salary-revisions-list");
        }
        // } else {
        // responseData = await update(id, values);
        // }
        console.log("Response:", responseData);
      } catch (error) {
        console.error(error);
        toast.error("Error Creating Salary Revision");
      }
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
    const baseSalary = Number(employee?.probation_salary) || 0;

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
      const { effectiveDate, previousSalary, salary, description, employment } =
        response.data;
      if (response.success) {
        setValues({
          effectiveDate: effectiveDate
            ? format(new Date(effectiveDate), "yyyy-MM-dd")
            : "",
          employment: employment || "",
          previousSalary: previousSalary || "",
          salary: salary || "",
          description: description || "",
        });
        setEmployeeData({ ...employeeData, employee: employment });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Fetch employee list when search string changes
  useEffect(() => {
    if (debouncedSearchString) {
      fetchList();
    }
  }, [debouncedSearchString, fetchList]);

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
            Create Salary Revision
          </Paragraph>
        </FlexBox>
      </Box>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        <Card elevation={22}>
          <Grid container spacing={2}>
            {/* Employee Selection */}
            <Grid p={3} md={6} sm={12} xs={12}>
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
                    newValue?.probation_salary || ""
                  );
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
            </Grid>

            {/* Effective Date */}
            <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="date"
                fullWidth
                label="Effective Date"
                name="effectiveDate"
                value={values.effectiveDate}
                onChange={handleChange}
                helperText={touched.effectiveDate && errors.effectiveDate}
                error={Boolean(touched.effectiveDate && errors.effectiveDate)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* Previous Salary */}
            <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="number"
                readOnly
                fullWidth
                name="previousSalary"
                label="Previous Salary"
                value={employee?.probation_salary || ""}
                onChange={handleChange}
                helperText={touched.previousSalary && errors.previousSalary}
                error={Boolean(touched.previousSalary && errors.previousSalary)}
              />
            </Grid>

            {/* Salary Type Switch */}
            {mode !== "view" && (
              <Grid p={3} sm={6} xs={12}>
                <Typography fontSize={16}>Type</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography color="#6950E8" fontWeight={600} fontSize={13}>
                    Flat
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
                    Percentage
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>

          {/* Percentage Input */}
          {percentCalculateStatus && (
            <Grid p={3} md={6} sm={6} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="number"
                fullWidth
                name="percentage"
                label="Percentage"
                value={values.percentage}
                onChange={handlePercentageChange}
                helperText={touched.percentage && errors.percentage}
                error={Boolean(touched.percentage && errors.percentage)}
              />
            </Grid>
          )}

          {/* Final Salary */}

          <Grid container spacing={2}>
            <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="number"
                fullWidth
                name="salary"
                label="Salary"
                value={values.salary}
                onChange={handleChange}
                helperText={touched.salary && errors.salary}
                error={Boolean(touched.salary && errors.salary)}
              />
            </Grid>
            <Grid p={3} md={6} sm={12} xs={12}>
              <TextField
                inputProps={{ readOnly: mode === "view" ? true : false }}
                type="text"
                fullWidth
                name="description"
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
