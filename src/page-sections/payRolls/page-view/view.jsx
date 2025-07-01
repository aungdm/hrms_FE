import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Stack,
  Divider,
  Button,
  LinearProgress,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Paragraph } from "@/components/typography";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import duotone from "@/icons/duotone";
import { getPayrollById, generatePayrollPdf } from "../request.js";
import { format } from "date-fns";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from 'xlsx';
import IncentivesDetail from "../IncentivesDetail";
import ArrearsDetail from "../ArrearsDetail";
import FineDeductionDetail from "../FineDeductionDetail";
import AdvancedSalaryDetail from "../AdvancedSalaryDetail";
import OtherDeductionDetail from "../OtherDeductionDetail";
import EditIcon from "@mui/icons-material/Edit";

// Format currency values
const formatCurrency = (amount) => {
  return `Rs. ${Number(amount).toLocaleString()}`;
};

// Status chip component for better visual representation
const StatusChip = ({ status }) => {
  let color = "default";
  
  switch (status) {
    case "Generated":
    case "Draft":
      color = "warning";
      break;
    case "Approved":
      color = "success";
      break;
    case "Paid":
      color = "info";
      break;
    case "Rejected":
    case "Cancelled":
      color = "error";
      break;
    default:
      color = "default";
  }
  
  return <Chip label={status} color={color} size="small" />;
};

