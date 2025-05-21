import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { Paragraph } from "@/components/typography"; // CUSTOM PAGE SECTION COMPONENTS
import IconWrapper from "@/components/icon-wrapper";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import { useFormik } from "formik"; // CUSTOM COMPONENTS
import * as Yup from "yup";
import { create, get, update } from "../request.js";
import convertToFormData from "@/utils/convertToFormData.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import countryList from "country-list";
import Autocomplete from "@mui/material/Autocomplete";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function CreateView() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // const countries = countryList.getNames();
  const countries = countryList.getNames().map((name) => ({
    label: name,
    value: name,
  }));

  const id = params.id;
  console.log({ id }, { params }, location.pathname);

  const [mode, setMode] = useState(false);

  const workDaysList = [
    { id: 0, label: "Sunday", value: 0 },
    { id: 1, label: "Monday", value: 1 },
    { id: 2, label: "Tuesday", value: 2 },
    { id: 3, label: "Wednesday", value: 3 },
    { id: 4, label: "Thursday", value: 4 },
    { id: 5, label: "Friday", value: 5 },
    { id: 6, label: "Saturday", value: 6 },
  ];

  const initialValues = {
    name: "",
    workDays: [1, 2, 3, 4, 5], // Default Monday to Friday
    shiftStart: "",
    shiftEnd: "",
    graceTimeInMinutes: 15,
    minWorkHours: 8,
    minWorkHoursForHalfDay: 4,
    description: "",
    isActive: true,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .required("Schedule name is Required!"),
    workDays: Yup.array()
      .of(Yup.number().min(0).max(6))
      .min(1, "At least one work day must be selected")
      .required("Work days are Required!"),
    shiftStart: Yup.string()
      .matches(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Format must be HH:MM in 24-hour format"
      )
      .required("Shift start time is Required!"),
    shiftEnd: Yup.string()
      .matches(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Format must be HH:MM in 24-hour format"
      )
      .required("Shift end time is Required!"),
    graceTimeInMinutes: Yup.number()
      .min(0, "Grace time cannot be negative")
      .max(60, "Grace time cannot exceed 60 minutes"),
    minWorkHours: Yup.number()
      .min(1, "Minimum work hours must be at least 1")
      .max(24, "Minimum work hours cannot exceed 24"),
    minWorkHoursForHalfDay: Yup.number()
      .min(0.5, "Minimum work hours for half day must be at least 0.5")
      .max(12, "Minimum work hours for half day cannot exceed 12"),
    description: Yup.string().max(
      500,
      "Description must be at most 500 characters"
    ),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!id) {
        // Create mode
        const response = await create(values);
        if (response.success) {
          toast.success("Work Schedule created successfully");
          navigate("/time-slot-list");
          } else {
          toast.error("Failed to create work schedule");
          }
        } else {
        // Update mode
        const response = await update(id, values);
        if (response.success) {
          toast.success("Work Schedule updated successfully");
          navigate("/time-slot-list");
          } else {
          toast.error("Failed to update work schedule");
          }
      }
    },
  });

  const fetchRecord = async (id) => {
    try {
      const response = await get(id);
      console.log(response?.data);
      const {
        name,
        workDays,
        shiftStart,
        shiftEnd,
        graceTimeInMinutes,
        minWorkHours,
        minWorkHoursForHalfDay,
        description,
        isActive,
      } = response.data;
      if (response.success) {
        console.log({ name, workDays, shiftStart, shiftEnd, graceTimeInMinutes, minWorkHours, minWorkHoursForHalfDay, description, isActive });
        formik.setValues({
          name: name || "",
          workDays: workDays || [1, 2, 3, 4, 5],
          shiftStart: shiftStart || "",
          shiftEnd: shiftEnd || "",
          graceTimeInMinutes: graceTimeInMinutes || 15,
          minWorkHours: minWorkHours || 8,
          minWorkHoursForHalfDay: minWorkHoursForHalfDay || 4,
          description: description || "",
          isActive: isActive || true,
        });
        // setFiles(response?.data?.image || null);
      } 
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }

    if (location.pathname.includes("view")) {
      return setMode("view");
    } else if (id) {
      setMode("edit");
    }
  }, []);

  return (
    <>
      <Box py={3}>
        <Card
          sx={{
            padding: 3,
          }}
        >
          <form
            onSubmit={formik.handleSubmit}
            encType="multipart/form-data"
            method="POST"
          >
            <Grid xs={12}>
              <FlexBetween>
                <FlexBox gap={0.5}>
          <IconWrapper>
            <ShoppingCart
              sx={{
                color: "primary.main",
              }}
            />
          </IconWrapper>

                  <Paragraph fontSize={16} fontWeight={500}>
                    {id ? "Update Work Schedule" : "Create Work Schedule"}
          </Paragraph>
        </FlexBox>
              </FlexBetween>
          </Grid>

            <Grid container spacing={2} mt={2}>
              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                  name="name"
                  label="Schedule Name *"
                  placeholder="Enter schedule name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                  <TextField
                fullWidth
                  name="shiftStart"
                  label="Shift Start Time (HH:MM) *"
                  placeholder="e.g., 09:00"
                  value={formik.values.shiftStart}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.shiftStart &&
                    Boolean(formik.errors.shiftStart)
                  }
                  helperText={
                    formik.touched.shiftStart && formik.errors.shiftStart
                  }
              />
            </Grid>
          </Grid>

            <Grid container spacing={2} mt={2}>
              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                  name="shiftEnd"
                  label="Shift End Time (HH:MM) *"
                  placeholder="e.g., 17:00"
                  value={formik.values.shiftEnd}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.shiftEnd && Boolean(formik.errors.shiftEnd)
                  }
                  helperText={formik.touched.shiftEnd && formik.errors.shiftEnd}
              />
            </Grid>

              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                  type="number"
                  name="minWorkHoursForHalfDay"
                  label="Minimum Work Hours (Half Day)"
                  placeholder="Enter minimum work hours for half day"
                  value={formik.values.minWorkHoursForHalfDay}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.minWorkHoursForHalfDay &&
                    Boolean(formik.errors.minWorkHoursForHalfDay)
                  }
                helperText={
                    formik.touched.minWorkHoursForHalfDay &&
                    formik.errors.minWorkHoursForHalfDay
                }
              />
            </Grid>
          </Grid>
            <Grid container spacing={2} mt={2}>
              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                  type="number"
                  name="graceTimeInMinutes"
                  label="Grace Time (minutes)"
                  placeholder="Enter grace time in minutes"
                  value={formik.values.graceTimeInMinutes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.graceTimeInMinutes &&
                    Boolean(formik.errors.graceTimeInMinutes)
                  }
                  helperText={
                    formik.touched.graceTimeInMinutes &&
                    formik.errors.graceTimeInMinutes
                  }
              />
            </Grid>

              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                  <TextField
                fullWidth
                  type="number"
                  name="minWorkHours"
                  label="Minimum Work Hours (Full Day)"
                  placeholder="Enter minimum work hours"
                  value={formik.values.minWorkHours}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.minWorkHours &&
                    Boolean(formik.errors.minWorkHours)
                  }
                  helperText={
                    formik.touched.minWorkHours && formik.errors.minWorkHours
                  }
              />
            </Grid>
          </Grid>

            <Grid container spacing={2} mt={2}>
              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description"
                  placeholder="Enter description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                    helperText={
                    formik.touched.description && formik.errors.description
                    }
              />
            </Grid>
              <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                  sx={{ minHeight: "100px" }}
                  multiple
                  id="workDays"
                  options={workDaysList}
                  getOptionLabel={(option) =>
                    typeof option === "object"
                      ? option.label
                      : workDaysList.find((day) => day.value === option)
                          ?.label || ""
                  }
                  value={formik.values.workDays.map(
                    (dayValue) =>
                      workDaysList.find((day) => day.value === dayValue) ||
                      dayValue
                  )}
                  onChange={(_, newValue) => {
                    const selectedValues = newValue.map((item) =>
                      typeof item === "object" ? item.value : item
                    );
                    formik.setFieldValue("workDays", selectedValues);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                      label="Work Days *"
                      placeholder="Select work days"
                      error={
                        formik.touched.workDays &&
                        Boolean(formik.errors.workDays)
                      }
                      helperText={
                        formik.touched.workDays && formik.errors.workDays
                      }
                  />
                )}
              />
            </Grid>
          </Grid>

            <Grid container spacing={2} mt={2}>
              <Grid size={{ md: 12, sm: 12, xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isActive}
                      onChange={(event) => {
                        formik.setFieldValue("isActive", event.target.checked);
                      }}
                      color="primary"
                      name="isActive"
                      disabled={mode === "view"}
                    />
                  }
                  label={formik.values.isActive ? "Active" : "Inactive"}
                  sx={{ 
                    color: formik.values.isActive ? "success.main" : "error.main",
                    fontWeight: 500
                  }}
              />
            </Grid>
          </Grid>

            <Grid xs={12}>
              <FlexBox justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/work-schedule-list")}
                >
                  Cancel
                </Button>
            <Button type="submit" variant="contained">
                  {id ? "Update" : "Create"}
            </Button>
              </FlexBox>
          </Grid>
      </form>
        </Card>
      </Box>
    </>
  );
}
