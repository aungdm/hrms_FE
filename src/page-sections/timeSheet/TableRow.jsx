import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EventNote from "@mui/icons-material/EventNote";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { format } from "date-fns";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

// Import the createLeave function
import { createLeave } from "@/page-sections/leave/request";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
  // console.log(data, "table row data");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  const formatTime = (dateString) => {
    if (!dateString) return ""; // or return a fallback like "N/A"

    const correctedDateString = dateString.replace(" ", "T");
    const date = new Date(correctedDateString);
    return format(date, "hh:mm a"); // e.g., 08:17 PM
  };

  const formatISOtDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "EEE, d MMM yyyy"); // Example: Thu, 1 May 2025
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

  // Check if all three statuses are "Absent"
  const isAbsent =
    data?.status === "Absent" &&
    data?.checkinStatus === "Absent" &&
    data?.checkoutStatus === "Absent";

  // Handle opening the confirmation dialog
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
    handleCloseOpenMenu();
  };

  // Handle closing the confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Handle creating a leave request
  const handleCreateLeaveRequest = async () => {
    try {
      // Create leave request with employee ID and date from the timesheet
      const leaveData = {
        employeeId: data?.employeeId?._id,
        date: data?.date,
        status: "Pending",
        createdFromAbsence: true,
      };

      const response = await createLeave(leaveData);

      if (response.success) {
        toast.success("Leave request created successfully");
      } else {
        toast.error("Failed to create leave request");
      }
    } catch (error) {
      console.error("Error creating leave request:", error);
      toast.error("An error occurred while creating leave request");
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <TableRow hover>
        {/* <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            checked={isSelected}
            onClick={(event) => handleSelectRow(event, data.id)}
          />
        </TableCell> */}
        <TableCell padding="normal">
          <TableMoreMenu
            open={openMenuEl}
            handleOpen={handleOpenMenu}
            handleClose={handleCloseOpenMenu}
          >
            <TableMoreMenuItem
              Icon={Edit}
              title="Edit"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/time-sheet-update/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={Visibility}
              title="View"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/time-sheet-view/${data._id}`);
              }}
            />
            {isAbsent && (
              <TableMoreMenuItem
                Icon={EventNote}
                title="Leave Request"
                handleClick={handleOpenConfirmDialog}
              />
            )}
          </TableMoreMenu>
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
            {formatISOtDateTime(data?.date) || "--"}
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
          <Box>
            {/* Display Name */}
            {data?.employeeId?.name || "--"}
          </Box>
          <Box sx={{ fontSize: "10px" }}>
            {/* Display User Code */}
            {data?.employeeId?.user_defined_code || "--"}
          </Box>
        </TableCell>
        <TableCell>{data?.name || "--"}</TableCell>
        <TableCell
          padding="normal"
          sx={{
            maxWidth: "200px",
          }}
        >
          <Stack direction="column" spacing={1}>
            <Typography variant="body2" fontSize="12px" color="black">
              {formatTime(data?.firstEntry) || "--"}
            </Typography>
            <Typography variant="body2" fontSize="10px" color="text.secondary">
              Expected{" "}
            </Typography>

            <Typography variant="body2" fontSize="10px" color="text.secondary">
              {formatTime(data?.expectedCheckinTime) || "--"}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell padding="normal">
          {renderStatusChip(data?.checkinStatus)}
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
              {formatTime(data?.lastExit) || "--"}
            </Typography>
            <Typography variant="body2" fontSize="10px" color="text.secondary">
              Expected{" "}
            </Typography>

            <Typography variant="body2" fontSize="10px" color="text.secondary">
              {formatTime(data?.expectedCheckoutTime) || "--"}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell padding="normal">
          {renderStatusChip(data?.checkoutStatus)}
        </TableCell>
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
            fontSize: "11px",
            fontWeight: "500",
            color: "text.secondary",
          }}
        >
          {data?.overTimeMinutes
            ? formatMinutesToHoursMinutes(data?.overTimeMinutes)
            : "0"}
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
          {data?.overTimeStatus || "--"}
        </TableCell>
      </TableRow>

      {/* Confirmation Dialog for Leave Request */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Create Leave Request</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to create a leave request for{" "}
            <strong>{data?.employeeId?.name}</strong> on{" "}
            <strong>{formatISOtDateTime(data?.date)}</strong>?
            <br />
            <br />
            This will create a new leave request with <strong>
              Pending
            </strong>{" "}
            status. The request will need to be approved by a manager.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateLeaveRequest}
            color="primary"
            variant="contained"
            autoFocus
          >
            Create Leave Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
