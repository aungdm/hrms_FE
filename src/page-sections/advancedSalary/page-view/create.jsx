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
  FormHelperText,
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
} from "../request.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

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
    requestedAmount: "",
    totalInstallments: "",
    description: "",
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    employeeId: Yup.object().nullable().required("Employee selection is required"),
    requestedAmount: Yup.number().positive("Amount must be positive").required("Requested amount is required"),
    totalInstallments: Yup.number().positive("Installments must be positive").integer("Installments must be whole numbers").required("Total installments is required"),
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
          requestedAmount: parseFloat(values.requestedAmount),
          totalInstallments: parseInt(values.totalInstallments, 10),
          description: values.description || "",
        };
        
        let response;
        
        if (!mode) {
          // Create new loan
          response = await create(formData);
          if (response.success) {
            toast.success(response.message || "Loan request created successfully");
            resetForm();
            navigate("/loan-list");
          } else {
            toast.error(response.message || "Failed to create loan request");
          }
        } else if (mode === "edit") {
          // Update existing loan
          response = await update(id, formData);
          if (response.success) {
            toast.success(response.message || "Loan updated successfully");
            navigate("/loan");
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
      setLoading(true);
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
      setLoading(false);
    }
  }, []);

  // Fetch record for edit/view mode
  const fetchRecord = async (id) => {
    try {
      setLoading(true);
      const response = await get(id);
      
      if (response.success) {
        const { employeeId, requestedAmount, totalInstallments, description } = response.data;
        
        // Find the employee object from the employees array
        const employeeObj = employees.find(emp => emp._id === employeeId._id) || employeeId;
        
        setValues({
          employeeId: employeeObj,
          requestedAmount: requestedAmount || "",
          totalInstallments: totalInstallments || "",
          description: description || "",
        });
      } else {
        toast.error("Failed to load loan details");
        navigate("/loan");
      }
    } catch (error) {
      console.error("Error fetching loan:", error);
      toast.error("Error loading loan details");
      navigate("/loan");
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
    } else if (location.pathname.includes("edit")) {
      setMode("edit");
      if (id) fetchRecord(id);
    }
  }, [id, location.pathname, employees]);

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

          {mode !== "view" && (
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate("/loan")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {mode === "edit" ? "Update" : "Submit"}
                </Button>
              </Stack>
            </Grid>
          )}

          {mode === "view" && (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={() => navigate("/loan")}
              >
                Back
              </Button>
            </Grid>
          )}
        </Grid>
      </form>
    </Card>
  );
}
