import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Stack,
  CircularProgress,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { Paragraph } from "@/components/typography";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import FlexBox from "@/components/flexbox/FlexBox.jsx";
import { updateStatus } from "./request.js";
import { toast } from "react-toastify";

export default function RejectionForm({ loan, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    try {
      setLoading(true);
      
      const response = await updateStatus(loan._id, "Rejected");
      
      if (response.success) {
        toast.success("Loan rejected successfully");
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || "Failed to reject loan");
      }
    } catch (error) {
      console.error("Error rejecting loan:", error);
      toast.error("Error rejecting loan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box mb={3}>
        <FlexBox gap={0.5} alignItems="center">
          <IconWrapper>
            <CancelIcon sx={{ color: "error.main" }} />
          </IconWrapper>
          <Typography variant="h5">Reject Loan Request</Typography>
        </FlexBox>
        <Paragraph color="text.secondary" mt={0.5}>
          Are you sure you want to reject this loan request?
        </Paragraph>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box mb={2}>
            <Typography variant="subtitle1">
              Employee: {loan?.employeeId?.name || "N/A"}
            </Typography>
            <Typography variant="body2">
              Requested Amount: {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(loan?.requestedAmount || 0)}
            </Typography>
            <Typography variant="body2">
              Total Installments: {loan?.totalInstallments || 0}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reject Loan"
              )}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
} 