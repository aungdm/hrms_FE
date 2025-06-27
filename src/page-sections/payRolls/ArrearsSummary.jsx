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
import { getUnprocessedArrears } from './request';

export default function ArrearsSummary({ employeeId, startDate, endDate, onArrearsLoaded }) {
  const [arrears, setArrears] = useState([]);
  const [approvedArrears, setApprovedArrears] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArrears = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUnprocessedArrears(employeeId, startDate, endDate);
        
        if (response.success) {
          setArrears(response.data.arrears || []);
          setApprovedArrears(response.data.approvedArrears || []);
          setTotalAmount(response.data.totalAmount || 0);
          
          // Notify parent component about the loaded arrears
          if (onArrearsLoaded) {
            onArrearsLoaded(response.data.totalAmount || 0, response.data.approvedArrears || []);
          }
        } else {
          setError(response.message || 'Failed to fetch arrears');
        }
      } catch (err) {
        console.error('Error fetching arrears:', err);
        setError('Error loading arrears data');
      } finally {
        setLoading(false);
      }
    };

    fetchArrears();
  }, [employeeId, startDate, endDate, onArrearsLoaded]);

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

  if (arrears.length === 0) {
    return (
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">No unprocessed arrears found for this period.</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Unprocessed Arrears
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            label={`Total Approved: ${formatCurrency(totalAmount)}`} 
            color="success" 
            variant="outlined" 
          />
          <Typography variant="body2" color="text.secondary">
            Only approved arrears will be added to payroll
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
            {arrears.map((arrear) => {
              const isApproved = arrear.status === 'Approved';
              return (
                <TableRow 
                  key={arrear._id}
                  sx={isApproved ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {}}
                >
                  <TableCell>{arrear.deductionType}</TableCell>
                  <TableCell>{formatDate(arrear.deductionDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={arrear.status} 
                      color={
                        arrear.status === 'Approved' ? 'success' :
                        arrear.status === 'Rejected' ? 'error' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{arrear.description || 'N/A'}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={isApproved ? { fontWeight: 'bold', color: 'success.main' } : {}}
                  >
                    {formatCurrency(arrear.amount)}
                  </TableCell>
                </TableRow>
              );
            })}
            {approvedArrears.length > 0 && (
              <TableRow sx={{ backgroundColor: 'rgba(76, 175, 80, 0.12)' }}>
                <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                  Total Approved Arrears:
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