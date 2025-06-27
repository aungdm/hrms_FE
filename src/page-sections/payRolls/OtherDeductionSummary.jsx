import { Box, Button, Card, Grid, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { H5, H6, Paragraph, Span } from "components/Typography";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { numberWithCommas } from "utils/numberWithCommas";
import { FlexBetween } from "components/flexbox";
import toast from "react-hot-toast";
import LoadingScreen from "components/LoadingScreen";
import { getUnprocessedOtherDeductions } from "./request";

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

const OtherDeductionSummary = ({ employeeId, startDate, endDate, onApplyOtherDeductions }) => {
  const [loading, setLoading] = useState(true);
  const [otherDeductions, setOtherDeductions] = useState([]);
  const [approvedOtherDeductions, setApprovedOtherDeductions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (employeeId && startDate && endDate) {
      fetchOtherDeductions();
    } else {
      setLoading(false);
    }
  }, [employeeId, startDate, endDate]);

  const fetchOtherDeductions = async () => {
    try {
      setLoading(true);
      const response = await getUnprocessedOtherDeductions(employeeId, startDate, endDate);

      if (response.success) {
        setOtherDeductions(response.data.otherDeductions || []);
        setApprovedOtherDeductions(response.data.approvedOtherDeductions || []);
        setTotalAmount(response.data.totalAmount || 0);
      } else {
        toast.error(response.error || "Failed to fetch other deductions");
      }
    } catch (error) {
      console.error("Error fetching other deductions:", error);
      toast.error("Error fetching other deductions");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOtherDeductions = () => {
    if (typeof onApplyOtherDeductions === "function") {
      onApplyOtherDeductions(approvedOtherDeductions, totalAmount);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Card sx={{ padding: 3, mb: 3 }}>
      <FlexBetween mb={3}>
        <H5>Other Deductions</H5>
        {approvedOtherDeductions.length > 0 && (
          <Button variant="contained" color="primary" onClick={handleApplyOtherDeductions}>
            Apply Other Deductions
          </Button>
        )}
      </FlexBetween>

      {otherDeductions.length === 0 ? (
        <Paragraph>No unprocessed other deductions found for this period.</Paragraph>
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
                {otherDeductions.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell sx={{ padding: 0 }}>
                      <Paragraph color="text.primary" fontWeight={500}>
                        {item.deductionType || "Other Deduction"}
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
                      <StyledStatus status={item.status}>{item.status || "Pending"}</StyledStatus>
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
                  Total Other Deductions: <Span fontWeight={600}>₹{numberWithCommas(totalAmount)}</Span>
                </Paragraph>
                <Paragraph>
                  Approved Items: <Span fontWeight={600}>{approvedOtherDeductions.length}</Span>
                </Paragraph>
                <Paragraph>
                  Pending Items: <Span fontWeight={600}>{otherDeductions.length - approvedOtherDeductions.length}</Span>
                </Paragraph>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Card>
  );
};

export default OtherDeductionSummary; 