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
import AccessTime from "@mui/icons-material/AccessTime";
import Refresh from "@mui/icons-material/Refresh";
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
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { toast } from "react-toastify";

// Import the createLeave function and punch API functions
import { createLeave } from "@/page-sections/leave/request";
import { getPunches, createPunch } from "@/page-sections/punch/request";
import { recalculateAttendance } from "@/page-sections/timeSheet/request";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
  // console.log(data, "table row data");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [punchRequestDialogOpen, setPunchRequestDialogOpen] = useState(false);
  const [punchRequestData, setPunchRequestData] = useState({
    time: "",
    punchType: "",
  });
  const [loading, setLoading] = useState(false);
  const [recalculateDialogOpen, setRecalculateDialogOpen] = useState(false);
  const [recalculateLoading, setRecalculateLoading] = useState(false);
  const [recalculateResult, setRecalculateResult] = useState({
    success: false,
    message: "",
  });

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

  // Check if attendance record has missing entries that can be requested via punch
  const hasMissingEntries = () => {
    return (
      data?.status !== "Absent" &&
      data?.status !== "Day Off" &&
      (!data?.firstEntry || !data?.lastExit)
    );
  };

  // Get available punch types based on missing entries
  const getAvailablePunchTypes = () => {
    const availableTypes = [{ value: "firstEntry", label: "First Entry" }, { value: "lastExit", label: "Last Exit" }];
    
    // if (!data?.firstEntry) {
    //   availableTypes.push({ value: "firstEntry", label: "First Entry" });
    // }
    
    // if (!data?.lastExit) {
    //   availableTypes.push({ value: "lastExit", label: "Last Exit" });
    // }

    return availableTypes;
  };

  // Handle opening the confirmation dialog
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
    handleCloseOpenMenu();
  };

  // Handle closing the confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Handle opening punch request dialog
  const handleOpenPunchRequestDialog = () => {
    setPunchRequestDialogOpen(true);
    setPunchRequestData({
      time: "",
      punchType: "",
    });
    handleCloseOpenMenu();
  };

  // Handle closing punch request dialog
  const handleClosePunchRequestDialog = () => {
    setPunchRequestDialogOpen(false);
    setPunchRequestData({
      time: "",
      punchType: "",
    });
  };

  // Handle opening recalculate dialog
  const handleOpenRecalculateDialog = () => {
    setRecalculateDialogOpen(true);
    handleCloseOpenMenu();
  };

  // Handle closing recalculate dialog
  const handleCloseRecalculateDialog = () => {
    setRecalculateDialogOpen(false);
    // Reset result after dialog is closed
    setTimeout(() => {
      setRecalculateResult({
        success: false,
        message: "",
      });
    }, 300);
  };

  // Handle punch request form input changes
  const handlePunchRequestInputChange = (field, value) => {
    setPunchRequestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if punch request already exists for this attendance and punch type
  const checkExistingPunchRequest = async (attendanceId, punchType) => {
    try {
      const response = await getPunches({
        attendanceId: attendanceId,
        punchType: punchType,
        perPage: 1,
        page: 1
      });
      
      if (response.success) {
        return response.data && response.data.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking existing punch request:', error);
      return false;
    }
  };

  // Handle creating a punch request
  const handleCreatePunchRequest = async () => {
    try {
      if (!punchRequestData.time || !punchRequestData.punchType) {
        toast.error("Please fill in all required fields");
        return;
      }

      setLoading(true);

      // Check if punch request already exists
      const existingRequest = await checkExistingPunchRequest(data._id, punchRequestData.punchType);
      
      if (existingRequest) {
        toast.error(`A punch request for ${punchRequestData.punchType} already exists for this attendance record`);
        setLoading(false);
        return;
      }

      // Format the time with the attendance date
      const attendanceDate = new Date(data.date);
      const [hours, minutes] = punchRequestData.time.split(':');
      const punchDateTime = new Date(attendanceDate);
      punchDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Create punch request using the existing API function
      const punchData = {
        employeeId: data.employeeId._id,
        attendanceId: data._id,
        date: data.date,
        time: punchDateTime.toISOString(),
        punchType: punchRequestData.punchType,
      };

      const response = await createPunch(punchData);

      if (response.success) {
        toast.success("Punch request created successfully");
        handleClosePunchRequestDialog();
      } else {
        toast.error("Failed to create punch request");
      }
    } catch (error) {
      console.error("Error creating punch request:", error);
      toast.error("An error occurred while creating punch request");
    } finally {
      setLoading(false);
    }
  };

  // Handle recalculating attendance
  const handleRecalculateAttendance = async () => {
    try {
      setRecalculateLoading(true);
      
      const response = await recalculateAttendance(data._id);
      
      setRecalculateResult({
        success: response.success,
        message: response.message,
        data: response.data
      });
      
      if (response.success) {
        toast.success("Attendance recalculated successfully");
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(response.message || "Failed to recalculate attendance");
      }
    } catch (error) {
      console.error("Error recalculating attendance:", error);
      setRecalculateResult({
        success: false,
        message: "An error occurred while recalculating attendance"
      });
      toast.error("An error occurred while recalculating attendance");
    } finally {
      setRecalculateLoading(false);
    }
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
            {hasMissingEntries() && (
              <TableMoreMenuItem
                Icon={AccessTime}
                title="Punch Request"
                handleClick={handleOpenPunchRequestDialog}
              />
            )}
            <TableMoreMenuItem
              Icon={Refresh}
              title="Recalculate"
              handleClick={handleOpenRecalculateDialog}
            />
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
          {renderStatusChip(data?.checkinStatus === "Early" ? "On Time" : data?.checkinStatus)}
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
          {renderStatusChip(data?.checkoutStatus === "Late" ? "On Time" : data?.checkoutStatus)}
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

      {/* Punch Request Dialog */}
      <Dialog
        open={punchRequestDialogOpen}
        onClose={handleClosePunchRequestDialog}
        aria-labelledby="punch-request-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="punch-request-dialog-title">
          Create Punch Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a punch request for <strong>{data?.employeeId?.name}</strong> on{" "}
            <strong>{formatISOtDateTime(data?.date)}</strong>
          </DialogContentText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Time"
              type="time"
              value={punchRequestData.time}
              onChange={(e) => handlePunchRequestInputChange('time', e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <FormControl fullWidth required>
              <InputLabel>Punch Type</InputLabel>
              <Select
                value={punchRequestData.punchType}
                onChange={(e) => handlePunchRequestInputChange('punchType', e.target.value)}
                label="Punch Type"
              >
                {getAvailablePunchTypes().map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePunchRequestDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleCreatePunchRequest}
            color="primary"
            variant="contained"
            disabled={loading || !punchRequestData.time || !punchRequestData.punchType}
          >
            {loading ? "Creating..." : "Create Punch Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recalculate Attendance Dialog */}
      <Dialog
        open={recalculateDialogOpen}
        onClose={handleCloseRecalculateDialog}
        aria-labelledby="recalculate-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="recalculate-dialog-title">
          Recalculate Attendance
        </DialogTitle>
        <DialogContent>
          {!recalculateResult.success && !recalculateLoading && (
            <DialogContentText>
              Are you sure you want to recalculate attendance for <strong>{data?.employeeId?.name}</strong> on{" "}
              <strong>{formatISOtDateTime(data?.date)}</strong>?
              <br /><br />
              This will update the attendance record based on the current work schedule and attendance logs.
              Any manual changes may be overwritten.
            </DialogContentText>
          )}
          
          {recalculateLoading && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Recalculating attendance...
              </Typography>
            </Box>
          )}
          
          {recalculateResult.success && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" color="success.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                {recalculateResult.message}
              </Typography>
              
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2">Updated Attendance Details:</Typography>
                <Stack spacing={1} mt={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Typography variant="body2" fontWeight="medium">{recalculateResult.data?.status || '--'}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Check-in:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {recalculateResult.data?.firstEntry ? formatTime(recalculateResult.data?.firstEntry) : '--'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Check-out:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {recalculateResult.data?.lastExit ? formatTime(recalculateResult.data?.lastExit) : '--'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Work Duration:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatMinutesToHoursMinutes(recalculateResult.data?.workDuration)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}
          
          {!recalculateResult.success && recalculateResult.message && !recalculateLoading && (
            <Typography variant="body1" color="error" sx={{ mt: 2 }}>
              {recalculateResult.message}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecalculateDialog} color="primary">
            {recalculateResult.success ? "Close" : "Cancel"}
          </Button>
          {!recalculateResult.success && !recalculateLoading && (
            <Button
              onClick={handleRecalculateAttendance}
              color="primary"
              variant="contained"
              disabled={recalculateLoading}
            >
              {recalculateLoading ? "Recalculating..." : "Recalculate"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
