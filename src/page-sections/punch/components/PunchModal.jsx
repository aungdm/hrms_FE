import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

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
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

// Custom components
import Modal from "@/components/modal/Modal";
import { Paragraph } from "@/components/typography";

// API
import { createPunch, updatePunch, getAllEmployees, getAttendanceRecordsByEmployee } from "../request";

export default function PunchModal({ open, handleClose, record, onSuccess, mode = "create" }) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    attendanceId: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    punchType: "firstEntry"
  });

  // Load employees when modal opens
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getAllEmployees();
        if (response.success) {
          setEmployees(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees");
      }
    };

    if (open) {
      fetchEmployees();
    }
  }, [open]);

  // Initialize form data when record changes (for edit mode)
  useEffect(() => {
    if (record && mode === "edit") {
      const recordTime = record.time ? new Date(record.time) : new Date();
      
      setFormData({
        employeeId: record.employeeId?._id || record.employeeId,
        attendanceId: record.attendanceId || "",
        date: record.date ? format(new Date(record.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        time: format(recordTime, 'HH:mm'),
        punchType: record.punchType || "firstEntry"
      });

      // Fetch attendance records if employeeId exists
      if (record.employeeId) {
        fetchAttendanceRecords(record.employeeId?._id || record.employeeId);
      }
    } else {
      // Reset form for create mode
      setFormData({
        employeeId: "",
        attendanceId: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        punchType: "firstEntry"
      });
      setAttendanceRecords([]);
    }
  }, [record, mode, open]);

  // Fetch attendance records when employee changes
  const fetchAttendanceRecords = async (employeeId) => {
    try {
      if (!employeeId) {
        setAttendanceRecords([]);
        return;
      }

      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      
      const startDate = format(oneMonthAgo, 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');
      
      const response = await getAttendanceRecordsByEmployee(
        employeeId,
        startDate,
        endDate
      );
      
      if (response.success) {
        setAttendanceRecords(response.data || []);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to load attendance records");
      setAttendanceRecords([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (event, newValue) => {
    const newEmployeeId = newValue?._id || "";
    
    setFormData(prev => ({ 
      ...prev, 
      employeeId: newEmployeeId,
      attendanceId: "" // Reset attendance record when employee changes
    }));
    
    if (newEmployeeId) {
      fetchAttendanceRecords(newEmployeeId);
    } else {
      setAttendanceRecords([]);
    }
  };

  const handleAttendanceRecordChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      attendanceId: newValue?._id || "",
      date: newValue ? format(new Date(newValue.date), 'yyyy-MM-dd') : prev.date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!formData.attendanceId) {
      toast.error("Please select an attendance record");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    if (!formData.time) {
      toast.error("Please select a time");
      return;
    }

    if (!formData.punchType) {
      toast.error("Please select a punch type");
      return;
    }
    
    try {
      setLoading(true);

      // Combine date and time into a single ISO string
      const isoDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      let response;
      if (mode === "edit" && record?._id) {
        response = await updatePunch(record._id, {
          ...formData,
          time: isoDateTime
        });
      } else {
        response = await createPunch({
          ...formData,
          time: isoDateTime
        });
      }
      
      if (response.success) {
        toast.success(mode === "edit" ? "Punch request updated successfully" : "Punch request created successfully");
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        toast.error(mode === "edit" ? "Failed to update punch request" : "Failed to create punch request");
      }
    } catch (error) {
      console.error("Error saving punch request:", error);
      toast.error("An error occurred while saving punch request");
    } finally {
      setLoading(false);
    }
  };

  const getPunchTypeLabel = (punchType) => {
    switch(punchType) {
      case "firstEntry": return "First Entry (Check-in)";
      case "lastExit": return "Last Exit (Check-out)";
      case "overtimeStart": return "Overtime Start";
      case "overtimeEnd": return "Overtime End";
      default: return punchType;
    }
  };

  // Format attendance record option for display
  const formatAttendanceRecord = (record) => {
    if (!record) return "";
    
    const date = new Date(record.date);
    const formattedDate = format(date, 'dd MMM yyyy');
    
    let status = record.status || "Unknown";
    
    // Add time information if available
    let timeInfo = "";
    if (record.firstEntry) {
      timeInfo += ` In: ${format(new Date(record.firstEntry), 'HH:mm')}`;
    }
    if (record.lastExit) {
      timeInfo += ` Out: ${format(new Date(record.lastExit), 'HH:mm')}`;
    }
    
    return `${formattedDate} - ${status}${timeInfo}`;
  };

  return (
    <Modal open={open} handleClose={handleClose}>
      <Box sx={{ minWidth: 400, maxWidth: 600, p: 3 }}>
        <Typography variant="h5" mb={3}>
          {mode === "edit" ? "Edit Punch Request" : "Create Punch Request"}
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={employees}
                getOptionLabel={(option) => option.name || ""}
                onChange={handleEmployeeChange}
                value={employees.find(emp => emp._id === formData.employeeId) || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee *"
                    placeholder="Select Employee"
                    required
                  />
                )}
              />
            </Grid>
            
            {formData.employeeId && (
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  options={attendanceRecords}
                  getOptionLabel={(option) => formatAttendanceRecord(option)}
                  onChange={handleAttendanceRecordChange}
                  value={attendanceRecords.find(record => record._id === formData.attendanceId) || null}
                  loading={attendanceRecords.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Attendance Record *"
                      placeholder="Select an attendance record"
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {attendanceRecords.length === 0 && <CircularProgress color="inherit" size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Stack direction="column" spacing={0.5} width="100%">
                        <Typography variant="body2">
                          {format(new Date(option.date), 'dd MMM yyyy')}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={option.status} 
                            size="small"
                            color={
                              option.status === "Present" ? "success" :
                              option.status === "Absent" ? "error" :
                              option.status === "Half Day" ? "warning" :
                              "default"
                            }
                          />
                          {option.firstEntry && (
                            <Typography variant="caption">
                              In: {format(new Date(option.firstEntry), 'HH:mm')}
                            </Typography>
                          )}
                          {option.lastExit && (
                            <Typography variant="caption">
                              Out: {format(new Date(option.lastExit), 'HH:mm')}
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </li>
                  )}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date *"
                name="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Time *"
                name="time"
                value={formData.time}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="punch-type-label">Punch Type</InputLabel>
                <Select
                  labelId="punch-type-label"
                  name="punchType"
                  value={formData.punchType}
                  onChange={handleChange}
                  label="Punch Type *"
                >
                  <MenuItem value="firstEntry">{getPunchTypeLabel("firstEntry")}</MenuItem>
                  <MenuItem value="lastExit">{getPunchTypeLabel("lastExit")}</MenuItem>
                  
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
                  {loading ? (
                    <CircularProgress size={24} /> 
                  ) : mode === "edit" ? (
                    "Update Request"
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
} 