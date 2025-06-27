import { Box, Button, Card, Grid, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { H5, H6, Paragraph, Span } from "components/Typography";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { numberWithCommas } from "utils/numberWithCommas";
import { FlexBetween } from "components/flexbox";
import axios from "axios";
import { BASE_URL } from "utils/constants";
import toast from "react-hot-toast";
import LoadingScreen from "components/LoadingScreen";

// styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 600,
  "&:first-of-type": { paddingLeft: 0 },
  "&:last-of-type": { paddingRight: 0 }
}));

const StyledStatus = styled(Span)(({ theme, status }) => ({
  fontSize: 12,
  fontWeight: 600,
  color: status === "Approved" ? theme.palette.success.main : status === "Pending" ? theme.palette.warning.main : theme.palette.error.main,
  backgroundColor: status === "Approved" ? theme.palette.success.light : status === "Pending" ? theme.palette.warning.light : theme.palette.error.light,
  borderRadius: "4px",
  padding: "3px 8px"
}));

const FineDeductionSummary = ({ employeeId, startDate, endDate, onApplyFineDeductions }) => {
  const [loading, setLoading] = useState(true);
  const [fineDeductions, setFineDeductions] = useState([]);
  const [approvedFineDeductions, setApprovedFineDeductions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (employeeId && startDate && endDate) {
      fetchFineDeductions();
    } else {
      setLoading(false);
    }
  }, [employeeId, startDate, endDate]);

  const fetchFineDeductions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/payroll/unprocessed-fine-deductions`, {
        params: {
          employeeId,
          startDate,
          endDate
        }
      });

      if (response.data.success) {
        setFineDeductions(response.data.data.fineDeductions || []);
        setApprovedFineDeductions(response.data.data.approvedFineDeductions || []);
        setTotalAmount(response.data.data.totalAmount || 0);
      } else {
        toast.error("Failed to fetch fine deductions");
      }
    } catch (error) {
      console.error("Error fetching fine deductions:", error);
      toast.error("Error fetching fine deductions");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFineDeductions = () => {
    if (typeof onApplyFineDeductions === "function") {
      onApplyFineDeductions(approvedFineDeductions, totalAmount);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Card sx={{ padding: 3, mb: 3 }}>
      <FlexBetween mb={3}>
        <H5>Fine Deductions</H5>
        {approvedFineDeductions.length > 0 && (
          <Button variant="contained" color="primary" onClick={handleApplyFineDeductions}>
            Apply Fine Deductions
          </Button>
        )}
      </FlexBetween>

      {fineDeductions.length === 0 ? (
        <Paragraph>No unprocessed fine deductions found for this period.</Paragraph>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell align="right">Amount</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {fineDeductions.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell sx={{ padding: 0 }}>
                      <Paragraph color="text.primary" fontWeight={500}>
                        {item.deductionType}
                      </Paragraph>
                    </TableCell>

                    <TableCell>
                      <Paragraph>
                        {item.deductionDate ? format(new Date(item.deductionDate), "dd MMM yyyy") : "N/A"}
                      </Paragraph>
                    </TableCell>

                    <TableCell>
                      <Paragraph>{item.description || "No description"}</Paragraph>
                    </TableCell>

                    <TableCell>
                      <StyledStatus status={item.status}>{item.status}</StyledStatus>
                    </TableCell>

                    <TableCell align="right">
                      <Paragraph fontWeight={500} color="text.primary">
                        ₹{numberWithCommas(item.amount)}
                      </Paragraph>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <H6 mb={1}>Summary</H6>
                <Paragraph>
                  Total Fine Deductions: <Span fontWeight={600}>₹{numberWithCommas(totalAmount)}</Span>
                </Paragraph>
                <Paragraph>
                  Approved Items: <Span fontWeight={600}>{approvedFineDeductions.length}</Span>
                </Paragraph>
                <Paragraph>
                  Pending Items: <Span fontWeight={600}>{fineDeductions.length - approvedFineDeductions.length}</Span>
                </Paragraph>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Card>
  );
};

export default FineDeductionSummary; 