export default function PayrollView() {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const Invoice = duotone.Invoice;

  const fetchPayrollDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try as hourly payroll
      let response = await getPayrollById(id, "Hourly");
      
      // If not found, try as monthly payroll
      if (!response.success) {
        response = await getPayrollById(id, "Monthly");
      }
      
      if (response.success) {
        setPayrollData(response.data);
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

  // Function to download payroll details as Excel
  const downloadExcel = () => {
    if (!payrollData) return;
    
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Basic employee info
      const basicInfo = [
        ['Payroll Details'],
        [''],
        ['Employee ID', payrollData.employeeId || '-'],
        ['Employee Name', payrollData.employeeName || '-'],
        ['Designation', payrollData.designation || '-'],
        ['Payroll Type', payrollData.payrollType || (payrollData.lateFines !== undefined ? 'Hourly' : 'Monthly')],
        ['Status', payrollData.status || '-'],
        ['Period', `${format(new Date(payrollData.startDate), 'dd/MM/yyyy')} - ${format(new Date(payrollData.endDate), 'dd/MM/yyyy')}`],
        ['']
      ];
      
      // Salary details - different for hourly and monthly employees
      let salaryDetails;
      if (payrollData.lateFines !== undefined) {
        // Hourly employee
        salaryDetails = [
          ['Salary Details'],
          ['Gross Salary', formatCurrency(payrollData.grossSalary || 0)],
          ['Per Hour Rate', formatCurrency(payrollData.perHourRate || 0)],
          ['Payable Hours', payrollData.payableHours || 0],
          ['Absent Days', payrollData.absentDays || 0],
          ['Absent Deductions', formatCurrency(payrollData.absentDeductions || 0)],
          ['Late Fines', formatCurrency(payrollData.lateFines || 0)],
          ['Other Deductions', formatCurrency(payrollData.otherDeductions || 0)],
          ['Missing Deduction', formatCurrency(payrollData.missingDeduction || 0)],
          ['Overtime Pay', formatCurrency(payrollData.overtimePay || 0)],
          ['Other Incentives', formatCurrency(payrollData.otherIncentives || 0)],
          ['Arrears', formatCurrency(payrollData.arrears || 0)],
          ['Fine Deductions', formatCurrency(payrollData.fineDeductions || 0)],
          ['Advanced Salary', formatCurrency(payrollData.advancedSalary || 0)],
          ['Net Salary', formatCurrency(payrollData.netSalary || 0)],
          [''],
          ['Note: First three late days are not charged with fines.'],
          ['Note: Absent days are charged at Rs. 10,000 per day for hourly employees.'],
          ['']
        ];
      } else {
        // Monthly employee
        salaryDetails = [
          ['Salary Details'],
          ['Monthly Gross Salary', formatCurrency(payrollData.grossSalary || 0)],
          ['Actual Gross Salary (Based on Hours)', formatCurrency(payrollData.actualGrossSalary || 0)],
          ['Absent Days', payrollData.absentDays || 0],
          ['Absent Deductions', formatCurrency(payrollData.absentDeductions || 0)],
          ['Other Deductions', formatCurrency(payrollData.otherDeductions || 0)],
          ['Missing Deduction', formatCurrency(payrollData.missingDeduction || 0)],
          ['Other Incentives', formatCurrency(payrollData.otherIncentives || 0)],
          ['Arrears', formatCurrency(payrollData.arrears || 0)],
          ['Fine Deductions', formatCurrency(payrollData.fineDeductions || 0)],
          ['Advanced Salary', formatCurrency(payrollData.advancedSalary || 0)],
          ['Net Salary', formatCurrency(payrollData.netSalary || 0)]
        ];
      }
      
      // Combine all data for the first sheet
      const allData = [...basicInfo, ...salaryDetails];
      
      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(allData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Payroll Summary');
      
      // Add incentives sheet if available
      if (payrollData.incentiveDetails && payrollData.incentiveDetails.length > 0) {
        // Create headers for incentives
        const incentiveHeaders = [
          ['Type', 'Date', 'Description', 'Amount']
        ];
        
        // Map incentives to array format
        const incentiveData = payrollData.incentiveDetails.map(incentive => {
          return [
            incentive.type || '-',
            incentive.date ? format(new Date(incentive.date), 'dd/MM/yyyy') : '-',
            incentive.description || '-',
            incentive.amount || 0
          ];
        });
        
        // Add total row
        incentiveData.push(['', '', 'Total', payrollData.otherIncentives || 0]);
        
        // Combine headers and data
        const incentiveSheet = [...incentiveHeaders, ...incentiveData];
        
        // Create worksheet for incentives
        const wsIncentives = XLSX.utils.aoa_to_sheet(incentiveSheet);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, wsIncentives, 'Incentives');
      }
      
      // Add arrears sheet if available
      if (payrollData.arrearsDetails && payrollData.arrearsDetails.length > 0) {
        // Create headers for arrears
        const arrearsHeaders = [
          ['Type', 'Date', 'Description', 'Amount']
        ];
        
        // Map arrears to array format
        const arrearsData = payrollData.arrearsDetails.map(arrear => {
          return [
            arrear.type || '-',
            arrear.date ? format(new Date(arrear.date), 'dd/MM/yyyy') : '-',
            arrear.description || '-',
            arrear.amount || 0
          ];
        });
        
        // Add total row
        arrearsData.push(['', '', 'Total', payrollData.arrears || 0]);
        
        // Combine headers and data
        const arrearsSheet = [...arrearsHeaders, ...arrearsData];
        
        // Create worksheet for arrears
        const wsArrears = XLSX.utils.aoa_to_sheet(arrearsSheet);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, wsArrears, 'Arrears');
      }
      
      // Add fine deductions sheet if available
      if (payrollData.fineDeductionDetails && payrollData.fineDeductionDetails.length > 0) {
        // Create headers for fine deductions
        const fineDeductionHeaders = [
          ['Type', 'Date', 'Description', 'Amount']
        ];
        
        // Map fine deductions to array format
        const fineDeductionData = payrollData.fineDeductionDetails.map(fine => {
          return [
            fine.type || '-',
            fine.date ? format(new Date(fine.date), 'dd/MM/yyyy') : '-',
            fine.description || '-',
            fine.amount || 0
          ];
        });
        
        // Add total row
        fineDeductionData.push(['', '', 'Total', payrollData.fineDeductions || 0]);
        
        // Combine headers and data
        const fineDeductionSheet = [...fineDeductionHeaders, ...fineDeductionData];
        
        // Create worksheet for fine deductions
        const wsFineDeductions = XLSX.utils.aoa_to_sheet(fineDeductionSheet);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, wsFineDeductions, 'Fine Deductions');
      }
      
      // Add other deduction sheet if available
      if (payrollData.otherDeductionDetails && payrollData.otherDeductionDetails.length > 0) {
        // Create headers for other deductions
        const otherDeductionHeaders = [
          ['Type', 'Date', 'Description', 'Amount']
        ];
        
        // Map other deductions to array format
        const otherDeductionData = payrollData.otherDeductionDetails.map(deduction => {
          return [
            deduction.type || '-',
            deduction.date ? format(new Date(deduction.date), 'dd/MM/yyyy') : '-',
            deduction.description || '-',
            deduction.amount || 0
          ];
        });
        
        // Add total row
        otherDeductionData.push(['', '', 'Total', payrollData.otherDeductions || 0]);
        
        // Combine headers and data
        const otherDeductionSheet = [...otherDeductionHeaders, ...otherDeductionData];
        
        // Create worksheet for other deductions
        const wsOtherDeductions = XLSX.utils.aoa_to_sheet(otherDeductionSheet);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, wsOtherDeductions, 'Other Deductions');
      }
      
      // Add advanced salary sheet if available
      if (payrollData.advancedSalaryDetails && payrollData.advancedSalaryDetails.length > 0) {
        // Create headers for advanced salary
        const advancedSalaryHeaders = [
          ['Date', 'Request Date', 'Description', 'Amount']
        ];
        
        // Map advanced salary to array format
        const advancedSalaryData = payrollData.advancedSalaryDetails.map(advSalary => {
          return [
            advSalary.date ? format(new Date(advSalary.date), 'dd/MM/yyyy') : '-',
            advSalary.requestDate ? format(new Date(advSalary.requestDate), 'dd/MM/yyyy') : '-',
            advSalary.description || '-',
            advSalary.amount || 0
          ];
        });
        
        // Add total row
        advancedSalaryData.push(['', '', 'Total', payrollData.advancedSalary || 0]);
        
        // Combine headers and data
        const advancedSalarySheet = [...advancedSalaryHeaders, ...advancedSalaryData];
        
        // Create worksheet for advanced salary
        const wsAdvancedSalary = XLSX.utils.aoa_to_sheet(advancedSalarySheet);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, wsAdvancedSalary, 'Advanced Salary');
      }
      
      // For hourly employees, add a second sheet with daily calculations
      if (payrollData.dailyCalculations && payrollData.dailyCalculations.length > 0) {
        // Create headers for daily calculations
        const dailyHeaders = payrollData.payrollType === "Hourly" ? [
          ['Date', 'Status', 'Payable Hours', 'Daily Pay', 'Late (mins)', 'Late Fine', 
           'Overtime (mins)', 'Overtime Pay', 'Absent Deduction', 'Total', 'Notes']
        ] : [
          ['Date', 'Status', 'Present', 'Deduction', 'Notes']
        ];
        
        // Map daily calculations to array format
        const dailyData = payrollData.dailyCalculations.map(day => {
          if (payrollData.payrollType === "Hourly") {
            return [
              day.date ? format(new Date(day.date), 'dd/MM/yyyy') : '-',
              day.status || '-',
              day.payableHours || '0.00',
              day.dailyPay || 0,
              day.lateArrival || 0,
              day.lateFine || 0,
              day.overtimeMinutes || 0,
              day.overtimePay || 0,
              day.absentDeduction || 0,
              day.totalDailyPay || 0,
              day.notes || '-'
            ];
          } else {
            return [
              day.date ? format(new Date(day.date), 'dd/MM/yyyy') : '-',
              day.status || '-',
              day.status !== 'Absent' && !day.isDayDeducted ? 'Yes' : 'No',
              day.dailyDeduction || day.otherDeduction || 0,
              day.notes || '-'
            ];
          }
        });
        
        // Combine headers and data
        const dailySheet = [...dailyHeaders, ...dailyData];
        
        // Create worksheet for daily calculations
        const wsDaily = XLSX.utils.aoa_to_sheet(dailySheet);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Calculations');
      }
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `Payroll_${payrollData.employeeName}_${format(new Date(payrollData.startDate), 'dd-MM-yyyy')}.xlsx`);
      
      toast.success("Excel file downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error generating Excel file");
    }
  };

  // Function to download payroll as PDF
  const downloadPdf = async () => {
    if (!payrollData) return;
    
    try {
      // Determine payroll type
      const payrollType = payrollData.payrollType || 
                         (payrollData.lateFines !== undefined ? 'Hourly' : 'Monthly');
      
      const response = await generatePayrollPdf(id, payrollType);
      
      if (response.success && response.pdfBlob) {
        // Create a URL for the blob and download it
        const url = window.URL.createObjectURL(response.pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Payslip_${payrollData.employeeName || 'Employee'}_${format(new Date(payrollData.startDate), 'dd-MM-yyyy')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success("PDF downloaded successfully");
      } else {
        const errorMessage = response.error || "Error generating PDF";
        console.error("PDF download failed:", response);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Error generating PDF");
    }
  };

  // Function to view payroll PDF in dialog
  const viewPdfInDialog = async () => {
    if (!payrollData) return;
    
    try {
      // Determine payroll type
      const payrollType = payrollData.payrollType || 
                         (payrollData.lateFines !== undefined ? 'Hourly' : 'Monthly');
      
      const response = await generatePayrollPdf(id, payrollType);
      
      if (response.success && response.pdfBlob) {
        const url = window.URL.createObjectURL(response.pdfBlob);
        setPdfUrl(url);
        setPdfDialogOpen(true);
      } else {
        const errorMessage = response.error || "Error preparing PDF view";
        console.error("PDF view failed:", response);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("PDF view error:", err);
      toast.error("Error opening PDF view");
    }
  };

  // Function to view payroll PDF in a new tab
  const viewPdfInTab = async () => {
    if (!payrollData) return;
    
    try {
      // Determine payroll type
      const payrollType = payrollData.payrollType || 
                         (payrollData.lateFines !== undefined ? 'Hourly' : 'Monthly');
      
      const response = await generatePayrollPdf(id, payrollType);
      
      if (response.success && response.pdfBlob) {
        const url = window.URL.createObjectURL(response.pdfBlob);
        window.open(url, '_blank');
        toast.success("PDF opened in new tab");
        
        // Clean up the URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        const errorMessage = response.error || "Error generating PDF";
        console.error("PDF view failed:", response);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("PDF view error:", err);
      toast.error("Error opening PDF");
    }
  };

  // Function to close PDF dialog and cleanup
  const handleClosePdfDialog = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfDialogOpen(false);
    setPdfUrl('');
  };

  // Determine if payroll is hourly or monthly
  const isHourly = payrollData?.lateFines !== undefined;

  return (
    <>
      <Card sx={{ p: 3 }}>
        <Box mb={3}>
          <Stack direction="row" alignItems="center" mb={1}>
            <IconWrapper>
              <Invoice sx={{ color: "primary.main" }} />
            </IconWrapper>
            <Typography variant="h5">Payroll Details</Typography>
          </Stack>
          <Typography color="text.secondary" variant="body2">
            View detailed information about this payroll record
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
          <>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Employee Information</Typography>
                  <StatusChip status={payrollData.status || "Generated"} />
                </Stack>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" width="30%">Employee ID</TableCell>
                        <TableCell>{payrollData.employeeId || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Employee Name</TableCell>
                        <TableCell>{payrollData.employeeName || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Designation</TableCell>
                        <TableCell>{payrollData.designation || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Payroll Type</TableCell>
                        <TableCell>{isHourly ? 'Hourly' : 'Monthly'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Payroll Period</TableCell>
                        <TableCell>
                          {payrollData.startDate && payrollData.endDate ? 
                            `${format(new Date(payrollData.startDate), 'dd/MM/yyyy')} - ${format(new Date(payrollData.endDate), 'dd/MM/yyyy')}` : 
                            '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>Salary Details</Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" width="30%">Monthly Gross Salary</TableCell>
                        <TableCell>{formatCurrency(payrollData.grossSalary || 0)}</TableCell>
                      </TableRow>
                      
                      {payrollData.actualGrossSalary !== undefined && (
                        <TableRow>
                          <TableCell component="th">Actual Gross Salary (Based on Hours)</TableCell>
                          <TableCell>{formatCurrency(payrollData.actualGrossSalary || 0)}</TableCell>
                        </TableRow>
                      )}
                      
                      {isHourly ? (
                        // Hourly employee specific fields
                        <>
                          <TableRow>
                            <TableCell component="th">Per Hour Rate</TableCell>
                            <TableCell>{formatCurrency(payrollData.hourlyRate || payrollData.perHourRate || (payrollData.grossSalary && payrollData.payableHours ? (payrollData.grossSalary / payrollData.payableHours).toFixed(2) : 0))}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Payable Hours</TableCell>
                            <TableCell>{payrollData.payableHours || payrollData.totalHours || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Absent Days</TableCell>
                            <TableCell>{payrollData.absentDays || 0}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Absent Deductions</TableCell>
                            <TableCell>{formatCurrency(payrollData.absentDeductions || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Late Fines</TableCell>
                            <TableCell>{formatCurrency(payrollData.lateFines || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Other Deductions</TableCell>
                            <TableCell sx={{ color: 'error.main' }}>{formatCurrency((payrollData.otherDeductions || 0) + (payrollData.fineDeductions || 0))}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Missing Deduction</TableCell>
                            <TableCell sx={{ color: 'error.main' }}>{formatCurrency(payrollData.missingDeduction || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Overtime Pay</TableCell>
                            <TableCell>{formatCurrency(payrollData.overtimePay || 0)}</TableCell>
                          </TableRow>
                          {payrollData.otherIncentives > 0 && (
                            <TableRow>
                              <TableCell component="th">Other Incentives</TableCell>
                              <TableCell sx={{ color: 'success.main' }}>{formatCurrency(payrollData.otherIncentives || 0)}</TableCell>
                            </TableRow>
                          )}
                          {payrollData.arrears > 0 && (
                            <TableRow>
                              <TableCell component="th">Arrears</TableCell>
                              <TableCell sx={{ color: 'success.main' }}>{formatCurrency(payrollData.arrears || 0)}</TableCell>
                            </TableRow>
                          )}
                          {payrollData.fineDeductions > 0 && (
                            <TableRow>
                              <TableCell component="th">Fine Deductions</TableCell>
                              <TableCell sx={{ color: 'error.main' }}>{formatCurrency(payrollData.fineDeductions || 0)}</TableCell>
                            </TableRow>
                          )}
                          {payrollData.advancedSalary > 0 && (
                            <TableRow>
                              <TableCell component="th">Advanced Salary</TableCell>
                              <TableCell sx={{ color: 'error.main' }}>{formatCurrency(payrollData.advancedSalary || 0)}</TableCell>
                            </TableRow>
                          )}
                        </>
                      ) : (
                        // Monthly employee specific fields
                        <>
                          <TableRow>
                            <TableCell component="th">Absent Days</TableCell>
                            <TableCell>{payrollData.absentDays || 0}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Absent Deductions</TableCell>
                            <TableCell>{formatCurrency(payrollData.absentDeductions || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Other Deductions</TableCell>
                            <TableCell sx={{ color: 'error.main' }}>{formatCurrency((payrollData.otherDeductions || 0) + (payrollData.fineDeductions || 0))}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Missing Deduction</TableCell>
                            <TableCell sx={{ color: 'error.main' }}>{formatCurrency(payrollData.missingDeduction || 0)}</TableCell>
                          </TableRow>
                          {payrollData.otherIncentives > 0 && (
                            <TableRow>
                              <TableCell component="th">Other Incentives</TableCell>
                              <TableCell sx={{ color: 'success.main' }}>{formatCurrency(payrollData.otherIncentives || 0)}</TableCell>
                            </TableRow>
                          )}
                          {payrollData.arrears > 0 && (
                            <TableRow>
                              <TableCell component="th">Arrears</TableCell>
                              <TableCell sx={{ color: 'success.main' }}>{formatCurrency(payrollData.arrears || 0)}</TableCell>
                            </TableRow>
                          )}
                          {payrollData.fineDeductions > 0 && (
                            <TableRow>
                              <TableCell component="th">Fine Deductions</TableCell>
                              <TableCell sx={{ color: 'error.main' }}>{formatCurrency(payrollData.fineDeductions || 0)}</TableCell>
                            </TableRow>
                          )}
                          {payrollData.advancedSalary > 0 && (
                            <TableRow>
                              <TableCell component="th">Advanced Salary</TableCell>
                              <TableCell sx={{ color: 'error.main' }}>{formatCurrency(payrollData.advancedSalary || 0)}</TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                      
                      <TableRow>
                        <TableCell component="th">Net Salary</TableCell>
                        <TableCell><strong>{formatCurrency(payrollData.netSalary || 0)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {isHourly && (
                  <Box sx={{ mt: 1, pl: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Note: First three late arrivals are not charged with fines.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Note: Absent days are charged at ₹10,000 per day for hourly employees.
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* Add Incentives Detail Section if incentives exist */}
              {payrollData.incentiveDetails && payrollData.incentiveDetails.length > 0 && (
                <Grid item xs={12} mt={2}>
                  <IncentivesDetail 
                    incentives={payrollData.incentiveDetails} 
                    totalAmount={payrollData.otherIncentives || 0} 
                  />
                </Grid>
              )}

              {/* Add Arrears Detail Section if arrears exist */}
              {payrollData.arrearsDetails && payrollData.arrearsDetails.length > 0 && (
                <Grid item xs={12} mt={2}>
                  <ArrearsDetail 
                    arrears={payrollData.arrearsDetails} 
                    totalAmount={payrollData.arrears || 0} 
                  />
                </Grid>
              )}

              {/* Add Fine Deduction Detail Section if fine deductions exist */}
              {payrollData.fineDeductionDetails && payrollData.fineDeductionDetails.length > 0 && (
                <Grid item xs={12} mt={2}>
                  <FineDeductionDetail 
                    fineDeductionDetails={payrollData.fineDeductionDetails} 
                    totalAmount={payrollData.fineDeductions || 0} 
                  />
                </Grid>
              )}

              {/* Add Advanced Salary Detail Section if advanced salary exists */}
              {payrollData.advancedSalaryDetails && payrollData.advancedSalaryDetails.length > 0 && (
                <Grid item xs={12} mt={2}>
                  <AdvancedSalaryDetail 
                    advancedSalaryDetails={payrollData.advancedSalaryDetails} 
                    totalAmount={payrollData.advancedSalary || 0} 
                  />
                </Grid>
              )}

              {/* Add Other Deduction Detail Section if other deductions exist */}
              {payrollData.otherDeductionDetails && payrollData.otherDeductionDetails.length > 0 && (
                <Grid item xs={12} mt={2}>
                  <OtherDeductionDetail 
                    otherDeductionDetails={payrollData.otherDeductionDetails} 
                    totalAmount={(payrollData.otherDeductions || 0) + (payrollData.fineDeductions || 0)} 
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} mt={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<FileDownloadIcon />}
                    onClick={downloadExcel}
                  >
                    Download Excel
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<PictureAsPdfIcon />}
                    onClick={downloadPdf}
                  >
                    Download PDF
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={viewPdfInTab}
                  >
                    View PDF in Tab
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={viewPdfInDialog}
                  >
                    View PDF in Dialog
                  </Button>
                  
                  {payrollData.status === "Generated" && (
                    <Button 
                      variant="contained"
                      color="primary" 
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/pay-rolls-edit/${id}`)}
                    >
                      Edit Payroll
                    </Button>
                  )}
                  
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/pay-rolls-list')}
                  >
                    Back to List
                  </Button>
                </Stack>
              </Grid>

              {/* Daily Calculations Section for Hourly Employees */}
              {isHourly && payrollData.dailyCalculations && payrollData.dailyCalculations.length > 0 && (
                <Grid item xs={12} mt={3}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box>
                      <Typography variant="h6" mb={1}>Daily Salary Calculations</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Detailed breakdown of daily work hours, payments, and deductions
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${payrollData.dailyCalculations.length} Days`} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Stack>
                  
                  <Card variant="outlined" sx={{ overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 500, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 } }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: 'grey.50', fontWeight: 600, fontSize: '0.875rem' } }}>
                            <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
                            <TableCell sx={{ minWidth: 80 }}>Status</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="center">Payable Hours</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="right">Daily Pay</TableCell>
                            <TableCell sx={{ minWidth: 80 }} align="center">Late (mins)</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="right">Late Fine</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="center">Overtime (mins)</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="right">Overtime Pay</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="right">Absent Deduction</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="right">Total</TableCell>
                            <TableCell sx={{ minWidth: 300 }}>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {payrollData.dailyCalculations.map((day, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:hover': { bgcolor: 'grey.50' },
                                '& td': { py: 1.5 }
                              }}
                            >
                              <TableCell sx={{ fontWeight: 500 }}>
                                {day.date ? format(new Date(day.date), 'dd/MM/yyyy') : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={day.status || 'N/A'} 
                                  size="small" 
                                  color={
                                    day.status === 'Present' ? 'success' :
                                    day.status === 'Absent' ? 'error' :
                                    day.status === 'Late' ? 'warning' :
                                    day.status === 'Half Day' ? 'info' :
                                    day.status === 'Missing Workdays' ? 'error' : 'default'
                                  }
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                {day.payableHours || '0.00'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                {formatCurrency(day.dailyPay || 0)}
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                color: (day.lateArrival && day.lateArrival > 0) ? 'warning.main' : 'text.secondary',
                                fontWeight: (day.lateArrival && day.lateArrival > 0) ? 500 : 400
                              }}>
                                {day.lateArrival || 0}
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                color: (day.lateFine && day.lateFine > 0) ? 'error.main' : 'text.secondary',
                                fontFamily: 'monospace',
                                fontWeight: (day.lateFine && day.lateFine > 0) ? 500 : 400
                              }}>
                                {formatCurrency(day.lateFine || 0)}
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                color: (day.overtimeMinutes && day.overtimeMinutes > 0) ? 'info.main' : 'text.secondary',
                                fontWeight: (day.overtimeMinutes && day.overtimeMinutes > 0) ? 500 : 400
                              }}>
                                {day.overtimeMinutes || 0}
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                color: (day.overtimePay && day.overtimePay > 0) ? 'success.main' : 'text.secondary',
                                fontFamily: 'monospace',
                                fontWeight: (day.overtimePay && day.overtimePay > 0) ? 500 : 400
                              }}>
                                {formatCurrency(day.overtimePay || 0)}
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                color: (day.absentDeduction && day.absentDeduction > 0) ? 'error.main' : 'text.secondary',
                                fontFamily: 'monospace',
                                fontWeight: (day.absentDeduction && day.absentDeduction > 0) ? 500 : 400
                              }}>
                                {formatCurrency(day.absentDeduction || 0)}
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                fontFamily: 'monospace', 
                                fontWeight: 600,
                                color: (day.totalDailyPay || 0) < 0 ? 'error.main' : 'success.main'
                              }}>
                                {formatCurrency(day.totalDailyPay || 0)}
                              </TableCell>
                              <TableCell sx={{ 
                                fontSize: '0.75rem', 
                                color: 'text.secondary',
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                <Box 
                                  component="span" 
                                  title={day.notes || '-'}
                                  sx={{ cursor: day.notes ? 'help' : 'default' }}
                                >
                                  {day.notes || '-'}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Summary Footer */}
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Days
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {payrollData.dailyCalculations.length}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Working Days
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {payrollData.dailyCalculations.filter(day => day.status === 'Present' || day.status === 'Late').length}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Payable Hours
                          </Typography>
                          <Typography variant="h6" color="info.main">
                            {payrollData.payableHours || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Net Amount
                          </Typography>
                          <Typography variant="h6" color={payrollData.netSalary >= 0 ? 'success.main' : 'error.main'}>
                            {formatCurrency(payrollData.netSalary || 0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Grid>
              )}

              {/* Daily Calculations Section for Monthly Employees */}
              {!isHourly && payrollData.dailyCalculations && payrollData.dailyCalculations.length > 0 && (
                <Grid item xs={12} mt={3}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box>
                      <Typography variant="h6" mb={1}>Daily Attendance Breakdown</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Daily attendance status and deductions for monthly salary calculation
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${payrollData.dailyCalculations.length} Days`} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Stack>
                  
                  <Card variant="outlined" sx={{ overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 400, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 } }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: 'grey.50', fontWeight: 600, fontSize: '0.875rem' } }}>
                            <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Status</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="center">Present</TableCell>
                            <TableCell sx={{ minWidth: 120 }} align="right">Deduction</TableCell>
                            <TableCell sx={{ minWidth: 300 }}>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {payrollData.dailyCalculations.map((day, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:hover': { bgcolor: 'grey.50' },
                                '& td': { py: 1.5 }
                              }}
                            >
                              <TableCell sx={{ fontWeight: 500 }}>
                                {day.date ? format(new Date(day.date), 'dd/MM/yyyy') : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={day.status || 'N/A'} 
                                  size="small" 
                                  color={
                                    day.status === 'Present' ? 'success' :
                                    day.status === 'Absent' ? 'error' :
                                    day.status === 'Leave' ? 'info' :
                                    day.status === 'Holiday' ? 'secondary' : 'default'
                                  }
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={day.status !== 'Absent' && !day.isDayDeducted ? 'Yes' : 'No'}
                                  size="small"
                                  color={day.status !== 'Absent' && !day.isDayDeducted ? 'success' : 'error'}
                                  variant="filled"
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                color: (day.dailyDeduction && day.dailyDeduction > 0) || (day.otherDeduction && day.otherDeduction > 0) ? 'error.main' : 'text.secondary',
                                fontFamily: 'monospace',
                                fontWeight: (day.dailyDeduction && day.dailyDeduction > 0) || (day.otherDeduction && day.otherDeduction > 0) ? 500 : 400
                              }}>
                                {formatCurrency(day.dailyDeduction || day.otherDeduction || 0)}
                              </TableCell>
                              <TableCell sx={{ 
                                fontSize: '0.75rem', 
                                color: 'text.secondary',
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                <Box 
                                  component="span" 
                                  title={day.notes || '-'}
                                  sx={{ cursor: day.notes ? 'help' : 'default' }}
                                >
                                  {day.notes || '-'}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Summary Footer for Monthly */}
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Days
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {payrollData.dailyCalculations.length}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Present Days
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {payrollData.dailyCalculations.filter(day => day.status !== 'Absent' && !day.isDayDeducted).length}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Absent Days
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {payrollData.absentDays || payrollData.dailyCalculations.filter(day => day.status === 'Absent' || day.isDayDeducted).length}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Net Salary
                          </Typography>
                          <Typography variant="h6" color={payrollData.netSalary >= 0 ? 'success.main' : 'error.main'}>
                            {formatCurrency(payrollData.netSalary || 0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Card>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={pdfDialogOpen}
        onClose={handleClosePdfDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Payslip PDF
          <IconButton
            aria-label="close"
            onClick={handleClosePdfDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {pdfUrl && (
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="600px" 
              title="Payslip PDF"
              style={{ border: 'none' }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 