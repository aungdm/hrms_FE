import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { getUnprocessedIncentives } from './request';

export default function IncentivesSummary({ employeeId, startDate, endDate, onIncentivesLoaded }) {
  const [incentives, setIncentives] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncentives = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUnprocessedIncentives(employeeId, startDate, endDate);
        
        if (response.success) {
          setIncentives(response.data.incentives || []);
          setTotalAmount(response.data.totalAmount || 0);
          
          // Notify parent component about the loaded incentives
          if (onIncentivesLoaded) {
            onIncentivesLoaded(response.data.totalAmount || 0, response.data.incentives || []);
          }
        } else {
          setError(response.message || 'Failed to fetch incentives');
        }
      } catch (err) {
        console.error('Error fetching incentives:', err);
        setError('Error loading incentives data');
      } finally {
        setLoading(false);
      }
    };

    fetchIncentives();
  }, [employeeId, startDate, endDate, onIncentivesLoaded]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (incentives.length === 0) {
    return (
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">No unprocessed incentives found for this period.</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Unprocessed Incentives
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={`Total: ${formatCurrency(totalAmount)}`} 
          color="success" 
          variant="outlined" 
        />
      </Box>
      
      <TableContainer component={Paper}>
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
            {incentives.map((incentive) => (
              <TableRow key={incentive._id}>
                <TableCell>{incentive.incentiveType}</TableCell>
                <TableCell>{formatDate(incentive.incentiveDate)}</TableCell>
                <TableCell>{incentive.description || 'N/A'}</TableCell>
                <TableCell align="right">{formatCurrency(incentive.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
} 