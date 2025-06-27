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

export default function ArrearsDetail({ arrears = [], totalAmount = 0 }) {
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

  if (!arrears || arrears.length === 0) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Arrears
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No arrears included in this payroll.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Arrears
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={`Total: ${formatCurrency(totalAmount)}`} 
          color="success" 
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
            {arrears.map((arrear, index) => (
              <TableRow key={arrear.id || index}>
                <TableCell>{arrear.type}</TableCell>
                <TableCell>{formatDate(arrear.date)}</TableCell>
                <TableCell>{arrear.description || 'N/A'}</TableCell>
                <TableCell align="right">{formatCurrency(arrear.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
} 