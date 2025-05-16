import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { toast } from "react-toastify";

// Material UI Components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

// Icons
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TimerIcon from "@mui/icons-material/Timer";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// Custom Components
import { Paragraph } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";

// API
import { get, update } from "../request.js";

export default function AttendanceEditView() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view");
  const [employee, setEmployee] = useState(null);
  const [breaks, setBreaks] = useState([]);

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  // Formik setup
  const validationSchema = Yup.object().shape({
    date: Yup.date().required("Date is required"),
    attendanceStatus: Yup.string().required("Attendance status is required"),
    checkinDate: Yup.date().nullable(),
    checkinTime: Yup.string().nullable(),
    checkoutDate: Yup.date().nullable(),
    checkoutTime: Yup.string().nullable(),
    isManuallyUpdated: Yup.boolean(),
  });

  const initialValues = {
    date: "",
    attendanceStatus: "Present",
    checkinDate: "",
    checkinTime: "",
    expectedCheckin: "",
    checkoutDate: "",
    checkoutTime: "",
    expectedCheckout: "",
    isManuallyUpdated: false,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Prepare data for API
        const data = {
          date: values.date,
          status: values.attendanceStatus,
          isManuallyUpdated: true,
          firstEntry: (values.attendanceStatus === "Absent" || values.attendanceStatus === "Day Off")
            ? null
            : new Date(`${values.checkinDate}T${values.checkinTime}`),
          lastExit: (values.attendanceStatus === "Absent" || values.attendanceStatus === "Day Off" || !values.checkoutDate || !values.checkoutTime)
            ? null
            : new Date(`${values.checkoutDate}T${values.checkoutTime}`),
        };

        const result = await update(id, data);

        if (result.success) {
          toast.success("Attendance record updated successfully");
          fetchRecord(id);
          setMode("view");
        } else {
          toast.error("Failed to update attendance record");
        }
      } catch (error) {
        console.error("Error updating attendance:", error);
        toast.error("An error occurred while updating the record");
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchRecord = async (id) => {
    try {
      setLoading(true);
      const response = await get(id);
      console.log({ response });

      if (response.success) {
        const record = response.data;
        console.log({ record });
        // Set employee info
        setEmployee({
          name: record.employeeId?.name || "Unknown",
          code: record.employeeId?.user_defined_code || "N/A",
          department: record.employeeId?.department || "N/A",
          designation: record.employeeId?.designation || "N/A",
        });

        // Set form values
        formik.setValues({
          date: formatDate(record.date),
          attendanceStatus: record.status || "Present",
          checkinDate: formatDate(record.firstEntry) || formatDate(record.date),
          checkinTime: formatTime(record.firstEntry) || "",
          expectedCheckin: formatTime(record.expectedCheckinTime) || "",
          checkoutDate: formatDate(record.lastExit) || formatDate(record.date),
          checkoutTime: formatTime(record.lastExit) || "",
          expectedCheckout: formatTime(record.expectedCheckoutTime) || "",
          isManuallyUpdated: !!record.isManuallyUpdated,
        });

        // Set breaks if available
        setBreaks(record.breaks || []);
      } else {
        toast.error("Failed to fetch attendance record");
        // navigate('/time-sheet');
      }
    } catch (error) {
      console.error("Error fetching attendance record:", error);
      toast.error("An error occurred while fetching the record");
      // navigate('/time-sheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }

    // Set mode based on URL path
    if (location.pathname.includes("view")) {
      setMode("view");
    } else if (location.pathname.includes("update")) {
      setMode("edit");
    }
  }, [id, location.pathname]);

  // Helper for field props
  const getFieldProps = (fieldName) => ({
    ...formik.getFieldProps(fieldName),
    error: formik.touched[fieldName] && Boolean(formik.errors[fieldName]),
    helperText: formik.touched[fieldName] && formik.errors[fieldName],
    disabled: mode === "view" || loading,
  });

  // Handle mode switching
  const handleModeToggle = () => {
    if (mode === "view") {
      setMode("edit");
    } else {
      fetchRecord(id); // Reset form by refetching
      setMode("view");
    }
  };

  if (loading && !employee) {
  return (
      <Box
              sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ position: "relative" }}>
        {/* Header Section */}
        <Box mb={3}>
          <FlexBox alignItems="center" mb={2}>
            <IconButton onClick={() => navigate("/time-sheet-list")} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">
              {mode === "view" ? "Attendance Details" : "Attendance Edit"}
            </Typography>

            {/* Edit/Save button */}
            {id && (
              <Box sx={{ ml: "auto" }}>
                {mode === "view" ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleModeToggle}
                  >
                    Edit
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleModeToggle}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={formik.handleSubmit}
                      disabled={loading}
                    >
                      Save
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </FlexBox>

          <Divider />
        </Box>

        <form onSubmit={formik.handleSubmit}>
          {/* Employee Information Card */}
          <Card elevation={3} sx={{ mb: 4, overflow: "visible" }}>
            <Box p={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  mr: 3,
                }}
              >
                {employee?.name?.charAt(0) || "U"}
              </Avatar>

              <Grid container spacing={2} py={3}>
                <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employee Code
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {employee?.code}
                  </Typography>
            </Grid>

                <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {employee?.name}
                  </Typography>
          </Grid>

                <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {employee?.department}
                  </Typography>
            </Grid>

                <Grid size={{ md: 3, sm: 6, xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Designation
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {employee?.designation}
                  </Typography>
            </Grid>
          </Grid>
            </Box>
        </Card>

          {/* Attendance Details Card */}
          <Card elevation={3} sx={{ mb: 4 }}>
            <Box p={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Attendance Information
                </Typography>
                
                {/* Manual Update Badge */}
                {formik.values.isManuallyUpdated && (
                  <Chip 
                    label="Manually Updated" 
                    color="secondary" 
                    size="small"
                    sx={{ 
                      fontWeight: 'medium',
                      bgcolor: '#f50057',
                      color: 'white'
                    }}
                  />
                )}
              </Stack>

              <Grid container spacing={1} py={3}>
                <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                    label="Day"
                type="date"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <CalendarTodayIcon
                          sx={{ color: "text.secondary", mr: 1 }}
                          fontSize="small"
                        />
                      ),
                    }}
                    {...getFieldProps("date")}
              />
            </Grid>
            </Grid>

              {/* Attendance Status Options */}
              <Grid container spacing={1} py={2}>
                <Grid size={{ md: 12, sm: 12, xs: 12 }}>
                  <FormControl component="fieldset" disabled={mode === "view"}>
                    <FormLabel component="legend">Attendance Status</FormLabel>
                    <RadioGroup
                      row
                      name="attendanceStatus"
                      value={formik.values.attendanceStatus}
                      onChange={(e) => {
                        formik.setFieldValue("attendanceStatus", e.target.value);
                      }}
                    >
                      <FormControlLabel 
                        value="Present" 
                        control={<Radio />} 
                        label="Present" 
                      />
                      <FormControlLabel 
                        value="Absent" 
                        control={<Radio />} 
                        label="Absent" 
                      />
                      <FormControlLabel 
                        value="Day Off" 
                        control={<Radio />} 
                        label="Day Off" 
                      />
                    </RadioGroup>
                  </FormControl>
            </Grid>
          </Grid>

              {/* Check-in Section - Only show if not Absent or Day Off */}
              {formik.values.attendanceStatus === "Present" && (
                <Grid xs={12} md={6} py={3}>
          <Grid container spacing={2}>
                    <Grid size={{ md: 4, sm: 12, xs: 12 }}>
                  <TextField
                fullWidth
                        label="Checkin Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        {...getFieldProps("checkinDate")}
                        disabled={mode === "view"}
                      />
          </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                        label="Expected Checkin"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <AccessTimeIcon
                              sx={{ color: "text.secondary", mr: 1 }}
                              fontSize="small"
                            />
                          ),
                        }}
                        value={formik.values.expectedCheckin}
                        disabled={true}
                      />
          </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 12 }}>
                  <TextField
                fullWidth
                        label="Checkin Time"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <AccessTimeIcon
                              sx={{ color: "text.secondary", mr: 1 }}
                              fontSize="small"
                            />
                          ),
                        }}
                        {...getFieldProps("checkinTime")}
                        disabled={mode === "view"}
              />
            </Grid>
          </Grid>
            </Grid>
              )}

              {/* Check-out Section - Only show if not Absent or Day Off */}
              {formik.values.attendanceStatus === "Present" && (
                <Grid xs={12} md={6} py={3}>
          <Grid container spacing={2}>
                    <Grid size={{ md: 4, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                        label="Checkout Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        {...getFieldProps("checkoutDate")}
                        disabled={mode === "view"}
              />
            </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                        label="Expected Checkout"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <AccessTimeIcon
                              sx={{ color: "text.secondary", mr: 1 }}
                              fontSize="small"
                            />
                          ),
                        }}
                        value={formik.values.expectedCheckout}
                        disabled={true}
              />
            </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                        label="Checkout Time"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <AccessTimeIcon
                              sx={{ color: "text.secondary", mr: 1 }}
                              fontSize="small"
                            />
                          ),
                        }}
                        {...getFieldProps("checkoutTime")}
                        disabled={mode === "view"}
              />
            </Grid>
          </Grid>
            </Grid>
              )}
            </Box>
        </Card>

          {/* Submit Button */}
          {mode === "edit" && (
            <Box display="flex" justifyContent="flex-end" mb={4}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
                startIcon={<SaveIcon />}
              >
                Save
            </Button>
            </Box>
        )}
      </form>
      </Box>
    </>
  );
}
