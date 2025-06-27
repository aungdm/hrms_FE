import { Box, Button, Card, Grid, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { H5, H6, Paragraph, Span } from "components/Typography";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { numberWithCommas } from "utils/numberWithCommas";
import { FlexBetween } from "components/flexbox";
import toast from "react-hot-toast";
import LoadingScreen from "components/LoadingScreen";
import { getUnprocessedAdvancedSalaries } from "./request";

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

const AdvancedSalarySummary = ({ employeeId, startDate, endDate, onApplyAdvancedSalaries }) => {
  const [loading, setLoading] = useState(true);
  const [advancedSalaries, setAdvancedSalaries] = useState([]);
  const [approvedAdvancedSalaries, setApprovedAdvancedSalaries] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (employeeId && startDate && endDate) {
      fetchAdvancedSalaries();
    } else {
      setLoading(false);
    }
  }, [employeeId, startDate, endDate]);

  const fetchAdvancedSalaries = async () => {
    try {
      setLoading(true);
      const response = await getUnprocessedAdvancedSalaries(employeeId, startDate, endDate);

      if (response.success) {
        setAdvancedSalaries(response.data.advancedSalaries || []);
        setApprovedAdvancedSalaries(response.data.approvedAdvancedSalaries || []);
        setTotalAmount(response.data.totalAmount || 0);
      } else {
        toast.error(response.error || "Failed to fetch advanced salaries");
      }
    } catch (error) {
      console.error("Error fetching advanced salaries:", error);
      toast.error("Error fetching advanced salaries");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdvancedSalaries = () => {
    if (typeof onApplyAdvancedSalaries === "function") {
      onApplyAdvancedSalaries(approvedAdvancedSalaries, totalAmount);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Card sx={{ padding: 3, mb: 3 }}>
      <FlexBetween mb={3}>
        <H5>Advanced Salary</H5>
        {approvedAdvancedSalaries.length > 0 && (
          <Button variant="contained" color="primary" onClick={handleApplyAdvancedSalaries}>
            Apply Advanced Salary
          </Button>
        )}
      </FlexBetween>

      {advancedSalaries.length === 0 ? (
        <Paragraph>No unprocessed advanced salaries found for this period.</Paragraph>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Request Date</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell align="right">Amount</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {advancedSalaries.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell sx={{ padding: 0 }}>
                      <Paragraph color="text.primary" fontWeight={500}>
                        {item.approvalDate ? format(new Date(item.approvalDate), "dd MMM yyyy") : "N/A"}
                      </Paragraph>
                    </TableCell>

                    <TableCell>
                      <Paragraph>
                        {item.requestDate ? format(new Date(item.requestDate), "dd MMM yyyy") : "N/A"}
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
                        ₹{numberWithCommas(item.approvedAmount)}
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
                  Total Advanced Salary: <Span fontWeight={600}>₹{numberWithCommas(totalAmount)}</Span>
                </Paragraph>
                <Paragraph>
                  Approved Items: <Span fontWeight={600}>{approvedAdvancedSalaries.length}</Span>
                </Paragraph>
                <Paragraph>
                  Pending Items: <Span fontWeight={600}>{advancedSalaries.length - approvedAdvancedSalaries.length}</Span>
                </Paragraph>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Card>
  );
};

export default AdvancedSalarySummary; 