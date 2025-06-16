import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
} from "@mui/material";
import { Paragraph } from "@/components/typography";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Autocomplete from "@mui/material/Autocomplete";
import { useFormik } from "formik";
import * as Yup from "yup";
import { generatePayroll, getEmployees } from "../request.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import duotone from "@/icons/duotone";

export default function CreateView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  const navigate = useNavigate();
  const TodoList = duotone.TodoList;

  // Initial Form Values
  const initialValues = {
    startDate: null,
    endDate: null,
    employeeIds: [],
    payrollType: ""
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().required("End date is required"),
    payrollType: Yup.string().required("Payroll type is required")
  });

  // Formik Hook
  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    isValid,
    dirty
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setProcessing(true);
        setResult(null);

        // Format dates as ISO strings
        const payload = {
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          employeeIds: values.employeeIds.length > 0 ? values.employeeIds.map(emp => emp._id) : [],
          payrollType: values.payrollType
        };

        const response = await generatePayroll(payload);
        
        if (response.success) {
          toast.success(`${values.payrollType} payroll generation initiated`);
          setResult({
            success: response.data.length || 0,
            failed: 0,
            errors: []
          });

          // Navigate to the list page
          setTimeout(() => {
            navigate("/pay-rolls-list");
          }, 3000);
        } else {
          toast.error(response.message || "Error generating payroll");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error generating payroll");
      } finally {
        setProcessing(false);
      }
    },
  });

  const fetchEmployees = useCallback(async (search = "") => {
    try {
      setLoading(true);
      const response = await getEmployees(search, 100, 1);
      if (response?.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching employees");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter employees based on selected payroll type
  useEffect(() => {
    if (values.payrollType && employees.length > 0) {
      const filtered = employees.filter(emp => emp.payroll_type === values.payrollType);
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [values.payrollType, employees]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <Card sx={{ p: 3 }}>
      <Box mb={3}>
        <Stack direction="row" alignItems="center" mb={1}>
          <IconWrapper>
            <TodoList sx={{ color: "primary.main" }} />
          </IconWrapper>
          <Typography variant="h5">Generate Payroll</Typography>
        </Stack>
        <Typography color="text.secondary" variant="body2">
          Generate payroll for employees based on attendance records
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth error={touched.payrollType && Boolean(errors.payrollType)}>
              <InputLabel>Payroll Type</InputLabel>
              <Select
                value={values.payrollType}
                label="Payroll Type"
                onChange={(e) => {
                  setFieldValue("payrollType", e.target.value);
                  // Clear selected employees when changing payroll type
                  setFieldValue("employeeIds", []);
                }}
              >
                <MenuItem value="Hourly">Hourly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
              {touched.payrollType && errors.payrollType && (
                <Typography color="error" variant="caption">
                  {errors.payrollType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={values.startDate}
                onChange={(date) => setFieldValue("startDate", date)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: touched.startDate && Boolean(errors.startDate),
                    helperText: touched.startDate && errors.startDate
                  } 
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={values.endDate}
                onChange={(date) => setFieldValue("endDate", date)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: touched.endDate && Boolean(errors.endDate),
                    helperText: touched.endDate && errors.endDate
                  } 
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              id="employeeIds"
              options={filteredEmployees}
              loading={loading}
              getOptionLabel={(option) => `${option.name} (${option.employeeId || option._id})`}
              onChange={(e, value) => setFieldValue("employeeIds", value)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.name}`}
                    {...getTagProps({ index })}
                    key={option._id}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Select Employees (Optional)"
                  placeholder="Leave empty to include all employees"
                  helperText={values.payrollType ? 
                    `Showing ${values.payrollType} employees only` : 
                    "Select payroll type first to filter employees"}
                />
              )}
              disabled={!values.payrollType}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              type="submit"
              color="primary"
              variant="contained"
              disabled={!isValid || processing || !values.payrollType}
            >
              {processing ? "Generating..." : "Generate Payroll"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {processing && (
        <Box mt={3}>
          <LinearProgress />
          <Typography mt={1} align="center">
            Processing payroll data...
          </Typography>
        </Box>
      )}

      {result && (
        <Box mt={3}>
          <Alert severity={result.success > 0 ? "success" : "error"}>
            <AlertTitle>Payroll Generation Result</AlertTitle>
            <Typography>
              {result.success} payrolls successfully generated
            </Typography>
            {result.failed > 0 && (
              <Typography color="error">
                {result.failed} payrolls failed to generate
              </Typography>
            )}
          </Alert>
        </Box>
      )}
    </Card>
  );
}
