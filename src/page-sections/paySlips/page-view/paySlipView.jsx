import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  Stack,
  styled,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
} from "@mui/material";
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import { Paragraph, H6, Small } from "@/components/typography";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import FlexBox from "@/components/flexbox/FlexBox.jsx";
import Autocomplete from "@mui/material/Autocomplete";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  create,
  update,
  // searchEmployees,
  get,
  // updateSalary,
} from "../request.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useDebounce from "@/hooks/debounceHook.js";
import { format } from "date-fns";
import { toast } from "react-toastify";
import axios from "axios";
import HistoryIcon from "@mui/icons-material/History";
// import CompanyLogo from "@/assets/company-logo.png"; // Make sure to add your company logo

// Styled components
const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3),
}));

const InfoItem = ({ label, value, isLoading }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Box sx={{ backgroundColor: "#f9f9f9", padding: "10px" }}>
      <Small color="black" mb={0.5} display="block">
        {label}
      </Small>
    </Box>
    <Typography fontSize={12} color="text.primary" padding="10px">
      {value || "N/A"}
    </Typography>
  </Grid>
);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  "&.header": {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
  },
}));

const LOADING_TIMEOUT = 5000; // 5 seconds timeout

const PayItemsTable = ({ payItems, isLoading, onHistoryClick }) => {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (isLoading) {
      // Set a timeout to hide skeleton after LOADING_TIMEOUT
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, LOADING_TIMEOUT);

      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading]);

  const defaultPayItems = [
    { name: "Leave Deduction", value: 21333, manuallyUpdated: true },
    { name: "Standard Salary", value: 160000, manuallyUpdated: false },
    { name: "Monthly Basic Salary", value: 160000, manuallyUpdated: false },
    { name: "Commission", value: 0, manuallyUpdated: false },
    { name: "Other Incentives", value: 0, manuallyUpdated: false },
    { name: "Arrear's", value: 0, manuallyUpdated: false },
    { name: "Other Deduction", value: 0, manuallyUpdated: false },
    { name: "Personal Loan", value: 0, manuallyUpdated: false },
    { name: "Advance Against Salary", value: 0, manuallyUpdated: false },
  ];

  if (showSkeleton && isLoading) {
    return <Skeleton height={400} />;
  }

  // Use API data if available, otherwise use default data
  const items = payItems || defaultPayItems;

  return (
    <Card sx={{ mt: 3 }}>
      <Box p={2}>
        <Typography variant="h6" component="h2" mb={2}>
          Payitems
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell className="header">Name</StyledTableCell>
              <StyledTableCell className="header">Value</StyledTableCell>
              <StyledTableCell className="header" align="center">
                Manually Updated
              </StyledTableCell>
              <StyledTableCell className="header" align="center">
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.name} hover>
                <StyledTableCell sx={{ backgroundColor: "grey.50" }}>
                  {item.name}
                </StyledTableCell>
                <StyledTableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography component="span" color="text.secondary">
                      Rs
                    </Typography>
                    {item.value.toLocaleString()}
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Checkbox checked={item.manuallyUpdated} disabled />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onHistoryClick(item.name)}
                    title="View History"
                  >
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.75),
  backgroundColor: "#9ca3af",
  color: "white",
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  fontSize: '0.875rem'
}));

const InfoGrid = styled(Grid)(({ theme }) => ({
  "& .label": {
    color: theme.palette.text.secondary,
    width: "150px",
    display: "inline-block",
    fontSize: '0.75rem'
  },
  "& .value": {
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '0.75rem'
  }
}));

