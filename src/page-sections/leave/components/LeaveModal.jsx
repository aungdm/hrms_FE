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
import HistoryIcon from '@mui/icons-material/History';

// Custom components
import Modal from "@/components/modal/Modal";
import { Paragraph } from "@/components/typography";

// API
import { createLeave, updateLeave, getAllEmployees } from "../request";

export default function LeaveModal({ open, handleClose, record, onSuccess, mode = "create" }) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    status: "Pending",
    createdFromAbsence: false
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
      setFormData({
        employeeId: record.employeeId?._id || record.employeeId,
        date: record.date ? format(new Date(record.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        status: record.status || "Pending",
        createdFromAbsence: record.createdFromAbsence || false
      });
    } else {
      // Reset form for create mode
      setFormData({
        employeeId: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        status: "Pending",
        createdFromAbsence: false
      });
    }
  }, [record, mode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (event, newValue) => {
    setFormData(prev => ({ 
      ...prev, 
      employeeId: newValue?._id || "" 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }
    
    try {
      setLoading(true);
      
      let response;
      if (mode === "edit" && record?._id) {
        // Include the createdFromAbsence field when updating
        response = await updateLeave(record._id, {
          ...formData
        });
      } else {
        response = await createLeave(formData);
      }
      
      if (response.success) {
        toast.success(mode === "edit" ? "Leave updated successfully" : "Leave created successfully");
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        toast.error(mode === "edit" ? "Failed to update leave" : "Failed to create leave");
      }
    } catch (error) {
      console.error("Error saving leave:", error);
      toast.error("An error occurred while saving leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} handleClose={handleClose}>
      <Box sx={{ minWidth: 400, maxWidth: 600, p: 3 }}>
        <Typography variant="h5" mb={1}>
          {mode === "edit" ? "Edit Leave" : "Create Leave"}
        </Typography>
        
        {formData.createdFromAbsence && (
          <Box mb={2}>
            <Chip 
              icon={<HistoryIcon fontSize="small" />} 
              label="Created from absence record" 
              color="info" 
              variant="outlined" 
            />
          </Box>
        )}
        
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
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Leave Date *"
                name="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
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
                  {loading ? (
                    <CircularProgress size={24} /> 
                  ) : mode === "edit" ? (
                    "Update Leave"
                  ) : (
                    "Create Leave"
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