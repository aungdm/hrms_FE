import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
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
} from "./request.js";
import { toast } from "react-toastify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default function LoanForm({ mode = "create", loanId, onSuccess, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Initial Form Values
  const initialValues = {
    employeeId: null,
    requestedAmount: "",
    totalInstallments: "",
    description: "",
    requiredDate: null,
    processed: false
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    employeeId: Yup.object().nullable().required("Employee selection is required"),
    requestedAmount: Yup.number().positive("Amount must be positive").required("Requested amount is required"),
    totalInstallments: Yup.number().positive("Installments must be positive").integer("Installments must be whole numbers").required("Total installments is required"),
    description: Yup.string(),
    requiredDate: Yup.date().required("Required date is required"),
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
      if (mode === "view") return;
      
      try {
        setLoading(true);
        
        // Prepare data for API
        const formData = {
          employeeId: values.employeeId?._id,
          requestedAmount: parseFloat(values.requestedAmount),
          totalInstallments: parseInt(values.totalInstallments, 10),
          description: values.description || "",
          requiredDate: values.requiredDate,
          processed: values.processed
        };
        
        let response;
        
        if (mode === "create") {
          // Create new loan
          response = await create(formData);
          if (response.success) {
            toast.success(response.message || "Loan request created successfully");
            resetForm();
            if (onSuccess) onSuccess();
          } else {
            toast.error(response.message || "Failed to create loan request");
          }
        } else if (mode === "edit") {
          // Update existing loan
          response = await update(loanId, formData);
          if (response.success) {
            toast.success(response.message || "Loan updated successfully");
            if (onSuccess) onSuccess();
          } else {
            toast.error(response.message || "Failed to update loan");
          }
        }
      } catch (error) {
        console.error("Error submitting loan:", error);
        toast.error("Error submitting loan");
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch employees for dropdown
  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await getAllEmployees();
      if (response?.success) {
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error("Failed to fetch employees:", response.message);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Fetch record for edit/view mode
  const fetchRecord = useCallback(async (id) => {
    if (!id) return;
    
    try {
      setLoadingData(true);
      const response = await get(id);
      
      if (response.success) {
        const { employeeId, requestedAmount, totalInstallments, description, requiredDate, processed } = response.data;
        
        // Find the employee object from the employees array
        const employeeObj = employees.find(emp => emp._id === employeeId._id) || employeeId;
        
        setValues({
          employeeId: employeeObj,
          requestedAmount: requestedAmount || "",
          totalInstallments: totalInstallments || "",
          description: description || "",
          requiredDate: requiredDate ? new Date(requiredDate) : null,
          processed: processed || false
        });
      } else {
        toast.error("Failed to load loan details");
      }
    } catch (error) {
      console.error("Error fetching loan:", error);
      toast.error("Error loading loan details");
    } finally {
      setLoadingData(false);
    }
  }, [employees, setValues]);

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Fetch loan data when in edit or view mode
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && loanId) {
      fetchRecord(loanId);
    }
  }, [mode, loanId, fetchRecord]);

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Box mb={3}>
        <FlexBox gap={0.5} alignItems="center">
          <IconWrapper>
            <MonetizationOnIcon sx={{ color: "primary.main" }} />
          </IconWrapper>
          <Typography variant="h5">
            {mode === "edit" ? "Edit Loan" : mode === "view" ? "View Loan" : "Create Loan Request"}
          </Typography>
        </FlexBox>
        <Paragraph color="text.secondary" mt={0.5}>
          {mode === "edit" ? "Update loan details" : mode === "view" ? "View loan details" : "Create a new loan request"}
        </Paragraph>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              fullWidth
              options={employees}
              value={values.employeeId}
              onChange={(_, value) => setFieldValue("employeeId", value)}
              getOptionLabel={(option) => option?.name || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee"
                  error={Boolean(touched.employeeId && errors.employeeId)}
                  helperText={touched.employeeId && errors.employeeId}
                  disabled={mode === "view"}
                />
              )}
              disabled={mode === "view"}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              name="requestedAmount"
              label="Requested Amount"
              onChange={handleChange}
              value={values.requestedAmount}
              error={Boolean(touched.requestedAmount && errors.requestedAmount)}
              helperText={touched.requestedAmount && errors.requestedAmount}
              disabled={mode === "view"}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              name="totalInstallments"
              label="Total Installments"
              onChange={handleChange}
              value={values.totalInstallments}
              error={Boolean(touched.totalInstallments && errors.totalInstallments)}
              helperText={touched.totalInstallments && errors.totalInstallments}
              disabled={mode === "view"}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Required Date"
                value={values.requiredDate}
                onChange={(date) => setFieldValue("requiredDate", date)}
                disabled={mode === "view"}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(touched.requiredDate && errors.requiredDate),
                    helperText: touched.requiredDate && errors.requiredDate
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Description"
              onChange={handleChange}
              value={values.description}
              error={Boolean(touched.description && errors.description)}
              helperText={touched.description && errors.description}
              disabled={mode === "view"}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.processed}
                  onChange={(e) => setFieldValue("processed", e.target.checked)}
                  disabled={mode === "view"}
                />
              }
              label="Processed"
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
              >
                {mode === "view" ? "Close" : "Cancel"}
              </Button>
              
              {mode !== "view" && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : mode === "edit" ? (
                    "Update"
                  ) : (
                    "Submit"
                  )}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
} 