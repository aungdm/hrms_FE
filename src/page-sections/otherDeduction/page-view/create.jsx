import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
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
  get,
} from "../request.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useDebounce from "@/hooks/debounceHook.js";
import { format } from "date-fns";
import { toast } from "react-toastify";
import axios from "axios";

export default function CreateView() {
  const [mode, setMode] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 1000);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const id = params.id;

  // Deduction types
  const deductionTypes = [
    "Fine",
    "Loan Deduction",
    "Insurance Premium",
    "Tax Deduction",
    "Advance Salary",
    "Other"
  ];

  // Initial Form Values
  const initialValues = {
    employeeId: "",
    deductionType: "",
    amount: "",
    deductionDate: "",
    description: "",
    status: "Pending"
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required("Employee selection is required"),
    deductionType: Yup.string().required("Deduction type is required"),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    deductionDate: Yup.date().required("Deduction date is required"),
    description: Yup.string(),
    status: Yup.string().oneOf(["Pending", "Approved", "Rejected"])
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
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      console.log({ values });
      try {
        let responseData;
        if (!mode || mode === "create") {
          responseData = await create({
            employeeId: values.employeeId,
            deductionType: values.deductionType,
            amount: parseFloat(values.amount),
            deductionDate: values.deductionDate,
            description: values.description,
            status: values.status
          });
        } else if (mode === "edit") {
          responseData = await update(id, {
            employeeId: values.employeeId,
            deductionType: values.deductionType,
            amount: parseFloat(values.amount),
            deductionDate: values.deductionDate,
            description: values.description,
            status: values.status
          });
        }
        
        console.log("Response:", responseData);
        
        if (responseData.success) {
          toast.success(responseData.message || "Deduction saved successfully");
          resetForm();
          navigate("/other-deduction-list");
        } else {
          toast.error(responseData.message || "Failed to save deduction");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error saving deduction");
      }
    },
  });

  // Fetch employee list
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get("employee/get", {
        params: {
          search: debouncedSearchString,
          perPage: 100,
          page: 1
        }
      });
      
      if (response?.data?.success) {
        setEmployees(response.data.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, [debouncedSearchString]);

  const fetchRecord = async (id) => {
    try {
      const response = await get(id);
      console.log(response?.data);
      
      if (response.success) {
        const data = response.data;
        setValues({
          employeeId: data.employeeId?._id || data.employeeId || "",
          deductionType: data.deductionType || "",
          amount: data.amount || "",
          deductionDate: data.deductionDate ? format(new Date(data.deductionDate), "yyyy-MM-dd") : "",
          description: data.description || "",
          status: data.status || "Pending"
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching deduction details");
    }
  };

  // Fetch employee list when search string changes
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Determine mode (view/edit) based on the URL
  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }

    if (location.pathname.includes("view")) {
      setMode("view");
    } else if (id) {
      setMode("edit");
    } else {
      setMode("create");
    }
  }, [id, location.pathname]);

  const selectedEmployee = employees.find(emp => emp._id === values.employeeId);

  return (
    <>
      {/* Header Section */}
      <Box mb={4} p={2}>
        <FlexBox alignItems="center">
          <IconWrapper>
            <ShoppingCart sx={{ color: "primary.main" }} />
          </IconWrapper>
          <Paragraph sx={{ fontWeight: 600 }} fontSize={16}>
            {mode === "view" ? "View" : mode === "edit" ? "Edit" : "Create"} Other Deduction
          </Paragraph>
        </FlexBox>
      </Box>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        <Card elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Employee Selection */}
            <Grid item md={6} sm={12} xs={12}>
              <Autocomplete
                fullWidth
                disabled={mode === "view"}
                options={employees}
                getOptionLabel={(option) => `${option?.name || ""} (${option?.user_defined_code || ""})`}
                value={selectedEmployee || null}
                onChange={(event, newValue) => {
                  setFieldValue("employeeId", newValue?._id || "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Employee"
                    onChange={(e) => setSearchString(e.target.value)}
                    helperText={touched.employeeId && errors.employeeId}
                    error={Boolean(touched.employeeId && errors.employeeId)}
                  />
                )}
              />
            </Grid>

            {/* Deduction Type */}
            <Grid item md={6} sm={12} xs={12}>
              <FormControl fullWidth error={Boolean(touched.deductionType && errors.deductionType)}>
                <InputLabel>Deduction Type</InputLabel>
                <Select
                  disabled={mode === "view"}
                  name="deductionType"
                  value={values.deductionType}
                  onChange={handleChange}
                  label="Deduction Type"
                >
                  {deductionTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {touched.deductionType && errors.deductionType && (
                  <FormHelperText>{errors.deductionType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Amount */}
            <Grid item md={6} sm={12} xs={12}>
              <TextField
                disabled={mode === "view"}
                type="number"
                fullWidth
                name="amount"
                label="Amount"
                value={values.amount}
                onChange={handleChange}
                helperText={touched.amount && errors.amount}
                error={Boolean(touched.amount && errors.amount)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Deduction Date */}
            <Grid item md={6} sm={12} xs={12}>
              <TextField
                disabled={mode === "view"}
                type="date"
                fullWidth
                label="Deduction Date"
                name="deductionDate"
                value={values.deductionDate}
                onChange={handleChange}
                helperText={touched.deductionDate && errors.deductionDate}
                error={Boolean(touched.deductionDate && errors.deductionDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Status */}
            <Grid item md={6} sm={12} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  disabled={mode === "view"}
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item md={6} sm={12} xs={12}>
              <TextField
                disabled={mode === "view"}
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

          {/* Submit Button */}
          {mode !== "view" && (
            <Box mt={3} display="flex" gap={2}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                {mode === "edit" ? "Update" : "Create"} Deduction
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate("/dashboard/otherDeduction")}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Card>
      </form>
    </>
  );
}
