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
import { approveOvertimeRequest } from "./request";
import { toast } from "react-toastify";
import OvertimeEditModal from "./components/OvertimeEditModal";

export default function OvertimeTableRow(props) {
  const { data, handleSelectRow, onStatusChange, refetchData } = props;
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    recordId: null,
  });
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };

  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return format(date, "hh:mm a");
  };

  const formatISOtDateTime = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return format(date, "EEE, d MMM yyyy");
  };

  // Format minutes to hours and minutes
  const formatMinutesToHoursMinutes = (minutes) => {
    if (!minutes || isNaN(minutes) || minutes === 0) return "--";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
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

  // Function to render approval status chip
  const renderApprovalStatus = (status) => {
    if (!status) return "--";
    
    let chipColor;
    let displayStatus = status;
    
    // Standardize status display
    if (status === "Reject") {
      displayStatus = "Rejected";
    }
    
    switch (status) {
      case "Approved":
        chipColor = "#4caf50"; // Green for approved
        break;
      case "Reject":
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
        label={displayStatus}
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

  // Handle approve or reject action
  const handleApprovalAction = async (approved) => {
    try {
      const result = await approveOvertimeRequest(
        confirmDialog.recordId,
        approved
      );
      if (result.success) {
        toast.success(
          approved ? "Overtime approved successfully" : "Overtime rejected"
        );
        if (refetchData) refetchData();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error("Failed to update overtime status");
      }
    } catch (error) {
      console.error("Error updating overtime status:", error);
      toast.error("An error occurred while updating overtime status");
    } finally {
      setConfirmDialog({ open: false, action: null, recordId: null });
    }
  };

  // Open confirmation dialog
  const openConfirmation = (recordId, isApprove) => {
    setConfirmDialog({
      open: true,
      action: isApprove ? "approve" : "reject",
      recordId,
    });
    handleCloseOpenMenu();
  };

  return (
    <>
      <TableRow hover>
        <TableCell padding="normal">
          <Stack direction="row" spacing={1}>
            {/* <Tooltip title="View details">
              <IconButton
                size="small"
                color="info"
                onClick={() => {
                  navigate(`/time-sheet-view/${data._id}`);
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip> */}

            <Tooltip title="Edit overtime">
              <IconButton
                size="small"
                color="primary"
                onClick={handleOpenEditModal}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* {!data.approvedOverTime && (
              <Tooltip title="Approve overtime">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => openConfirmation(data._id, true)}
                >
                  <ThumbUpAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {data.approvedOverTime && (
              <Tooltip title="Reject overtime">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => openConfirmation(data._id, false)}
                >
                  <ThumbDownAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )} */}
          </Stack>
        </TableCell>

        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
            fontSize: "11px",
            fontWeight: "500",
            color: "text.secondary",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {formatISOtDateTime(data?.date)}
            {data?.isManuallyUpdated && (
          <Chip 
                label="Manual"
            size="small"
                sx={{
                  bgcolor: "#f50057",
                  color: "white",
                  height: "16px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              />
            )}
          </Stack>
        </TableCell>

        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
            fontSize: "11px",
            fontWeight: "500",
            color: "text.secondary",
          }}
        >
          {data?.employeeId?.name || "--"}
        </TableCell>

        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
          }}
        >
          <Stack direction="column" spacing={1}>
            <Typography variant="body2" fontSize="12px" color="black">
              {formatTime(data?.firstEntry)}
            </Typography>
            <Typography variant="body2" fontSize="10px" color="text.secondary">
              Expected{" "}
            </Typography>

            <Typography variant="body2" fontSize="10px" color="text.secondary">
              {formatTime(data?.expectedCheckinTime)}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
            fontSize: "11px",
            fontWeight: "500",
            color: "black",
          }}
        >
          <Stack direction="column" spacing={1}>
            <Typography variant="body2" fontSize="12px" color="black">
              {formatTime(data?.lastExit)}
            </Typography>
            <Typography variant="body2" fontSize="10px" color="text.secondary">
              Expected{" "}
            </Typography>

            <Typography variant="body2" fontSize="10px" color="text.secondary">
              {formatTime(data?.expectedCheckoutTime)}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell padding="normal">{renderStatusChip(data?.status)}</TableCell>

        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
            fontSize: "12px",
            fontWeight: "500",
            color: "#1976d2", // Blue color for expected hours
          }}
        >
          {formatMinutesToHoursMinutes(data?.expectedWorkHours)}
        </TableCell>

        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
            fontSize: "12px",
            fontWeight: "500",
            color: "#4caf50", // Green color for worked hours
          }}
        >
          {formatMinutesToHoursMinutes(data?.workDuration)}
        </TableCell>

        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
            fontSize: "12px",
            fontWeight: "500",
            color: data?.overtimeMinutes > 0 ? "#ff9800" : "text.secondary", // Orange color for overtime
          }}
        >
          {data?.overtimeMinutes
            ? formatMinutesToHoursMinutes(data?.overtimeMinutes)
            : "0"}
        </TableCell>

        <TableCell padding="normal">
          {renderApprovalStatus(data?.overTimeStatus)}
        </TableCell>
      </TableRow>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, action: null, recordId: null })
        }
      >
        <DialogTitle>
          {confirmDialog.action === "approve"
            ? "Approve Overtime"
            : "Reject Overtime"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === "approve"
              ? "Are you sure you want to approve this overtime request?"
              : "Are you sure you want to reject this overtime request?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, action: null, recordId: null })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleApprovalAction(confirmDialog.action === "approve")
            }
            color={confirmDialog.action === "approve" ? "success" : "error"}
            variant="contained"
            autoFocus
          >
            {confirmDialog.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Overtime Edit Modal */}
      <OvertimeEditModal
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        record={data}
        onSuccess={refetchData}
      />
    </>
  );
}
