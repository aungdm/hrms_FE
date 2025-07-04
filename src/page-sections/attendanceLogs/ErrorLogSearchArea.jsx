import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Search from "@mui/icons-material/Search";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";

const validationSchema = yup.object({
  startDate: yup.date().nullable(),
  endDate: yup
    .date()
    .nullable()
    .when("startDate", (startDate, schema) => {
      if (startDate) {
        return schema.min(
          startDate,
          "End date must be later than start date"
        );
      }
      return schema;
    }),
});

export default function ErrorLogSearchArea({
  handleSearch,
  handleFilterChange,
  employees,
  devices,
}) {
  const formik = useFormik({
    initialValues: {
      startDate: null,
      endDate: null,
      employeeId: "",
      deviceId: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const formattedValues = {
        ...values,
        startDate: values.startDate
          ? format(values.startDate, "yyyy-MM-dd")
          : null,
        endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
      };
      handleFilterChange(formattedValues);
    },
  });

  const handleReset = () => {
    formik.resetForm();
    handleFilterChange({
      startDate: null,
      endDate: null,
      employeeId: "",
      deviceId: "",
    });
  };

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        fullWidth
        placeholder="Search by employee name, ID, or error message..."
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={formik.values.startDate}
              onChange={(value) => formik.setFieldValue("startDate", value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.startDate && Boolean(formik.errors.startDate),
                  helperText: formik.touched.startDate && formik.errors.startDate
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={formik.values.endDate}
              onChange={(value) => formik.setFieldValue("endDate", value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.endDate && Boolean(formik.errors.endDate),
                  helperText: formik.touched.endDate && formik.errors.endDate
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="employee-select-label">Employee</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              name="employeeId"
              value={formik.values.employeeId}
              label="Employee"
              onChange={formik.handleChange}
            >
              <MenuItem value="">
                <em>All Employees</em>
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.name} ({employee.user_defined_code || employee._id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="device-select-label">Device</InputLabel>
            <Select
              labelId="device-select-label"
              id="device-select"
              name="deviceId"
              value={formik.values.deviceId}
              label="Device"
              onChange={formik.handleChange}
            >
              <MenuItem value="">
                <em>All Devices</em>
              </MenuItem>
              {devices.map((device) => (
                <MenuItem key={device.ip} value={device.ip}>
                  {device.name} ({device.ip})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={handleReset}>
          Reset Filters
        </Button>
        <Button type="submit" variant="contained">
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
} 