import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";

// Material UI components
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Custom components
import { TableMoreMenu, TableMoreMenuItem } from "@/components/table";
import { Paragraph, Small } from "@/components/typography";
import StatusBadge from "@/components/status-badge";

// Custom modal component
import LeaveModal from "./components/LeaveModal";

// API
import { deleteLeave, updateLeaveStatus } from "./request";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete, refetchList } = props;
  const [openMenu, setOpenMenu] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusToChange, setStatusToChange] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
    handleCloseMenu();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleDeleteLeave = async () => {
    try {
      const response = await deleteLeave(data._id);
      if (response.success) {
        toast.success("Leave deleted successfully");
        if (refetchList) refetchList();
      } else {
        toast.error("Failed to delete leave");
      }
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error("An error occurred while deleting leave");
    }
    handleCloseMenu();
  };

  // Handle opening status change confirmation dialog
  const handleOpenStatusDialog = (status) => {
    setStatusToChange(status);
    setConfirmDialogOpen(true);
    handleCloseMenu();
  };

  // Handle closing the confirmation dialog
  const handleCloseStatusDialog = () => {
    setConfirmDialogOpen(false);
    setStatusToChange(null);
  };

  // Handle updating the leave status
  const handleUpdateStatus = async () => {
    if (!statusToChange) return;

    try {
      const response = await updateLeaveStatus(data._id, statusToChange);
      if (response.success) {
        toast.success(`Leave status updated to ${statusToChange}`);
        if (refetchList) refetchList();
      } else {
        toast.error("Failed to update leave status");
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast.error("An error occurred while updating leave status");
    } finally {
      handleCloseStatusDialog();
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "--";
    }
  };

  // Function to render status chip
  const renderStatusChip = (status) => {
    if (!status) return "--";
    
    let chipColor;
    switch (status) {
      case "Approved":
        chipColor = "#4caf50"; // Green for approved
        break;
      case "Rejected":
        chipColor = "#f44336"; // Red for rejected
        break;
      case "Pending":
        chipColor = "#ff9800"; // Orange/Yellow for pending
        break;
      default:
        chipColor = "#757575"; // Grey for unknown status
    }
    
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          backgroundColor: chipColor,
          color: "white",
          fontWeight: "500",
          minWidth: "70px",
          fontSize: "11px",
        }}
      />
    );
  };

  const renderStatus = (status) => {
    if (!status) return null;
    const color = status === "Pending" ? "warning" : status === "Approved" ? "success" : "error";
    return <StatusBadge color={color}>{status}</StatusBadge>;
  };

  // Show approval/rejection options only for pending leaves
  const isPending = data?.status === "Pending";
  
  // Only show status change options if not already in that state
  const canApprove = data?.status !== "Approved";
  const canReject = data?.status !== "Rejected";

  return (
    <>
      <TableRow hover selected={isSelected}>
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={(e) => handleSelectRow(data._id)}
          />
        </TableCell>

        <TableCell padding="normal" align="left">
          <Typography variant="body2">
            {data?.employeeId?.name || "--"}
          </Typography>
        </TableCell>

        <TableCell padding="normal" align="left">
          {formatDate(data?.date)}
        </TableCell>

        <TableCell padding="normal" align="center">
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            {renderStatus(data?.status)}
            {data?.createdFromAbsence && (
              <Chip 
                icon={<HistoryIcon fontSize="small" />} 
                label="From Absence" 
                size="small" 
                color="info" 
                variant="outlined" 
                sx={{ height: 24 }}
              />
            )}
          </Stack>
        </TableCell>

        <TableCell padding="normal" align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            {/* <IconButton 
              size="small" 
              color="primary"
              onClick={handleOpenMenu}
            >
              <EditIcon fontSize="small" />
            </IconButton> */}
            
            <TableMoreMenu
              open={openMenu}
              handleOpen={handleOpenMenu}
              handleClose={handleCloseMenu}
            >
              <TableMoreMenuItem
                Icon={EditIcon}
                title="Edit"
                handleClick={handleOpenEditModal}
              />
              
              {/* {canApprove && (
                <TableMoreMenuItem
                  Icon={CheckCircleIcon}
                  title="Approve Leave"
                  handleClick={() => handleOpenStatusDialog("Approved")}
                />
              )}
              
              {canReject && (
                <TableMoreMenuItem
                  Icon={CancelIcon}
                  title="Reject Leave"
                  handleClick={() => handleOpenStatusDialog("Rejected")}
                />
              )} */}
              
              <TableMoreMenuItem
                Icon={DeleteIcon}
                title="Delete"
                handleClick={handleDeleteLeave}
              />
            </TableMoreMenu>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Edit Modal */}
      <LeaveModal
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        record={data}
        onSuccess={refetchList}
        mode="edit"
      />
      
      {/* Status Change Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseStatusDialog}
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-description"
      >
        <DialogTitle id="status-dialog-title">
          {statusToChange === "Approved" ? "Approve Leave" : "Reject Leave"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="status-dialog-description">
            {statusToChange === "Approved" 
              ? `Are you sure you want to approve this leave request for ${data?.employeeId?.name} on ${formatDate(data?.date)}? This will also mark the day as "Day Off" in the attendance records.`
              : `Are you sure you want to reject this leave request for ${data?.employeeId?.name} on ${formatDate(data?.date)}? If the leave was previously approved, the attendance will be marked as "Absent".`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            color={statusToChange === "Approved" ? "success" : "error"} 
            variant="contained"
            autoFocus
          >
            {statusToChange === "Approved" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
