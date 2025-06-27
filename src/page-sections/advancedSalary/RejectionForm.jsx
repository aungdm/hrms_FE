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
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { format } from "date-fns";

export default function RejectionForm({ advancedSalaryData, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [advancedSalary, setAdvancedSalary] = useState(advancedSalaryData || {});
  const [errorMessage, setErrorMessage] = useState("");

  // Debug log for initial props
  console.log("RejectionForm - Initial advancedSalaryData:", advancedSalaryData);

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
    reason: "",
  };

  // Form validation schema
  const validationSchema = Yup.object().shape({
    reason: Yup.string().required("Rejection reason is required"),
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
      
      console.log("Submitting rejection with:", {
        id: advancedSalary._id,
        status: "Rejected",
        reason: values.reason
      });
      
      const response = await updateStatus(advancedSalary._id, "Rejected");
      
      console.log("Rejection response:", response);

      if (response.success) {
        toast.success("Advanced salary rejected successfully");
        if (onSuccess) onSuccess();
      } else {
        console.error("Error response:", response);
        const errorMsg = response.message || "Failed to reject advanced salary";
        toast.error(errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Error rejecting advanced salary:", error);
      const errorMsg = error.message || "Error rejecting advanced salary";
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Formik hook
  const { values, errors, touched, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });

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
          <CancelOutlinedIcon color="error" />
          <Typography variant="h5">Reject Advanced Salary</Typography>
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
      </Grid>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="reason"
              label="Rejection Reason"
              value={values.reason}
              onChange={handleChange}
              error={Boolean(touched.reason && errors.reason)}
              helperText={touched.reason && errors.reason}
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
                color="error"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reject"
                )}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
} 