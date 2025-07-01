import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Divider,
  LinearProgress,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import duotone from "@/icons/duotone";
import { getPayrollById, updatePayroll } from "../request.js";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function EditView() {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [calculatedNetSalary, setCalculatedNetSalary] = useState(0);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const EditIcon = duotone.Edit;

  // Form validation schema - dynamically changes based on payroll type
  const getValidationSchema = (payrollType) => {
    const baseSchema = {
      grossSalary: Yup.number().min(0, "Gross salary must be positive").required("Gross salary is required"),
      status: Yup.string().required("Status is required"),
    };
    
    if (payrollType === "Hourly") {
      return Yup.object().shape({
        ...baseSchema,
        lateFines: Yup.number().min(0, "Late fines must be positive").required("Late fines is required"),
        otherDeductions: Yup.number().min(0, "Other deductions must be positive").required("Other deductions is required"),
        overtimePay: Yup.number().min(0, "Overtime pay must be positive").required("Overtime pay is required"),
        missingDeduction: Yup.number().min(0, "Missing deduction must be positive").required("Missing deduction is required"),
      });
    } else {
      return Yup.object().shape({
        ...baseSchema,
        absentDeductions: Yup.number().min(0, "Absent deductions must be positive").required("Absent deductions is required"),
        otherDeductions: Yup.number().min(0, "Other deductions must be positive").required("Other deductions is required"),
        missingDeduction: Yup.number().min(0, "Missing deduction must be positive").required("Missing deduction is required"),
      });
    }
  };

  // Formik hook
  const formik = useFormik({
    initialValues: {
      grossSalary: 0,
      status: "Generated",
      payrollType: "",
      lateFines: 0,
      otherDeductions: 0,
      overtimePay: 0,
      absentDeductions: 0,
      missingDeduction: 0,
    },
    validationSchema: () => getValidationSchema(payrollData?.payrollType),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setProcessing(true);
        
        // Prepare payload based on payroll type
        let payload;
        if (values.payrollType === "Hourly") {
          payload = {
            grossSalary: values.grossSalary,
            lateFines: values.lateFines,
            otherDeductions: values.otherDeductions,
            overtimePay: values.overtimePay,
            status: values.status,
            missingDeduction: values.missingDeduction,
          };
          
          // Recalculate net salary if not provided
          if (payrollData) {
            const netSalary = 
              (payrollData.actualGrossSalary || payrollData.grossSalary) - 
              values.lateFines - 
              values.otherDeductions + 
              values.overtimePay + 
              (payrollData.otherIncentives || 0) + 
              (payrollData.arrears || 0) - 
              (payrollData.fineDeductions || 0) - 
              (payrollData.advancedSalary || 0) - 
              (payrollData.absentDeductions || 0) - 
              values.missingDeduction;
            
            payload.netSalary = netSalary;
          }
        } else {
          payload = {
            grossSalary: values.grossSalary,
            absentDeductions: values.absentDeductions,
            otherDeductions: values.otherDeductions,
            status: values.status,
            missingDeduction: values.missingDeduction,
          };
          
          // Recalculate net salary if not provided
          if (payrollData) {
            const netSalary = 
              values.grossSalary - 
              values.absentDeductions - 
              values.otherDeductions + 
              (payrollData.otherIncentives || 0) + 
              (payrollData.arrears || 0) - 
              (payrollData.fineDeductions || 0) - 
              (payrollData.advancedSalary || 0) - 
              values.missingDeduction;
            
            payload.netSalary = netSalary;
          }
        }

        const response = await updatePayroll(id, payload, values.payrollType);
        
        if (response.success) {
          toast.success("Payroll updated successfully");
          // Navigate back to view page
          navigate(`/pay-rolls-view/${id}`);
        } else {
          toast.error(response.message || "Error updating payroll");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating payroll");
      } finally {
        setProcessing(false);
      }
    },
  });

  // Fetch payroll details
  const fetchPayrollDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try as hourly payroll
      let response = await getPayrollById(id, "Hourly");
      let payrollType = "Hourly";
      
      // If not found, try as monthly payroll
      if (!response.success) {
        response = await getPayrollById(id, "Monthly");
        payrollType = "Monthly";
      }
      
      if (response.success) {
        const data = response.data;
        data.payrollType = data.payrollType || payrollType;
        setPayrollData(data);
      } else {
        setError("Payroll record not found");
        toast.error("Payroll record not found");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching payroll details");
      toast.error("Error fetching payroll details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPayrollDetails();
  }, [fetchPayrollDetails]);

  // Set form values when payrollData changes
  useEffect(() => {
    if (payrollData && formik) {
      formik.setValues({
        grossSalary: payrollData.grossSalary || 0,
        status: payrollData.status || "Generated",
        payrollType: payrollData.payrollType,
        missingDeduction: payrollData.missingDeduction || 0,
        ...(payrollData.payrollType === "Hourly" ? {
          lateFines: payrollData.lateFines || 0,
          otherDeductions: payrollData.otherDeductions || 0,
          overtimePay: payrollData.overtimePay || 0,
        } : {
          absentDeductions: payrollData.absentDeductions || 0,
          otherDeductions: payrollData.otherDeductions || 0,
        }),
      });
    }
  }, [payrollData]);

  // Calculate net salary whenever form values change
  useEffect(() => {
    if (!payrollData) return;
    
    let netSalary = 0;
    
    if (payrollData.payrollType === "Hourly") {
      netSalary = 
        (payrollData.actualGrossSalary || formik.values.grossSalary) - 
        formik.values.lateFines - 
        formik.values.otherDeductions + 
        formik.values.overtimePay + 
        (payrollData.otherIncentives || 0) + 
        (payrollData.arrears || 0) - 
        (payrollData.fineDeductions || 0) - 
        (payrollData.advancedSalary || 0) - 
        (payrollData.absentDeductions || 0) - 
        formik.values.missingDeduction;
    } else {
      netSalary = 
        formik.values.grossSalary - 
        formik.values.absentDeductions - 
        formik.values.otherDeductions + 
        (payrollData.otherIncentives || 0) + 
        (payrollData.arrears || 0) - 
        (payrollData.fineDeductions || 0) - 
        (payrollData.advancedSalary || 0) - 
        formik.values.missingDeduction;
    }
    
    setCalculatedNetSalary(netSalary);
  }, [formik.values, payrollData]);

  return (
    <Card sx={{ p: 3 }}>
      <Box mb={3}>
        <Stack direction="row" alignItems="center" mb={1}>
          <IconWrapper>
            <EditIcon sx={{ color: "primary.main" }} />
          </IconWrapper>
          <Typography variant="h5">Edit Payroll</Typography>
        </Stack>
        <Typography color="text.secondary" variant="body2">
          Update payroll information for {payrollData?.employeeName || "employee"}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {loading && (
        <Box my={3}>
          <LinearProgress />
          <Typography mt={1} align="center">
            Loading payroll details...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {!loading && !error && payrollData && (
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Employee Information - Read Only */}
            <Grid item xs={12}>
              <Typography variant="h6" mb={2}>Employee Information</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    value={payrollData.employeeName || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={payrollData.designation || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Payroll Type"
                    value={payrollData.payrollType || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Editable Fields */}
            <Grid item xs={12}>
              <Typography variant="h6" mb={2}>Salary Details</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Gross Salary"
                    name="grossSalary"
                    type="number"
                    value={formik.values.grossSalary}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.grossSalary && Boolean(formik.errors.grossSalary)}
                    helperText={formik.touched.grossSalary && formik.errors.grossSalary}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formik.values.status}
                      label="Status"
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="Generated">Generated</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Hourly Specific Fields */}
                {payrollData.payrollType === "Hourly" && (
                  <>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Late Fines"
                        name="lateFines"
                        type="number"
                        value={formik.values.lateFines}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.lateFines && Boolean(formik.errors.lateFines)}
                        helperText={formik.touched.lateFines && formik.errors.lateFines}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Other Deductions"
                        name="otherDeductions"
                        type="number"
                        value={formik.values.otherDeductions}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.otherDeductions && Boolean(formik.errors.otherDeductions)}
                        helperText={formik.touched.otherDeductions && formik.errors.otherDeductions}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Overtime Pay"
                        name="overtimePay"
                        type="number"
                        value={formik.values.overtimePay}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.overtimePay && Boolean(formik.errors.overtimePay)}
                        helperText={formik.touched.overtimePay && formik.errors.overtimePay}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Missing Deduction"
                        name="missingDeduction"
                        type="number"
                        value={formik.values.missingDeduction}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.missingDeduction && Boolean(formik.errors.missingDeduction)}
                        helperText={formik.touched.missingDeduction && formik.errors.missingDeduction ? 
                          formik.errors.missingDeduction : 
                          "Additional deductions not covered by other categories"}
                      />
                    </Grid>
                  </>
                )}

                {/* Monthly Specific Fields */}
                {payrollData.payrollType === "Monthly" && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Absent Deductions"
                        name="absentDeductions"
                        type="number"
                        value={formik.values.absentDeductions}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.absentDeductions && Boolean(formik.errors.absentDeductions)}
                        helperText={formik.touched.absentDeductions && formik.errors.absentDeductions}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Other Deductions"
                        name="otherDeductions"
                        type="number"
                        value={formik.values.otherDeductions}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.otherDeductions && Boolean(formik.errors.otherDeductions)}
                        helperText={formik.touched.otherDeductions && formik.errors.otherDeductions}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Missing Deduction"
                        name="missingDeduction"
                        type="number"
                        value={formik.values.missingDeduction}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.missingDeduction && Boolean(formik.errors.missingDeduction)}
                        helperText={formik.touched.missingDeduction && formik.errors.missingDeduction ? 
                          formik.errors.missingDeduction : 
                          "Additional deductions not covered by other categories"}
                      />
                    </Grid>
                  </>
                )}

                {/* Read-only Fields */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" mt={2} mb={1}>
                    Additional Information (Not Editable)
                  </Typography>
                </Grid>

                {payrollData.payrollType === "Hourly" && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Per Hour Rate"
                        value={payrollData.perHourRate || 0}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Payable Hours"
                        value={payrollData.payableHours || 0}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Absent Days"
                        value={payrollData.absentDays || 0}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </>
                )}

                {payrollData.payrollType === "Monthly" && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Absent Days"
                        value={payrollData.absentDays || 0}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </>
                )}

                {/* Common Read-only Fields */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Other Incentives"
                    value={payrollData.otherIncentives || 0}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Arrears"
                    value={payrollData.arrears || 0}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Fine Deductions"
                    value={payrollData.fineDeductions || 0}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Advanced Salary"
                    value={payrollData.advancedSalary || 0}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Current Net Salary"
                    value={payrollData.netSalary || 0}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Calculated Net Salary"
                    value={calculatedNetSalary}
                    InputProps={{ 
                      readOnly: true,
                      sx: { 
                        fontWeight: 'bold',
                        color: calculatedNetSalary >= 0 ? 'success.main' : 'error.main',
                        '& .MuiInputBase-input': {
                          fontWeight: 'bold',
                          color: calculatedNetSalary >= 0 ? 'success.main' : 'error.main',
                        }
                      }
                    }}
                    helperText="This is the calculated net salary based on your changes"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/pay-rolls-view/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={processing || !formik.isValid}
                >
                  {processing ? "Updating..." : "Update Payroll"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Card>
  );
} 