import { Box, Card, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { H5, Paragraph, Span } from "components/Typography";
import { format } from "date-fns";
import React from "react";
import { numberWithCommas } from "utils/numberWithCommas";
import { FlexBetween } from "components/flexbox";

const FineDeductionDetail = ({ fineDeductionDetails, fineDeductions }) => {
  if (!fineDeductionDetails || fineDeductionDetails.length === 0) {
    return (
      <Card sx={{ padding: 3, mb: 3 }}>
        <H5 mb={2}>Fine Deduction Details</H5>
        <Paragraph>No fine deduction records found for this payroll.</Paragraph>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: 3, mb: 3 }}>
      <FlexBetween mb={3}>
        <H5>Fine Deduction Details</H5>
        <Paragraph>
          Total: <Span fontWeight={600}>₹{numberWithCommas(fineDeductions || 0)}</Span>
        </Paragraph>
      </FlexBetween>

      <TableContainer>
        <Table>
          <TableBody>
            {fineDeductionDetails.map((detail, index) => (
              <TableRow key={detail.id || index}>
                <TableCell>
                  <Paragraph fontWeight={500} color="text.primary">
                    {detail.type}
                  </Paragraph>
                  <Paragraph color="text.secondary">
                    {detail.date ? format(new Date(detail.date), "dd MMM yyyy") : "N/A"}
                  </Paragraph>
                </TableCell>

                <TableCell>
                  <Paragraph color="text.secondary">{detail.description || "No description"}</Paragraph>
                </TableCell>

                <TableCell align="right">
                  <Paragraph fontWeight={500} color="text.primary">
                    ₹{numberWithCommas(detail.amount)}
                  </Paragraph>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default FineDeductionDetail; 