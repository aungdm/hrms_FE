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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
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
  getAllEmployees,
} from "../request.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

// Deduction types
const deductionTypes = [
  "Late Arrival",
  "Early Departure",
  "Absence",
  "Damage to Property",
  "Performance Issue",
  "Advance Payment",
  "Loan Installment",
  "Other"
];

export default function CreateView() {
  const [mode, setMode] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const id = params.id;

  // Initial Form Values
  const initialValues = {
    employeeId: null,
    deductionType: "",
    amount: "",
    deductionDate: null,
    description: "",
    processed: false
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    employeeId: Yup.object().nullable().required("Employee selection is required"),
    deductionType: Yup.string().required("Deduction type is required"),
    amount: Yup.number().positive("Amount must be positive").required("Amount is required"),
    deductionDate: Yup.date().required("Deduction date is required"),
    description: Yup.string(),
    processed: Yup.boolean()
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
    resetForm
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Prepare data for API
        const formData = {
          employeeId: values.employeeId?._id,
          deductionType: values.deductionType,
          amount: parseFloat(values.amount),
          deductionDate: values.deductionDate,
          description: values.description || "",
          processed: values.processed
        };
        
        console.log("Submitting form data:", formData);
        
        let response;
        
        if (!mode) {
          // Create new deduction
          response = await create(formData);
          console.log("Create response:", response);
          if (response.success) {
            toast.success(response.message || "Deduction created successfully");
            resetForm();
            navigate("/arrears-list");
          } else {
            toast.error(response.message || "Failed to create deduction");
          }
        } else if (mode === "edit") {
          // Update existing deduction
          response = await update(id, formData);
          if (response.success) {
            toast.success(response.message || "Deduction updated successfully");
            navigate("/arrears-list");
          } else {
            toast.error(response.message || "Failed to update deduction");
          }
        }
      } catch (error) {
        console.error("Error submitting deduction:", error);
        toast.error("Error submitting deduction");
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch employees for dropdown
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllEmployees();
      console.log("Employee response:", response);
      if (response?.success) {
        console.log("Setting employees:", response.data);
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error("Failed to fetch employees:", response.message);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch record for edit/view mode
  const fetchRecord = async (id) => {
    try {
      setLoading(true);
      const response = await get(id);
      
      if (response.success) {
        const { employeeId, deductionType, amount, deductionDate, description, processed } = response.data;
        
        // Find the employee object from the employees array
        const employeeObj = employees.find(emp => emp._id === employeeId._id) || employeeId;
        
        setValues({
          employeeId: employeeObj,
          deductionType: deductionType || "",
          amount: amount || "",
          deductionDate: deductionDate ? new Date(deductionDate) : null,
          description: description || "",
          processed: processed || false
        });
      } else {
        toast.error("Failed to load deduction details");
        navigate("/arrears-list");
      }
    } catch (error) {
      console.error("Error fetching deduction:", error);
      toast.error("Error loading deduction details");
      navigate("/arrears-list");
    } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Determine mode (view/edit) based on the URL and fetch record if needed
  useEffect(() => {
    if (location.pathname.includes("view")) {
      setMode("view");
      if (id) fetchRecord(id);
    } else if (location.pathname.includes("update")) {
      setMode("edit");
      if (id) fetchRecord(id);
    }
  }, [id, location.pathname]);

  return (
    <>
      {/* Header Section */}
      <Box mb={4} p={2}>
        <FlexBox alignItems="center">
          <IconWrapper>
            <MoneyOffIcon sx={{ color: "error.main" }} />
          </IconWrapper>
          <Paragraph sx={{ fontWeight: 600 }} fontSize={16}>
            {mode === "view" ? "View Arrears" : 
             mode === "edit" ? "Edit Arrears" : 
             "Create Arrears"}
          </Paragraph>
        </FlexBox>
      </Box>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Employee Selection */}
            <Grid item md={6} xs={12}>
              <Autocomplete
                fullWidth
                disablePortal
                options={employees}
                getOptionLabel={(option) => option?.name || ""}
                value={values.employeeId}
                disabled={mode === "view"}
                onChange={(event, newValue) => {
                  setFieldValue("employeeId", newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Employee"
                    helperText={touched.employeeId && errors.employeeId}
                    error={Boolean(touched.employeeId && errors.employeeId)}
                  />
                )}
              />
            </Grid>

            {/* Deduction Type */}
            <Grid item md={6} xs={12}>
              <FormControl fullWidth error={Boolean(touched.deductionType && errors.deductionType)}>
                <InputLabel>Deduction Type</InputLabel>
                <Select
                  name="deductionType"
                  value={values.deductionType}
                  onChange={handleChange}
                  label="Deduction Type"
                  disabled={mode === "view"}
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
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                type="number"
                name="amount"
                label="Amount"
                value={values.amount}
                onChange={handleChange}
                disabled={mode === "view"}
                helperText={touched.amount && errors.amount}
                error={Boolean(touched.amount && errors.amount)}
                InputProps={{
                  inputProps: { min: 0, step: "0.01" }
                }}
              />
            </Grid>

            {/* Deduction Date */}
            <Grid item md={6} xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Deduction Date"
                  value={values.deductionDate}
                  onChange={(newValue) => {
                    setFieldValue("deductionDate", newValue);
                  }}
                  disabled={mode === "view"}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(touched.deductionDate && errors.deductionDate),
                      helperText: touched.deductionDate && errors.deductionDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                disabled={mode === "view"}
                helperText={touched.description && errors.description}
                error={Boolean(touched.description && errors.description)}
              />
            </Grid>

            {/* Processed Status */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>Already Processed</Typography>
                <Switch
                  checked={values.processed}
                  onChange={(e) => setFieldValue("processed", e.target.checked)}
                  disabled={mode === "view"}
                />
              </Stack>
            </Grid>
          </Grid>

          {/* Submit Button */}
          {mode !== "view" && (
            <Box mt={3}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? "Submitting..." : mode === "edit" ? "Update" : "Submit"}
              </Button>
              <Button
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={() => navigate("/arrears-list")}
              >
                Cancel
              </Button>
            </Box>
          )}
          
          {mode === "view" && (
            <Box mt={3}>
              <Button
                variant="outlined"
                onClick={() => navigate("/arrears-list")}
              >
                Back to List
              </Button>
            </Box>
          )}
        </Card>
      </form>
    </>
  );
}
