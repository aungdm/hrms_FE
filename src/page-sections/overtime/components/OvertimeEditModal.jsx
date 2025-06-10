import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format, parse } from "date-fns";

// Material UI components
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

// Custom components
import Modal from "@/components/modal/Modal";
import { Paragraph } from "@/components/typography";

// API
import { updateOvertimeDetails } from "../request";

// Helper function to convert date to time string
const formatTimeForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return format(date, "HH:mm");
};

// Helper function to parse time string to date
const parseTimeToDate = (timeString, baseDate) => {
  if (!timeString || !baseDate) return null;
  
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  
  return date;
};

// Calculate minutes between two dates or time strings
const calculateMinutes = (startTime, endTime, baseDate) => {
  if (!startTime || !endTime) return 0;
  
  const start = typeof startTime === "string" 
    ? parseTimeToDate(startTime, baseDate) 
    : new Date(startTime);
    
  const end = typeof endTime === "string" 
    ? parseTimeToDate(endTime, baseDate) 
    : new Date(endTime);
  
  if (!start || !end) return 0;
  
  return Math.round((end - start) / (1000 * 60));
};

// Format minutes to hours and minutes
const formatMinutes = (minutes) => {
  if (!minutes) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export default function OvertimeEditModal({ open, handleClose, record, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstEntry: "",
    lastExit: "",
    approvalStatus: "",
    overtimeMinutes: 0
  });

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        firstEntry: formatTimeForInput(record.firstEntry),
        lastExit: formatTimeForInput(record.lastExit),
        approvalStatus: record.overTimeStatus || (record.approvedOverTime ? "Approved" : "Pending"),
        overtimeMinutes: record.overTimeMinutes || record.overtimeMinutes || 0
      });
    }
  }, [record]);

  // Calculate overtime minutes when firstEntry or lastExit changes
  useEffect(() => {
    if (formData.firstEntry && formData.lastExit && record?.date) {
      const start = parseTimeToDate(formData.firstEntry, new Date(record.date));
      const end = parseTimeToDate(formData.lastExit, new Date(record.date));
      if (start && end) {
        setFormData(prev => ({ ...prev, overtimeMinutes: Math.round((end - start) / (1000 * 60)) }));
      }
    }
  }, [formData.firstEntry, formData.lastExit, record?.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const date = new Date(record.date);
      console.log({ date}, "date");
      let firstEntryDate = formData.firstEntry ? parseTimeToDate(formData.firstEntry, date) : undefined;
      let lastExitDate = formData.lastExit ? parseTimeToDate(formData.lastExit, date) : undefined;
      console.log({ firstEntryDate, lastExitDate}, "firstEntryDate and lastExitDate");
      // If firstEntry is after lastExit, add a day to lastExit
      // if (firstEntryDate && lastExitDate && firstEntryDate > lastExitDate) {
      //   lastExitDate.setDate(lastExitDate.getDate() + 1);
      // }
      const data = {
        firstEntry: firstEntryDate,
        lastExit: lastExitDate,
        approvalStatus: formData.approvalStatus
      };
      const response = await updateOvertimeDetails(record._id, data);
      if (response.success) {
        toast.success("Overtime details updated successfully");
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        toast.error("Failed to update overtime details");
      }
    } catch (error) {
      console.error("Error updating overtime details:", error);
      toast.error("An error occurred while updating overtime details");
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <Modal open={open} handleClose={handleClose}>
      <Box sx={{ minWidth: 400, maxWidth: 600, p: 3 }}>
        <Typography variant="h5" mb={3}>
          Edit Overtime Details
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle1">Employee:</Typography>
                <Typography variant="body1" fontWeight="500">
                  {record?.employeeId?.name || "N/A"}
                </Typography>
              </Stack>
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle1">Date:</Typography>
                <Typography variant="body1" fontWeight="500">
                  {record?.date ? format(new Date(record.date), "PPP") : "N/A"}
                </Typography>
              </Stack>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="First Entry"
                name="firstEntry"
                value={formData.firstEntry}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Last Exit"
                name="lastExit"
                value={formData.lastExit}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle1">Overtime Duration:</Typography>
                <Typography variant="body1" fontWeight="500" color="primary">
                  {formatMinutes(formData.overtimeMinutes)}
                </Typography>
              </Stack>
            </Grid> */}
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Approval Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="approvalStatus"
                  value={formData.approvalStatus}
                  onChange={handleChange}
                  label="Approval Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
} 