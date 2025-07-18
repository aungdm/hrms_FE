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
  Chip,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { getUnprocessedIncentives } from './request';

export default function IncentivesSummary({ employeeId, startDate, endDate, onIncentivesLoaded }) {
  const [incentives, setIncentives] = useState([]);
  const [approvedIncentives, setApprovedIncentives] = useState([]);
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
          setApprovedIncentives(response.data.approvedIncentives || []);
          setTotalAmount(response.data.totalAmount || 0);
          
          // Notify parent component about the loaded incentives
          if (onIncentivesLoaded) {
            onIncentivesLoaded(response.data.totalAmount || 0, response.data.approvedIncentives || []);
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
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            label={`Total Approved: ${formatCurrency(totalAmount)}`} 
            color="success" 
            variant="outlined" 
          />
          <Typography variant="body2" color="text.secondary">
            Only approved incentives will be added to payroll
          </Typography>
        </Stack>
      </Box>
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incentives.map((incentive) => {
              const isApproved = incentive.status === 'Approved';
              return (
                <TableRow 
                  key={incentive._id}
                  sx={isApproved ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {}}
                >
                  <TableCell>{incentive.incentiveType}</TableCell>
                  <TableCell>{formatDate(incentive.incentiveDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={incentive.status} 
                      color={
                        incentive.status === 'Approved' ? 'success' :
                        incentive.status === 'Rejected' ? 'error' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{incentive.description || 'N/A'}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={isApproved ? { fontWeight: 'bold', color: 'success.main' } : {}}
                  >
                    {formatCurrency(incentive.amount)}
                  </TableCell>
                </TableRow>
              );
            })}
            {approvedIncentives.length > 0 && (
              <TableRow sx={{ backgroundColor: 'rgba(76, 175, 80, 0.12)' }}>
                <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                  Total Approved Incentives:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(totalAmount)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
} 