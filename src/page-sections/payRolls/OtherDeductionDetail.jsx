import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import { format } from 'date-fns';

export default function OtherDeductionDetail({ otherDeductionDetails = [], totalAmount = 0 }) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd MMM yyyy');
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  if (!otherDeductionDetails || otherDeductionDetails.length === 0) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          All Deductions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No deductions included in this payroll.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        All Deductions
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={`Total: ${formatCurrency(totalAmount)}`} 
          color="error" 
          variant="outlined" 
        />
      </Box>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {otherDeductionDetails.map((detail, index) => (
              <TableRow key={detail.id || index}>
                <TableCell>{detail.type || 'N/A'}</TableCell>
                <TableCell>{formatDate(detail.date)}</TableCell>
                <TableCell>{detail.description || 'N/A'}</TableCell>
                <TableCell align="right">{formatCurrency(detail.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
} 