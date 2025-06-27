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

export default function IncentivesDetail({ incentives = [], totalAmount = 0 }) {
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

  if (!incentives || incentives.length === 0) {
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Incentives
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No incentives included in this payroll.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Incentives
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
            {incentives.map((incentive, index) => (
              <TableRow key={incentive.id || index}>
                <TableCell>{incentive.type}</TableCell>
                <TableCell>{formatDate(incentive.date)}</TableCell>
                <TableCell>{incentive.description || 'N/A'}</TableCell>
                <TableCell align="right">{formatCurrency(incentive.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
} 