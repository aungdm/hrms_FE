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
          ['Late Fines', formatCurrency(payrollData.lateFines || 0)],
          ['Other Deductions', formatCurrency(payrollData.otherDeductions || 0)],
          ['Overtime Pay', formatCurrency(payrollData.overtimePay || 0)],
          ['Net Salary', formatCurrency(payrollData.netSalary || 0)],
          [''],
          ['Note: First three late days are not charged with fines.'],
          ['']
        ];
      } else {
        // Monthly employee
        salaryDetails = [
          ['Salary Details'],
          ['Gross Salary', formatCurrency(payrollData.grossSalary || 0)],
          ['Absent Deductions', formatCurrency(payrollData.absentDeductions || 0)],
          ['Other Deductions', formatCurrency(payrollData.otherDeductions || 0)],
          ['Net Salary', formatCurrency(payrollData.netSalary || 0)]
        ];
      }
      
      // Combine all data for the first sheet
      const allData = [...basicInfo, ...salaryDetails];
      
      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(allData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Payroll Summary');
      
      // For hourly employees, add a second sheet with daily calculations
      if (payrollData.lateFines !== undefined && payrollData.dailyCalculations && payrollData.dailyCalculations.length > 0) {
        // Create headers for daily calculations
        const dailyHeaders = [
          ['Date', 'Status', 'Regular Hours', 'Daily Pay', 'Late (mins)', 'Late Fine', 
           'Overtime (mins)', 'Overtime Pay', 'Total', 'Notes']
        ];
        
        // Map daily calculations to array format
        const dailyData = payrollData.dailyCalculations.map(day => [
          day.date ? format(new Date(day.date), 'dd/MM/yyyy') : '-',
          day.status || '-',
          day.regularHours || 0,
          day.dailyPay || 0,
          day.lateArrival || 0,
          day.lateFine || 0,
          day.overtimeMinutes || 0,
          day.overtimePay || 0,
          day.totalDailyPay || 0,
          day.notes || '-'
        ]);
        
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
                        <TableCell component="th" width="30%">Gross Salary</TableCell>
                        <TableCell>{formatCurrency(payrollData.grossSalary || 0)}</TableCell>
                      </TableRow>
                      
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
                            <TableCell component="th">Late Fines</TableCell>
                            <TableCell>{formatCurrency(payrollData.lateFines || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Other Deductions</TableCell>
                            <TableCell>{formatCurrency(payrollData.otherDeductions || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Overtime Pay</TableCell>
                            <TableCell>{formatCurrency(payrollData.overtimePay || 0)}</TableCell>
                          </TableRow>
                        </>
                      ) : (
                        // Monthly employee specific fields
                        <>
                          <TableRow>
                            <TableCell component="th">Absent Deductions</TableCell>
                            <TableCell>{formatCurrency(payrollData.absentDeductions || 0)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th">Other Deductions</TableCell>
                            <TableCell>{formatCurrency(payrollData.otherDeductions || 0)}</TableCell>
                          </TableRow>
                        </>
                      )}
                      
                      <TableRow>
                        <TableCell component="th">Net Salary</TableCell>
                        <TableCell><strong>{formatCurrency(payrollData.netSalary || 0)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

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
                  <Typography variant="h6" mb={2}>Daily Salary Calculations</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Note: First three late days are not charged with fines.
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Regular Hours</TableCell>
                          <TableCell>Daily Pay</TableCell>
                          <TableCell>Late (mins)</TableCell>
                          <TableCell>Late Fine</TableCell>
                          <TableCell>Overtime (mins)</TableCell>
                          <TableCell>Overtime Pay</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payrollData.dailyCalculations.map((day, index) => (
                          <TableRow key={index}>
                            <TableCell>{day.date ? format(new Date(day.date), 'dd/MM/yyyy') : '-'}</TableCell>
                            <TableCell>{day.status || '-'}</TableCell>
                            <TableCell>{day.regularHours || 0}</TableCell>
                            <TableCell>{formatCurrency(day.dailyPay || 0)}</TableCell>
                            <TableCell>{day.lateArrival || 0}</TableCell>
                            <TableCell>{formatCurrency(day.lateFine || 0)}</TableCell>
                            <TableCell>{day.overtimeMinutes || 0}</TableCell>
                            <TableCell>{formatCurrency(day.overtimePay || 0)}</TableCell>
                            <TableCell>{formatCurrency(day.totalDailyPay || 0)}</TableCell>
                            <TableCell>{day.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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