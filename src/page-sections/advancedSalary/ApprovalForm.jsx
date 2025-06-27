import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateStatus, get } from "./request";
import { toast } from "react-toastify";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { format } from "date-fns";

export default function ApprovalForm({ advancedSalaryData, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [advancedSalary, setAdvancedSalary] = useState(advancedSalaryData || {});
  const [errorMessage, setErrorMessage] = useState("");

  // Debug log for initial props
  console.log("ApprovalForm - Initial advancedSalaryData:", advancedSalaryData);

  // Fetch complete advanced salary data if needed
  useEffect(() => {
    const fetchCompleteData = async () => {
      if (advancedSalaryData && advancedSalaryData._id) {
        try {
          setLoadingData(true);
          console.log("Fetching complete data for ID:", advancedSalaryData._id);
          const response = await get(advancedSalaryData._id);
          console.log("Fetch response:", response);
          
          if (response.success) {
            setAdvancedSalary(response.data);
            console.log("Updated advancedSalary state:", response.data);
          } else {
            toast.error("Failed to load complete advanced salary details");
            setErrorMessage("Failed to load complete advanced salary details");
          }
        } catch (error) {
          console.error("Error fetching advanced salary details:", error);
          setErrorMessage("Error fetching advanced salary details");
        } finally {
          setLoadingData(false);
        }
      } else {
        setAdvancedSalary(advancedSalaryData || {});
        console.log("Using provided advancedSalaryData:", advancedSalaryData);
      }
    };

    fetchCompleteData();
  }, [advancedSalaryData]);

  // Initial form values
  const initialValues = {
    approvedAmount: advancedSalary?.requestedAmount || "",
  };

  // Form validation schema
  const validationSchema = Yup.object().shape({
    approvedAmount: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .positive("Approved amount must be positive")
      .required("Approved amount is required"),
  });

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      setErrorMessage("");
      
      if (!advancedSalary || !advancedSalary._id) {
        const errorMsg = "Invalid advanced salary data. Missing ID.";
        console.error(errorMsg, { advancedSalary });
        toast.error(errorMsg);
        setErrorMessage(errorMsg);
        setLoading(false);
        return;
      }
      
      // Additional validation to ensure the amount is a valid number
      const approvedAmount = parseFloat(values.approvedAmount);
      if (isNaN(approvedAmount) || approvedAmount <= 0) {
        const errorMsg = "Please enter a valid positive amount";
        toast.error(errorMsg);
        setErrorMessage(errorMsg);
        setLoading(false);
        return;
      }
      
      console.log("Submitting approval with:", {
        id: advancedSalary._id,
        status: "Approved",
        approvedAmount
      });
      
      const response = await updateStatus(
        advancedSalary._id,
        "Approved",
        approvedAmount
      );

      console.log("Approval response:", response);

      if (response.success) {
        toast.success("Advanced salary approved successfully");
        if (onSuccess) onSuccess();
      } else {
        console.error("Error response:", response);
        const errorMsg = response.message || "Failed to approve advanced salary";
        toast.error(errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Error approving advanced salary:", error);
      const errorMsg = error.message || "Error approving advanced salary";
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Formik hook
  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
    enableReinitialize: true,
  });

  // Update form values when advancedSalary changes
  useEffect(() => {
    if (advancedSalary?.requestedAmount) {
      console.log("Setting approvedAmount field to:", advancedSalary.requestedAmount);
      setFieldValue("approvedAmount", advancedSalary.requestedAmount);
    }
  }, [advancedSalary, setFieldValue]);

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy");
  };

  if (loadingData) {
    return (
      <Card sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Box mb={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="h5">Approve Advanced Salary</Typography>
        </Stack>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Employee
          </Typography>
          <Typography variant="body1">
            {advancedSalary?.employeeId?.name || "N/A"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Employee ID
          </Typography>
          <Typography variant="body1">
            {advancedSalary?.employeeId?.user_defined_code || "N/A"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Requested Amount
          </Typography>
          <Typography variant="body1">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(advancedSalary?.requestedAmount || 0)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Request Date
          </Typography>
          <Typography variant="body1">
            {formatDate(advancedSalary?.requestDate)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Required Date
          </Typography>
          <Typography variant="body1">
            {formatDate(advancedSalary?.requiredDate)}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1">
            {advancedSalary?.description || "No description provided"}
          </Typography>
        </Grid>
      </Grid>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              name="approvedAmount"
              label="Approved Amount"
              value={values.approvedAmount}
              onChange={handleChange}
              error={Boolean(touched.approvedAmount && errors.approvedAmount)}
              helperText={touched.approvedAmount && errors.approvedAmount}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Approve"
                )}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
} 