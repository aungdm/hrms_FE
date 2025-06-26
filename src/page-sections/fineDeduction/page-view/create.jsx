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
import useDebounce from "@/hooks/debounceHook.js";
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
  "Damage",
  "Performance",
  "Misconduct",
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
        
        let response;
        
        if (!mode) {
          // Create new fine deduction
          response = await create(formData);
          if (response.success) {
            toast.success(response.message || "Fine deduction created successfully");
            resetForm();
            navigate("/fine-deduction-list");
          } else {
            toast.error(response.message || "Failed to create fine deduction");
          }
        } else if (mode === "edit") {
          // Update existing fine deduction
          response = await update(id, formData);
          if (response.success) {
            toast.success(response.message || "Fine deduction updated successfully");
            navigate("/fine-deduction-list");
          } else {
            toast.error(response.message || "Failed to update fine deduction");
          }
        }
      } catch (error) {
        console.error("Error submitting fine deduction:", error);
        toast.error("Error submitting fine deduction");
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
      if (response?.success) {
        setEmployees(response.data);
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
        toast.error("Failed to load fine deduction details");
        navigate("/fine-deduction-list");
      }
    } catch (error) {
      console.error("Error fetching fine deduction:", error);
      toast.error("Error loading fine deduction details");
      navigate("/fine-deduction-list");
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
            <MoneyOffIcon sx={{ color: "primary.main" }} />
          </IconWrapper>
          <Paragraph sx={{ fontWeight: 600 }} fontSize={16}>
            {mode === "view" ? "View Fine Deduction" : 
             mode === "edit" ? "Edit Fine Deduction" : 
             "Create Fine Deduction"}
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
                <Typography>Already Paid</Typography>
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
                onClick={() => navigate("/fine-deduction-list")}
              >
                Cancel
              </Button>
            </Box>
          )}
          
          {mode === "view" && (
            <Box mt={3}>
              <Button
                variant="outlined"
                onClick={() => navigate("/fine-deduction-list")}
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
