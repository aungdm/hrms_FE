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
    payrollType: Yup.string()
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
          employeeIds: values.employeeIds.length > 0 ? values.employeeIds.map(emp => emp._id) : []
        };

        const response = await generatePayroll(payload);
        
        if (response.success) {
          toast.success("Payroll generation initiated");
          setResult({
            success: response.data.success,
            failed: response.data.failed,
            errors: response.data.errors,
          });

          // If at least one payroll was successfully generated, enable the view button
          if (response.data.success > 0) {
            setTimeout(() => {
              navigate("/pay-rolls-list");
            }, 3000);
          }
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
              options={employees}
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
                  label="Select Employees (leave empty for all)"
                  placeholder="Search employees"
                />
              )}
            />
            <Typography variant="caption" color="text.secondary">
              Leave empty to generate payroll for all employees
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box textAlign="right" mt={3}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={processing || !(isValid && dirty)}
              >
                Generate Payroll
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {processing && (
        <Box mt={3}>
          <Typography variant="body2" mb={1}>Processing payroll generation...</Typography>
          <LinearProgress />
        </Box>
      )}

      {result && (
        <Box mt={3}>
          <Alert 
            severity={result.success > 0 ? "success" : "warning"}
            sx={{ mb: 2 }}
          >
            <AlertTitle>Payroll Generation Results</AlertTitle>
            <Typography variant="body2">
              Successfully generated {result.success} payroll(s)
            </Typography>
            <Typography variant="body2">
              Failed to generate {result.failed} payroll(s)
            </Typography>
          </Alert>

          {result.failed > 0 && result.errors && result.errors.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="error">Errors:</Typography>
              {result.errors.map((err, index) => (
                <Typography key={index} variant="caption" color="error.main" display="block">
                  • {err.name}: {err.error}
                </Typography>
              ))}
            </Box>
          )}

          {result.success > 0 && (
            <Box mt={2} textAlign="right">
              <Typography variant="body2" mb={1}>
                Redirecting to payroll list...
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Card>
  );
}
