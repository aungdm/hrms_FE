import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";

// MUI Components
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

// Icons
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

// API functions
import { deleteDeduction, updateDeductionStatus } from "./request";

export default function TableRowView({ data, isSelected, handleSelectRow, refetchList, handleDelete, isAdmin }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusToChange, setStatusToChange] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle menu open/close
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  // Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Pending":
      default:
        return "warning";
    }
  };

  // Handle delete
  const handleDeleteAction = async () => {
    try {
      if (handleDelete) {
        // Use the passed handleDelete function if available
        await handleDelete(data._id);
      } else {
        // Fallback to direct API call
        const response = await deleteDeduction(data._id);
        
        if (response.success && refetchList) {
          refetchList();
        }
      }
    } catch (error) {
      console.error("Error deleting deduction:", error);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (status) => {
    try {
      const response = await updateDeductionStatus(data._id, status);
      
      if (response.success && refetchList) {
        refetchList();
      }
    } catch (error) {
      console.error("Error updating deduction status:", error);
    }
  };

  return (
    <TableRow hover selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox
          size="small"
          color="primary"
          checked={isSelected}
          onClick={(event) => handleSelectRow(event, data._id)}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.primary">
          {data?.employeeId?.name || "N/A"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {data?.employeeId?.user_defined_code || ""}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {data?.deductionType || "N/A"}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {formatCurrency(data?.amount) || "N/A"}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {formatDate(data?.deductionDate) || "N/A"}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip 
          label={data?.status || "Pending"}
          color={getStatusColor(data?.status)}
          size="small" 
          variant="outlined" 
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
          {data?.description || "-"}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <IconButton onClick={handleOpenMenu}>
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu
          id="row-actions-menu"
          anchorEl={openMenu}
          keepMounted
          open={Boolean(openMenu)}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={() => navigate(`/dashboard/otherDeduction/edit/${data._id}`)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => navigate(`/dashboard/otherDeduction/view/${data._id}`)}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>

          {isAdmin && data.status === "Pending" && (
            <>
              <MenuItem onClick={() => handleUpdateStatus("Approved")}>
                <ListItemIcon>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Approve</ListItemText>
              </MenuItem>

              <MenuItem onClick={() => handleUpdateStatus("Rejected")}>
                <ListItemIcon>
                  <CancelIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Reject</ListItemText>
              </MenuItem>
            </>
          )}

          <MenuItem onClick={handleDeleteAction}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}