const PaySlipView = () => {
  const employeeInfo = {
    code: "DHPL-02001",
    name: "Syed Aun Muhammad Hussain Shah",
    doj: "June 5, 2024",
    jobTitle: "Project Manager",
    department: "Research & Development",
    branch: "Head Office",
    location: "Lahore",
    month: "January, 2025",
    salary: "PKR 160,000"
  };

  const attendanceInfo = {
    presents: "15",
    missings: "4",
    absents: "4",
    lateArrivals: "14",
    earlyLefts: "5",
    restDays: "0",
    shortDuration: "0",
    leaves: "0",
    relaxation: "0",
    holidays: "0",
    dayoffs: "8",
    expectedHours: "207h",
    workedHours: "122h 56m"
  };

  const earnings = {
    standardSalary: 160000,
    monthlyBasicSalary: 160000,
    total: 160000
  };

  const deductions = {
    leaveDeduction: 21333,
    total: 21333
  };

  const netTransfer = {
    amount: 138667,
    inWords: "One Hundred Thirty Eight Thousand Six Hundred Sixty Seven"
  };

  return (
    <Card sx={{ p: 2, maxWidth: 1000, margin: "auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2}>
        {/*   <img src={CompanyLogo} alt="Company Logo" style={{ height: 40 }} /> */}
        <Box ml={2}>
          <H6 sx={{ fontSize: '1rem', mb: 0.5 }}>D-Hoppers Pvt Ltd</H6>
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Payslip</Typography>
        </Box>
      </Box>

      {/* Employee Info Section */}
      <Box mb={2}>
        <SectionHeader>Employee Info</SectionHeader>
        <Grid container spacing={1}>
          <InfoGrid item xs={12} md={6}>
            <Box mb={0.75}><span className="label">Code</span><span className="value">{employeeInfo.code}</span></Box>
            <Box mb={0.75}><span className="label">Name</span><span className="value">{employeeInfo.name}</span></Box>
            <Box mb={0.75}><span className="label">DOJ</span><span className="value">{employeeInfo.doj}</span></Box>
            <Box mb={0.75}><span className="label">Job Title</span><span className="value">{employeeInfo.jobTitle}</span></Box>
            <Box mb={0.75}><span className="label">Department</span><span className="value">{employeeInfo.department}</span></Box>
          </InfoGrid>
          <InfoGrid item xs={12} md={6}>
            <Box mb={0.75}><span className="label">Branch</span><span className="value">{employeeInfo.branch}</span></Box>
            <Box mb={0.75}><span className="label">Location</span><span className="value">{employeeInfo.location}</span></Box>
            <Box mb={0.75}><span className="label">Month</span><span className="value">{employeeInfo.month}</span></Box>
            <Box mb={0.75}><span className="label">Salary</span><span className="value">{employeeInfo.salary}</span></Box>
          </InfoGrid>
        </Grid>
      </Box>

      {/* Attendance Info Section */}
      <Box mb={2}>
        <SectionHeader>Attendance Info</SectionHeader>
        <Grid container spacing={1}>
          <InfoGrid item xs={12} md={6}>
            <Box mb={0.75}><span className="label">Presents</span><span className="value">{attendanceInfo.presents}</span></Box>
            <Box mb={0.75}><span className="label">Missings</span><span className="value">{attendanceInfo.missings}</span></Box>
            <Box mb={0.75}><span className="label">Absents</span><span className="value">{attendanceInfo.absents}</span></Box>
            <Box mb={0.75}><span className="label">Late Arrivals</span><span className="value">{attendanceInfo.lateArrivals}</span></Box>
            <Box mb={0.75}><span className="label">Early Lefts</span><span className="value">{attendanceInfo.earlyLefts}</span></Box>
            <Box mb={0.75}><span className="label">Rest Days</span><span className="value">{attendanceInfo.restDays}</span></Box>
            <Box mb={0.75}><span className="label">Expected Hours</span><span className="value">{attendanceInfo.expectedHours}</span></Box>
          </InfoGrid>
          <InfoGrid item xs={12} md={6}>
            <Box mb={0.75}><span className="label">Short Duration</span><span className="value">{attendanceInfo.shortDuration}</span></Box>
            <Box mb={0.75}><span className="label">Leaves</span><span className="value">{attendanceInfo.leaves}</span></Box>
            <Box mb={0.75}><span className="label">Relaxation</span><span className="value">{attendanceInfo.relaxation}</span></Box>
            <Box mb={0.75}><span className="label">Holidays</span><span className="value">{attendanceInfo.holidays}</span></Box>
            <Box mb={0.75}><span className="label">Dayoffs</span><span className="value">{attendanceInfo.dayoffs}</span></Box>
            <Box mb={0.75}><span className="label">Worked Hours</span><span className="value">{attendanceInfo.workedHours}</span></Box>
          </InfoGrid>
      </Grid>
      </Box>

      {/* Earnings Section */}
      <Box mb={2}>
        <SectionHeader>Earnings</SectionHeader>
        <InfoGrid>
          <Box mb={0.75}><span className="label">Standard Salary</span><span className="value">Rs {earnings.standardSalary.toLocaleString()}</span></Box>
          <Box mb={0.75}><span className="label">Monthly Basic Salary</span><span className="value">Rs {earnings.monthlyBasicSalary.toLocaleString()}</span></Box>
          <Box mb={0.75} sx={{ '& .value': { fontWeight: 600 } }}><span className="label">Earnings</span><span className="value">Rs {earnings.total.toLocaleString()}</span></Box>
        </InfoGrid>
      </Box>

      {/* Deductions Section */}
      <Box mb={2}>
        <SectionHeader>Deductions</SectionHeader>
        <InfoGrid>
          <Box mb={0.75}><span className="label">Leave Deduction</span><span className="value">Rs {deductions.leaveDeduction.toLocaleString()}</span></Box>
          <Box mb={0.75} sx={{ '& .value': { fontWeight: 600 } }}><span className="label">Deductions</span><span className="value">Rs {deductions.total.toLocaleString()}</span></Box>
        </InfoGrid>
      </Box> 

      {/* Net Transfer Section */}
      <Box mb={2}>
        <SectionHeader>Net Transfer</SectionHeader>
        <InfoGrid>
          <Box mb={0.75}><span className="label">Net Payable</span><span className="value">Rs {netTransfer.amount.toLocaleString()}</span></Box>
          <Box mb={0.75}><span className="label">In Words</span><span className="value">Rs {netTransfer.inWords}</span></Box>
        </InfoGrid>
      </Box>

      {/* Disclaimer */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center', fontSize: '0.7rem' }}>
        This document is system generated and does not require any signatures or the company's stamp to be considered valid.
      </Typography>
    </Card>
  );
};

export default PaySlipView;
