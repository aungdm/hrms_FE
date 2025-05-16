import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
 

// Material UI components
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

// Icons
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// Custom components
import PunchModal from "./components/PunchModal";

// API
import { deletePunch, updatePunchStatus } from "./request";

const TableRowView = ({ data, isSelected, handleSelectRow, refetchList, isAdmin }) => {
  // State management
  const [openMenu, setOpenMenu] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToChange, setStatusToChange] = useState(null);

  // Handle menu open/close
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  // Handle edit modal
  const handleOpenEditModal = () => {
    setEditModalOpen(true);
    handleCloseMenu();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  // Handle status update dialog
  const handleOpenStatusDialog = (status) => {
    setStatusToChange(status);
    setConfirmDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseStatusDialog = () => {
    setConfirmDialogOpen(false);
    setStatusToChange(null);
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    try {
      const response = await updatePunchStatus(data._id, statusToChange);
      
      if (response.success) {
        toast.success(`Punch request ${statusToChange.toLowerCase()} successfully`);
        refetchList();
      } else {
        toast.error(response.message || `Failed to ${statusToChange.toLowerCase()} punch request`);
      }
    } catch (error) {
      console.error("Error updating punch status:", error);
      toast.error(`Error updating punch status: ${error.message}`);
    } finally {
      handleCloseStatusDialog();
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await deletePunch(data._id);
      
      if (response.success) {
        toast.success("Punch request deleted successfully");
        refetchList();
      } else {
        toast.error(response.message || "Failed to delete punch request");
      }
    } catch (error) {
      console.error("Error deleting punch:", error);
      toast.error(`Error deleting punch request: ${error.message}`);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format time from API
  const formatTime = (timeString) => {
    return timeString || "N/A";
  };

  // Format created at date with time
  const formatCreatedAt = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatToTime = (dateString) => {
    if (!dateString) return ""; // Handle null or undefined
    const date = new Date(dateString);
    return format(date, "hh:mm a"); // Example output: 07:20 PM
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

  // Render punch type in readable format
  const renderPunchType = (type) => {
    switch (type) {
      case "firstEntry":
        return "First Entry";
      case "lastExit":
        return "Last Exit";
      case "overtimeStart":
        return "Overtime Start";
      case "overtimeEnd":
        return "Overtime End";
      default:
        return type;
    }
  };

  // Menu items based on status
  const getStatusActionItems = () => {
    const items = [];

    // Only show status actions for admin and if status is pending
    if (isAdmin && data.status === "Pending") {
      items.push(
        <MenuItem key="approve" onClick={() => handleOpenStatusDialog("Approved")}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>,
        <MenuItem key="reject" onClick={() => handleOpenStatusDialog("Rejected")}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
      );
    }

    return items;
  };

  return (
    <>
      <TableRow
        hover
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        selected={isSelected}
      >
        <TableCell padding="checkbox">
          <Checkbox
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
            {data?.employeeId?.employeeId || ""}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
          {data?.date?.slice(0,10)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {renderPunchType(data?.punchType)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {formatToTime(data?.time)}
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
          <Typography variant="body2">
            { data?.createdAt?.slice(0,10)}
          </Typography>
        </TableCell>

        <TableCell align="center">
          <IconButton onClick={handleOpenMenu}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Actions Menu */}
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
        <MenuItem onClick={handleOpenEditModal}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        {getStatusActionItems()}

        <MenuItem onClick={handleOpenDeleteDialog}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      <PunchModal
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        onSuccess={refetchList}
        mode="edit"
        data={data}
      />
      
      {/* Status Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {statusToChange === "Approved" ? "Approve Punch Request" : "Reject Punch Request"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {statusToChange === "Approved" ? (
              <>
                Are you sure you want to approve this punch request for <strong>{data?.employeeId?.name}</strong>?
                <br /><br />
                This will update the employee's attendance record with the requested punch time.
              </>
            ) : (
              <>
                Are you sure you want to reject this punch request for <strong>{data?.employeeId?.name}</strong>?
                <br /><br />
                The employee will be notified that their request was rejected.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateStatus} 
            color={statusToChange === "Approved" ? "success" : "error"} 
            variant="contained"
          >
            {statusToChange === "Approved" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Punch Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this punch request for <strong>{data?.employeeId?.name}</strong>?
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

TableRowView.propTypes = {
  data: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  handleSelectRow: PropTypes.func.isRequired,
  refetchList: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
};

TableRowView.defaultProps = {
  isAdmin: false,
};

export default TableRowView;
