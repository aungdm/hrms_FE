import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Paragraph } from "@/components/typography";
import IconWrapper from "@/components/icon-wrapper/IconWrapper.jsx";
import FlexBox from "@/components/flexbox/FlexBox.jsx";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateStatus } from "./request.js";
import { toast } from "react-toastify";

export default function ApprovalForm({ loan, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  // Initial Form Values
  const initialValues = {
    approvedAmount: loan?.requestedAmount || 0,
  };

  // Form Validation Schema
  const validationSchema = Yup.object().shape({
    approvedAmount: Yup.number()
      .positive("Amount must be positive")
      .required("Approved amount is required"),
  });

  // Formik Hook
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    touched,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const response = await updateStatus(
          loan._id,
          "Approved",
          parseFloat(values.approvedAmount)
        );
        
        if (response.success) {
          toast.success("Loan approved successfully");
          if (onSuccess) onSuccess();
        } else {
          toast.error(response.message || "Failed to approve loan");
        }
      } catch (error) {
        console.error("Error approving loan:", error);
        toast.error("Error approving loan");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Card sx={{ p: 3 }}>
      <Box mb={3}>
        <FlexBox gap={0.5} alignItems="center">
          <IconWrapper>
            <CheckCircleIcon sx={{ color: "success.main" }} />
          </IconWrapper>
          <Typography variant="h5">Approve Loan Request</Typography>
        </FlexBox>
        <Paragraph color="text.secondary" mt={0.5}>
          Approve the loan request and set the approved amount
        </Paragraph>
      </Box>

      <form onSubmit={handleSubmit}>
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
            <TextField
              fullWidth
              type="number"
              name="approvedAmount"
              label="Approved Amount"
              onChange={handleChange}
              value={values.approvedAmount}
              error={Boolean(touched.approvedAmount && errors.approvedAmount)}
              helperText={touched.approvedAmount && errors.approvedAmount}
            />
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
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Approve Loan"
                )}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
} 