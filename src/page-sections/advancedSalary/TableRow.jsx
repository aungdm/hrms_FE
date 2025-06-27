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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { H6 } from "@/components/typography";
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

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
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
    const confirmDelete = window.confirm("Are you sure you want to delete this advanced salary record?");
    if (confirmDelete) {
      handleDelete(data._id);
    }
    handleCloseMenu();
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
      <TableCell align="left">{formatDate(data.requiredDate)}</TableCell>
      <TableCell align="left">{formatDate(data.requestDate)}</TableCell>
      <TableCell align="left">{formatDate(data.approvalDate)}</TableCell>

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
              
              {onApprove && (
                <MenuItem onClick={handleApprove} sx={{ color: "success.main" }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                  Approve
                </MenuItem>
              )}
              
              {onReject && (
                <MenuItem onClick={handleReject} sx={{ color: "error.main" }}>
                  <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                  Reject
                </MenuItem>
              )}
            </>
          )}
          
          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}
