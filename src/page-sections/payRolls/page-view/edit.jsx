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
  Chip,
} from "@mui/material";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import duotone from "@/icons/duotone";
import { getPayrollById, updatePayroll } from "../request.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

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
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  background: 'linear-gradient(to right, #f9f9f9, #ffffff)'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Employee Information</Typography>
                  <Chip 
                    label={payrollData.payrollType || 'Unknown'} 
                    color="primary" 
                    variant="outlined" 
                    size="small" 
                    sx={{ ml: 'auto' }}
                  />
                </Stack>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1" fontWeight={500}>{payrollData.employeeId || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary">Employee Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{payrollData.employeeName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary">Designation</Typography>
                      <Typography variant="body1" fontWeight={500}>{payrollData.designation || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary">Payroll Period</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {payrollData.startDate && payrollData.endDate 
                          ? `${format(new Date(payrollData.startDate), 'dd/MM/yyyy')} - ${format(new Date(payrollData.endDate), 'dd/MM/yyyy')}` 
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Box mt={0.5}>
                        <FormControl fullWidth size="small">
                          <Select
                            name="status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                            sx={{ fontWeight: 500 }}
                          >
                            <MenuItem value="Generated">Generated</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Editable Fields */}
            <Grid item xs={12}>
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  background: 'linear-gradient(to right, #f9f9f9, #ffffff)'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Box 
                    sx={{ 
                      bgcolor: 'success.main', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>Salary Details</Typography>
                </Stack>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary">Gross Salary</Typography>
                      <TextField
                        fullWidth
                        name="grossSalary"
                        type="number"
                        value={formik.values.grossSalary}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.grossSalary && Boolean(formik.errors.grossSalary)}
                        helperText={formik.touched.grossSalary && formik.errors.grossSalary}
                        size="small"
                        sx={{ mt: 0.5 }}
                        InputProps={{
                          startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Hourly Specific Fields */}
                  {payrollData.payrollType === "Hourly" && (
                    <>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="caption" color="text.secondary">Late Fines</Typography>
                          <TextField
                            fullWidth
                            name="lateFines"
                            type="number"
                            value={formik.values.lateFines}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.lateFines && Boolean(formik.errors.lateFines)}
                            helperText={formik.touched.lateFines && formik.errors.lateFines}
                            size="small"
                            sx={{ mt: 0.5 }}
                            InputProps={{
                              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="caption" color="text.secondary">Other Deductions</Typography>
                          <TextField
                            fullWidth
                            name="otherDeductions"
                            type="number"
                            value={formik.values.otherDeductions}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.otherDeductions && Boolean(formik.errors.otherDeductions)}
                            helperText={formik.touched.otherDeductions && formik.errors.otherDeductions}
                            size="small"
                            sx={{ mt: 0.5 }}
                            InputProps={{
                              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="caption" color="text.secondary">Overtime Pay</Typography>
                          <TextField
                            fullWidth
                            name="overtimePay"
                            type="number"
                            value={formik.values.overtimePay}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.overtimePay && Boolean(formik.errors.overtimePay)}
                            helperText={formik.touched.overtimePay && formik.errors.overtimePay}
                            size="small"
                            sx={{ mt: 0.5 }}
                            InputProps={{
                              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="caption" color="text.secondary">Missing Deduction</Typography>
                          <TextField
                            fullWidth
                            name="missingDeduction"
                            type="number"
                            value={formik.values.missingDeduction}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.missingDeduction && Boolean(formik.errors.missingDeduction)}
                            helperText={formik.touched.missingDeduction && formik.errors.missingDeduction ? 
                              formik.errors.missingDeduction : 
                              "Additional deductions not covered by other categories"}
                            size="small"
                            sx={{ mt: 0.5 }}
                            InputProps={{
                              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                            }}
                          />
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Monthly Specific Fields */}
                  {payrollData.payrollType === "Monthly" && (
                    <>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="caption" color="text.secondary">Absent Deductions</Typography>
                          <TextField
                            fullWidth
                            name="absentDeductions"
                            type="number"
                            value={formik.values.absentDeductions}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.absentDeductions && Boolean(formik.errors.absentDeductions)}
                            helperText={formik.touched.absentDeductions && formik.errors.absentDeductions}
                            size="small"
                            sx={{ mt: 0.5 }}
                            InputProps={{
                              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="caption" color="text.secondary">Other Deductions</Typography>
                          <TextField
                            fullWidth
                            name="otherDeductions"
                            type="number"
                            value={formik.values.otherDeductions}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.otherDeductions && Boolean(formik.errors.otherDeductions)}
                            helperText={formik.touched.otherDeductions && formik.errors.otherDeductions}
                            size="small"
                            sx={{ mt: 0.5 }}
                            InputProps={{
                              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="caption" color="text.secondary">Missing Deduction</Typography>
                          <TextField
                            fullWidth
                            name="missingDeduction"
                            type="number"
                            value={formik.values.missingDeduction}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.missingDeduction && Boolean(formik.errors.missingDeduction)}
                            helperText={formik.touched.missingDeduction && formik.errors.missingDeduction ? 
                              formik.errors.missingDeduction : 
                              "Additional deductions not covered by other categories"}
                            size="small"
                            sx={{ mt: 0.5 }}
                            InputProps={{
                              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>Rs.</Box>,
                            }}
                          />
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>

                {/* Read-only Fields */}
                <Typography variant="subtitle2" color="text.secondary" mt={3} mb={1} sx={{ fontWeight: 500 }}>
                  Additional Information
                </Typography>

                <Grid container spacing={2}>
                  {payrollData.payrollType === "Hourly" && (
                    <>
                      <Grid item xs={6} md={2}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'action.hover',
                          border: '1px dashed',
                          borderColor: 'divider',
                          height: '100%'
                        }}>
                          <Typography variant="caption" color="text.secondary">Per Hour Rate</Typography>
                          <Typography variant="body1" fontWeight={500} color="primary.main">
                            Rs. {payrollData.perHourRate?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'action.hover',
                          border: '1px dashed',
                          borderColor: 'divider',
                          height: '100%'
                        }}>
                          <Typography variant="caption" color="text.secondary">Payable Hours</Typography>
                          <Typography variant="body1" fontWeight={500} color="primary.main">
                            {payrollData.payableHours?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'action.hover',
                          border: '1px dashed',
                          borderColor: 'divider',
                          height: '100%'
                        }}>
                          <Typography variant="caption" color="text.secondary">Absent Days</Typography>
                          <Typography variant="body1" fontWeight={500} color="error.main">
                            {payrollData.absentDays || '0'}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {payrollData.payrollType === "Monthly" && (
                    <>
                      <Grid item xs={6} md={2}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: 'action.hover',
                          border: '1px dashed',
                          borderColor: 'divider',
                          height: '100%'
                        }}>
                          <Typography variant="caption" color="text.secondary">Absent Days</Typography>
                          <Typography variant="body1" fontWeight={500} color="error.main">
                            {payrollData.absentDays || '0'}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Common Read-only Fields */}
                  <Grid item xs={6} md={2}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'action.hover',
                      border: '1px dashed',
                      borderColor: 'divider',
                      height: '100%'
                    }}>
                      <Typography variant="caption" color="text.secondary">Other Incentives</Typography>
                      <Typography variant="body1" fontWeight={500} color="success.main">
                        Rs. {payrollData.otherIncentives?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'action.hover',
                      border: '1px dashed',
                      borderColor: 'divider',
                      height: '100%'
                    }}>
                      <Typography variant="caption" color="text.secondary">Arrears</Typography>
                      <Typography variant="body1" fontWeight={500} color="success.main">
                        Rs. {payrollData.arrears?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'action.hover',
                      border: '1px dashed',
                      borderColor: 'divider',
                      height: '100%'
                    }}>
                      <Typography variant="caption" color="text.secondary">Fine Deductions</Typography>
                      <Typography variant="body1" fontWeight={500} color="error.main">
                        Rs. {payrollData.fineDeductions?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'action.hover',
                      border: '1px dashed',
                      borderColor: 'divider',
                      height: '100%'
                    }}>
                      <Typography variant="caption" color="text.secondary">Advanced Salary</Typography>
                      <Typography variant="body1" fontWeight={500} color="error.main">
                        Rs. {payrollData.advancedSalary?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={2} mt={1}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'primary.50',
                      border: '1px solid',
                      borderColor: 'primary.100',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Typography variant="caption" color="text.secondary">Current Net Salary</Typography>
                      <Typography variant="h5" fontWeight={600} color="primary.main">
                        Rs. {payrollData.netSalary?.toLocaleString() || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: calculatedNetSalary >= 0 ? 'success.50' : 'error.50',
                      border: '1px solid',
                      borderColor: calculatedNetSalary >= 0 ? 'success.100' : 'error.100',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Typography variant="caption" color="text.secondary">Calculated Net Salary</Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight={600} 
                        color={calculatedNetSalary >= 0 ? 'success.main' : 'error.main'}
                      >
                        Rs. {calculatedNetSalary?.toLocaleString() || '0.00'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mt={0.5}>
                        Based on your changes
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="flex-end"
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/pay-rolls-view/${id}`)}
                    startIcon={<CloseIcon />}
                    sx={{ px: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={processing || !formik.isValid}
                    startIcon={<SaveIcon />}
                    sx={{ px: 3 }}
                  >
                    {processing ? "Updating..." : "Update Payroll"}
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </form>
      )}
    </Card>
  );
} 