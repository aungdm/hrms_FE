import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { format } from "date-fns";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Custom components
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { updateRelaxationRequestStatus } from "./request";
import { toast } from "react-toastify";

export default function RelaxationRequestTableRow(props) {
  const { data, refetchData } = props;
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    recordId: null,
    currentStatus: null,
  });

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };

  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  const formatTime = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return format(date, "hh:mm a");
  };

  const formatISOtDateTime = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd");
  };

  // Format minutes to hours and minutes
  const formatMinutesToHoursMinutes = (minutes) => {
    if (minutes === null || minutes === undefined || isNaN(minutes) || minutes < 0) return "--";
    if (minutes === 0) return "0m";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${remainingMinutes}m`;
    }
  };

  // Function to get status chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Absent":
        return "#d32f2f"; // Red
      case "Late":
        return "#ff9800"; // Yellow/Orange
      case "On Time":
        return "#4caf50"; // Green
      case "Day Off":
      case "Weekend":
      case "N/A":
        return "#26a69a"; // Teal/Mint green
      case "Early":
        return "#1976d2"; // Blue
      case "Present":
        return "#4caf50"; // Green
      default:
        return "#757575"; // Grey for unknown status
    }
  };

  // Function to render a status chip
  const renderStatusChip = (status) => {
    if (!status || status === "--") return "--";

    return (
      <Box sx={{ textAlign: "center" }}>
        <Chip
          label={status}
          size="small"
          sx={{
            backgroundColor: getStatusColor(status),
            color: "white",
            fontWeight: "500",
            minWidth: "48px",
            height: "20px",
            fontSize: "10px",
            borderRadius: "5px",
          }}
        />
      </Box>
    );
  };

  // Function to render relaxation request status chip
  const renderRequestStatus = (status) => {
    if (!status) return "--";
    
    let chipColor;
    
    switch (status) {
      case "Approved":
        chipColor = "#4caf50"; // Green
        break;
      case "Reject":
        chipColor = "#f44336"; // Red
        break;
      case "Pending":
        chipColor = "#ff9800"; // Orange/Yellow
        break;
      default:
        chipColor = "#757575"; // Grey
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

  // Handle approve or reject action for relaxation request
  const handleRequestApprovalAction = async (status) => {
    try {
      const result = await updateRelaxationRequestStatus(
        confirmDialog.recordId,
        status
      );
      if (result.success) {
        toast.success(
          status === "Approved" ? "Relaxation request approved" : "Relaxation request rejected"
        );
        if (refetchData) refetchData();
      } else {
        toast.error("Failed to update relaxation request status");
      }
    } catch (error) {
      console.error("Error updating relaxation request status:", error);
      toast.error("An error occurred while updating relaxation request status");
    } finally {
      setConfirmDialog({ open: false, action: null, recordId: null, currentStatus: null });
    }
  };

  // Open confirmation dialog for relaxation request
  const openConfirmation = (recordId, currentStatus,btnAction) => {
    setConfirmDialog({
      open: true,
      action: btnAction === "trigger" ? "approveOrReject" : null,
      recordId,
      currentStatus
    });
    handleCloseOpenMenu();
  };

  return (
    <>
      <TableRow hover>
        <TableCell padding="normal">
          <Stack direction="row" spacing={1}>
            {data.relaxationRequestStatus === "Pending" && (
                <Tooltip title="Approve Request">
                    <IconButton size="small" onClick={() => openConfirmation(data._id, "Approved","trigger")}>
                        <ThumbUpAltIcon color="success" fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
             {data.relaxationRequestStatus === "Pending" && (
                <Tooltip title="Reject Request">
                    <IconButton size="small" onClick={() => openConfirmation(data._id, "Reject" , "trigger")}>
                        <ThumbDownAltIcon color="error" fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            {(data.relaxationRequestStatus === "Approved" || data.relaxationRequestStatus === "Reject") && (
                <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => {/* Implement view logic or modal */}}>
                        <Visibility fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
          </Stack>
        </TableCell>

        <TableCell padding="normal">
          <Typography variant="body2" fontWeight={500}>
            {formatISOtDateTime(data.date)}
          </Typography>
        </TableCell>

        <TableCell padding="normal">
            <Typography variant="body2" fontWeight={500}>
                 {data.employeeId?.name || 'N/A'}
            </Typography>
            {data.employeeId?.user_defined_code && (
                 <Typography variant="caption" color="text.secondary">
                     {data.employeeId.user_defined_code}
                 </Typography>
             )}
        </TableCell>

        <TableCell padding="normal">
          <Typography variant="body2">
            {formatTime(data.expectedCheckinTime)}
          </Typography>
        </TableCell>

        <TableCell padding="normal">
          <Typography variant="body2">
            {formatTime(data.expectedCheckoutTime)}
          </Typography>
        </TableCell>

        <TableCell padding="normal">
             <Typography variant="body2" color={data.lateArrival > 0 ? 'error' : 'inherit'}>
                 {formatMinutesToHoursMinutes(data.lateArrival)}
             </Typography>
        </TableCell>

        <TableCell padding="normal">
             <Typography variant="body2" color={data.earlyDeparture > 0 ? 'warning' : 'inherit'}>
                 {formatMinutesToHoursMinutes(data.earlyDeparture)}
             </Typography>
        </TableCell>

         <TableCell padding="normal">
             <Typography variant="body2">
                 {formatMinutesToHoursMinutes(data.workDuration)}
             </Typography>
         </TableCell>

        <TableCell padding="normal">
             {renderStatusChip(data.status)}
        </TableCell>

        <TableCell padding="normal">
            {renderRequestStatus(data.relaxationRequestStatus)}
        </TableCell>
      </TableRow>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null, recordId: null, currentStatus: null })}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action === "approveOrReject" && confirmDialog.currentStatus === "Approved"
            ? "Confirm Approval"
            : confirmDialog.action === "approveOrReject" && confirmDialog.currentStatus === "Reject"
            ? "Confirm Rejection"
            : "Confirm Action"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.action === "approveOrReject" && confirmDialog.currentStatus === "Approved"
              ? "Are you sure you want to approve this relaxation request?"
              : confirmDialog.action === "approveOrReject" && confirmDialog.currentStatus === "Reject"
              ? "Are you sure you want to reject this relaxation request?"
              : "Are you sure you want to proceed with this action?"}
          </DialogContentText>
           <Box mt={2}>
            <Typography variant="subtitle2">Request Details:</Typography>
            <Typography variant="body2">Date: {formatISOtDateTime(data.date)}</Typography>
            <Typography variant="body2">Employee: {data.employeeId?.name || 'N/A'}</Typography>
             {data.expectedCheckinTime && <Typography variant="body2">Expected Check-in: {formatTime(data.expectedCheckinTime)}</Typography>}
             {data.expectedCheckoutTime && <Typography variant="body2">Expected Check-out: {formatTime(data.expectedCheckoutTime)}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, recordId: null, currentStatus: null })} color="secondary">
            Cancel
          </Button>
          {confirmDialog.action === "approveOrReject" && (
            <Button
              onClick={() => handleRequestApprovalAction(confirmDialog.currentStatus)}
              color={confirmDialog.currentStatus === "Approved" ? "success" : "error"}
              variant="contained"
              autoFocus
            >
              {confirmDialog.currentStatus === "Approved" ? "Approve" : "Reject"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
