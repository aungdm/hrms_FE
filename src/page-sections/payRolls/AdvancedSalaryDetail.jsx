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

export default function AdvancedSalaryDetail({ advancedSalaryDetails = [], totalAmount = 0 }) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd MMM yyyy');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  if (!advancedSalaryDetails || advancedSalaryDetails.length === 0) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Advanced Salary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No advanced salary included in this payroll.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Advanced Salary
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
              <TableCell>Date</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {advancedSalaryDetails.map((detail, index) => (
              <TableRow key={detail.id || index}>
                <TableCell>{formatDate(detail.date)}</TableCell>
                <TableCell>{formatDate(detail.requestDate)}</TableCell>
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