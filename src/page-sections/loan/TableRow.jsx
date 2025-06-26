import { useState } from "react";
import { format } from "date-fns";
import {
  Avatar,
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { H6 } from "@/components/typography";
import { payInstallment } from "./request";
import { toast } from "react-toastify";

// Status colors
const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "success";
    case "Rejected":
      return "error";
    case "Completed":
      return "info";
    default:
      return "warning";
  }
};

export default function TableRowView({ data, isSelected, handleSelectRow, handleDelete, onEdit, onView, onApprove, onReject }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [installmentsAnchorEl, setInstallmentsAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleOpenInstallmentsMenu = (event) => {
    setInstallmentsAnchorEl(event.currentTarget);
  };

  const handleCloseInstallmentsMenu = () => {
    setInstallmentsAnchorEl(null);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(data);
    handleCloseMenu();
  };

  const handleView = () => {
    if (onView) onView(data);
    handleCloseMenu();
  };

  const handleApprove = () => {
    if (onApprove) onApprove(data);
    handleCloseMenu();
  };

  const handleReject = () => {
    if (onReject) onReject(data);
    handleCloseMenu();
  };

  const handleDeleteClick = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this loan record?");
    if (confirmDelete) {
      handleDelete(data._id);
    }
    handleCloseMenu();
  };
  
  const handlePayInstallment = async (installmentId) => {
    try {
      const response = await payInstallment(data._id, installmentId);
      if (response.success) {
        toast.success("Installment paid successfully");
        // Refresh the data (this would typically be handled by the parent component)
        window.location.reload();
      } else {
        toast.error(response.message || "Failed to pay installment");
      }
    } catch (error) {
      console.error("Error paying installment:", error);
      toast.error("Error paying installment");
    }
    handleCloseInstallmentsMenu();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy");
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
      selected={isSelected}
      aria-checked={isSelected}
      sx={{ "&.Mui-selected": { backgroundColor: "action.hover" } }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          size="small"
          color="primary"
          checked={isSelected}
          onClick={(event) => handleSelectRow(event, data._id)}
        />
      </TableCell>

      <TableCell align="left">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            src={data.employeeId?.avatar}
            alt={data.employeeId?.name}
            sx={{ width: 30, height: 30 }}
          />
          <Box>
            <H6 color="text.primary" fontSize={12}>
              {data.employeeId?.name || "N/A"}
            </H6>
            <Typography variant="caption" color="text.secondary">
              {data.employeeId?.user_defined_code || "N/A"}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell align="left">{formatCurrency(data.requestedAmount)}</TableCell>
      <TableCell align="left">{formatCurrency(data.approvedAmount)}</TableCell>
      <TableCell align="left">{data.totalInstallments || "N/A"}</TableCell>
      <TableCell align="left">{data.leftInstallments !== undefined ? data.leftInstallments : "N/A"}</TableCell>
      <TableCell align="left">{formatCurrency(data.leftAmount)}</TableCell>
      <TableCell align="left">{formatDate(data.requiredDate)}</TableCell>
      <TableCell align="left">{formatDate(data.requestDate)}</TableCell>

      <TableCell align="left">
        <Chip
          size="small"
          label={data.status}
          color={getStatusColor(data.status)}
        />
      </TableCell>
      
      <TableCell align="left">
        <Chip
          size="small"
          label={data.processed ? "Processed" : "Unprocessed"}
          color={data.processed ? "success" : "default"}
        />
      </TableCell>

      <TableCell align="center">
        <IconButton size="small" onClick={handleOpenMenu}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            View
          </MenuItem>
          
          {data.status === "Pending" && (
            <>
              <MenuItem onClick={handleEdit}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>
              
              <MenuItem onClick={handleApprove} sx={{ color: "success.main" }}>
                <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                Approve
              </MenuItem>
              
              <MenuItem onClick={handleReject} sx={{ color: "error.main" }}>
                <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                Reject
              </MenuItem>
            </>
          )}
          
          {data.status === "Approved" && data.installments && data.installments.length > 0 && (
            <MenuItem onClick={handleOpenInstallmentsMenu}>
              <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
              Pay Installment
            </MenuItem>
          )}
          
          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
        
        {/* Installments Menu */}
        <Menu
          anchorEl={installmentsAnchorEl}
          open={Boolean(installmentsAnchorEl)}
          onClose={handleCloseInstallmentsMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {data.installments && data.installments.map((installment, index) => (
            <MenuItem 
              key={installment._id || index}
              onClick={() => handlePayInstallment(installment._id)}
              disabled={installment.status === "Paid"}
              sx={{
                color: installment.status === "Paid" ? "text.disabled" : "text.primary",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <Typography variant="body2">
                  Installment {index + 1}
                </Typography>
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                  {formatCurrency(installment.amount)}
                </Typography>
                <Chip 
                  size="small" 
                  label={installment.status} 
                  color={installment.status === "Paid" ? "success" : "warning"} 
                />
              </Stack>
            </MenuItem>
          ))}
          
          {(!data.installments || data.installments.length === 0) && (
            <MenuItem disabled>No installments available</MenuItem>
          )}
        </Menu>
      </TableCell>
    </TableRow>
  );
}
