import Box from "@mui/material/Box";
// import HeadingArea from "../HeadingArea.jsx";
// import SearchArea from "../SearchArea.jsx";
import Card from "@mui/material/Card";
import { Paragraph } from "@/components/typography"; // CUSTOM PAGE SECTION COMPONENTS
import IconWrapper from "@/components/icon-wrapper";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
// import DropZone from "@/components/dropzone";
// import { useCallback } from "react";
import Button from "@mui/material/Button";
import { useState } from "react";
// import { Editor } from "@tinymce/tinymce-react";
// import { useRef } from "react";
import { useFormik } from "formik"; // CUSTOM COMPONENTS
import * as Yup from "yup";
import { create, get, update } from "../request.js";
import { getWorkSchedules } from "../../workSchedule/request.js";
import convertToFormData from "@/utils/convertToFormData.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { useEffect } from "react";
import countryList from "country-list";
import Autocomplete from "@mui/material/Autocomplete";
import { format } from "date-fns";
import { inc } from "nprogress";

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
  const [workSchedules, setWorkSchedules] = useState([]);

  const salutationList = [
    { label: "Mr.", value: "Mr." },
    { label: "Ms.", value: "Ms." },
    { label: "Mrs.", value: "Mrs." },
    { label: "Ms.", value: "Ms." },
    { label: "Dr.", value: "Dr." },
  ];

  const genderList = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const probationList = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const locationList = [{ label: "Lahore", value: "Lahore" }];

  const departmentList = [
    { id: 1, label: "Production", value: "Production" },
    {
      id: 2,
      label: "Research & Development",
      value: "Research & Development",
    },
    { id: 3, label: "Social Media Marketing", value: "Social Media Marketing" },
    { id: 4, label: "Purchasing", value: "Purchasing" },
    { id: 5, label: "Accounting and Finance", value: "Accounting and Finance" },
    { id: 6, label: "IT", value: "IT" },
    { id: 7, label: "Customer Services", value: "Customer Services" },
    { id: 8, label: "Accounts", value: "Accounts" },
    { id: 9, label: "HR", value: "HR" },
    { id: 10, label: "Operations", value: "Operations" },
    { id: 11, label: "Sales Outbound", value: "Sales Outbound" },
    { id: 12, label: "Admin", value: "Admin" },
    {
      id: 13,
      label: "Corporate Legal Department",
      value: "Corporate Legal Department",
    },
  ];

  const branchList = [{ id: 1, label: "Head Office", value: "Head Office" }];

  const employeeTypeList = [
    { id: 1, label: "Field", value: "Field" },
    { id: 2, label: "Non-Field", value: "Non-Field" },
  ];

  const employementTypeList = [
    { id: 1, label: "Management Trainee", value: "Management Trainee" },
    { id: 2, label: "Piece Rated", value: "Piece Rated" },
    { id: 3, label: "Daily Wager", value: "Daily Wager" },
    { id: 4, label: "Permanent", value: "Permanent" },
    { id: 5, label: "Contractual", value: "Contractual" },
  ];

  const designationList = [
    // Entry-Level & Intern Roles
    { id: 1, label: "Internee", value: "Internee" },
    { id: 2, label: "Junior Developer", value: "Junior Developer" },
    { id: 3, label: "Data Entry Officer", value: "Data Entry Officer" },
    { id: 4, label: "Accounts Assistant", value: "Accounts Assistant" },

    // Mid-Level Roles
    { id: 5, label: "Web Developer", value: "Web Developer" },
    { id: 6, label: "Graphic Designer", value: "Graphic Designer" },
    { id: 7, label: "SEO Expert", value: "SEO Expert" },
    { id: 8, label: "Social Media Manager", value: "Social Media Manager" },
    { id: 9, label: "Sales Executive", value: "Sales Executive" },
    { id: 10, label: "QA", value: "QA" },
    { id: 11, label: "Trainer", value: "Trainer" },
    { id: 12, label: "Dispatcher", value: "Dispatcher" },
    { id: 13, label: "Supervisor", value: "Supervisor" },
    { id: 14, label: "Team Lead", value: "Team Lead" },


    // Managerial Roles
    { id: 15, label: "HR Assistant", value: "HR Assistant" },
    { id: 16, label: "HR Manager", value: "HR Manager" },
    { id: 17, label: "Accounts Manager", value: "Accounts Manager" },
    { id: 18, label: "Operation Manager", value: "Operation Manager" },
    { id: 19, label: "IT Coordinator", value: "IT Coordinator" },
    { id: 20, label: "Project Manager", value: "Project Manager" },
    { id: 21, label: "Communication Manager", value: "Communication Manager" },
    {
      id: 22,
      label: "Business Development Executive",
      value: "Business Development Executive",
    },
    { id: 23, label: "Admin Supervisor", value: "Admin Supervisor" },
    { id: 24, label: "Senior Supervisor", value: "Senior Supervisor" },

    // Senior Leadership Roles
    { id: 25, label: "Auditor", value: "Auditor" },
    { id: 26, label: "Legal Advisor", value: "Legal Advisor" },
    { id: 27, label: "General Manager", value: "General Manager" },
    { id: 28, label: "Director", value: "Director" },
    { id: 29, label: "Head", value: "Head" },
    { id: 30, label: "Manager", value: "Manager" },
    { id: 31, label: "CEO", value: "CEO" },
    { id: 32, label: "Office Boy", value: "Office Boy" },


    // Other Roles
    { id: 32, label: "Gardener", value: "Gardener" },
  ];

  const LeaveTypeList = [
    { id: 1, label: "Annual Leaves", value: "Annual Leaves" },
  ];

  const roleTypeList = [
    { id: 1, label: "Employee", value: "Employee" },
    { id: 2, label: "Administrator", value: "Administrator" },
    { id: 3, label: "Manager", value: "Manager" },
    { id: 4, label: "Supervisor", value: "Supervisor" },
    { id: 5, label: "Accountant", value: "Contractual" },
    { id: 6, label: "HOD Sales", value: "HOD Sales" },
  ];

  const payrollList = [
    { id: 1, label: "Monthly Payroll", value: "Monthly Payroll" },
    { id: 2, label: "Hourly Payroll", value: "Hourly Payroll" },
  ];

  const payrollTypeList = [
    { id: 1, label: "Monthly", value: "Monthly" },
    { id: 2, label: "Daily", value: "Daily" },
    { id: 3, label: "Hourly", value: "Hourly" },
  ];

  const paymentMethodList = [
    { id: 1, label: "Cash", value: "Cash" },
    { id: 2, label: "Cheque", value: "Cheque" },
  ];

  const curencyList = [
    { id: 1, label: "PKR (Rupee)", value: "PKR (Rupee)" },
    { id: 2, label: "USD", value: "USD" },
    { id: 3, label: "Euro", value: "Euro" },
  ];
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
    father_or_husband_name: "",
    salutation: "",
    d_o_b: "",
    mobile_no: "",
    cnic_no: "",
    nationality: "",
    gender: "",
    user_defined_code: "",
    joining_date: "",
    probation: "",
    location: "",
    department: "",
    designation: "",
    job_title: "",
    official_email: "",
    employee_type: "",

    payroll: "",
    payroll_type: "",
    payment_method: "",
    currency: "",
    probation_salary: "",
    after_probation_gross_salary: "",
    description: "",

    employment_type: "",
    email_username: "",
    password: "",
    // timeZone: "",
    role: "",
    timeSlot: "",
    leaveTypes: "",
    workDays: [1, 2, 3, 4, 5], // Default Monday to Friday
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .required("Name is Required!"),
    father_or_husband_name: Yup.string()
      .trim()
      .min(2, "Father/Husband Name must be at least 2 characters")
      .required("Father or Husband Name is Required!"),
    salutation: Yup.string().required("Salutation is Required!"),
    d_o_b: Yup.date()
      .max(new Date(), "Date of Birth cannot be in the future")
      .required("Date of Birth is Required!"),
    mobile_no: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Enter a valid Mobile No (10-15 digits)")
      .required("Mobile No is Required!"),
    cnic_no: Yup.string()
      .matches(/^[0-9]{13}$/, "CNIC No must be exactly 13 digits")
      .required("CNIC No is Required!"),
    nationality: Yup.string().required("Nationality is Required!"),
    gender: Yup.string()
      .oneOf(["Male", "Female", "Other", "Mr"], "Invalid gender selection")
      .required("Gender is Required!"),
    user_defined_code: Yup.number()
      .integer("User Code must be an integer")
      .positive("User Code must be a positive number")
      .required("User Code is Required!"),
    joining_date: Yup.date()
      .max(new Date(), "Joining Date cannot be in the future")
      .required("Joining Date is Required!"),
    probation: Yup.string().required("Probation is Required!"),
    location: Yup.string().required("Location is Required!"),
    department: Yup.string().required("Department is Required!"),
    designation: Yup.string().required("Designation is Required!"),
    job_title: Yup.string().required("Job Title is Required!"),
    official_email: Yup.string()
      .email("Enter a valid email address")
      .required("Official Email is Required!"),
    employee_type: Yup.string().required("Employee Type is Required!"),
    payroll: Yup.string().required("Payroll is required"),
    payroll_type: Yup.string().required("Payroll Type is Required"),
    payment_method: Yup.string().required("Payment Method is required"),
    currency: Yup.string().required("Currency is required"),
    probation_salary: Yup.string().required("Probation Salary is required"),
    after_probation_gross_salary: Yup.string().required(
      "After Probation Gross Salary is required"
    ),
    description: Yup.string(),
    employment_type: Yup.string().required("Employment Type is Required!"),
    email_username: Yup.string()
      .trim()
      .min(5, "Email/Username must be at least 5 characters")
      .required("Email/Username is Required!"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@$!%*?&)"
      )
      .required("Password is Required!"),
    // timeZone: Yup.string().required("Time Zone is Required!"),
    role: Yup.string().required("Role is Required!"),
    timeSlot: Yup.string().required("Time Slot is Required!"),
    leaveTypes: Yup.string().required("Leave Types is Required!"),
    workDays: Yup.array()
      .of(Yup.number().min(0).max(6))
      .min(1, "At least one work day must be selected")
      .required("Work days are Required!"),
  });

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    touched,
    setFieldValue,
    resetForm,
    setValues,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      console.log({ values });
      console.log({ mode });
      try {
        // const formData = convertToFormData(values);

        let responseData;
        if (!mode) {
          console.log("Creating employee");
          // Adding _id field with user_defined_code value for new employee creation
          const employeeData = {
            ...values,
            _id: values.user_defined_code.toString(), // Convert to string as MongoDB IDs are strings
          };
          console.log("Employee data with custom ID:", employeeData);
          responseData = await create(employeeData);
          console.log({ responseData });

          if (responseData.success) {
            toast.success("Employee created successfully");
            resetForm();
            navigate("/employee-list");
          } else {
            toast.error("Error creating employee. Please try again.");
          }
        } else {
          console.log("Updating employee");
          //   formData.append("_method", "put");
          responseData = await update(id, values);

          if (responseData.success) {
            toast.success("Employee updated successfully");
            navigate("/employee-list");
          } else {
            toast.error("Error updating employee. Please try again.");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred. Please try again.");
      }
    },
  });

  const fetchRecord = async (id) => {
    try {
      const response = await get(id);
      console.log(response?.data);
      const {
        name,
        father_or_husband_name,
        salutation,
        d_o_b,
        mobile_no,
        cnic_no,
        nationality,
        gender,
        user_defined_code,
        joining_date,
        probation,
        location,
        department,
        designation,
        job_title,
        official_email,
        employee_type,
        payroll,
        payroll_type,
        payment_method,
        currency,
        probation_salary,
        after_probation_gross_salary,
        description,
        employment_type,
        email_username,
        password,
        role,
        timeSlot,
        leaveTypes,
        workDays,
      } = response.data;
      if (response.success) {
        // Ensure workSchedules are loaded before setting timeSlot
        if (workSchedules.length === 0) {
          await fetchWorkSchedules();
        }

        setValues({
          name: name || "",
          father_or_husband_name: father_or_husband_name || "",
          salutation: salutation || "",
          cnic_no: cnic_no || "",
          d_o_b: d_o_b ? format(new Date(d_o_b), "yyyy-MM-dd") : "",
          mobile_no: mobile_no || "",
          nationality: nationality || "",
          gender: gender || "",
          user_defined_code: user_defined_code || "",
          joining_date: joining_date
            ? format(new Date(joining_date), "yyyy-MM-dd")
            : "",
          probation: probation || "",
          location: location || "",
          department: department || "",
          designation: designation || "",
          job_title: job_title || "",
          official_email: official_email || "",
          employee_type: employee_type || "",
          payroll: payroll || "",
          payroll_type: payroll_type || "",
          payment_method: payment_method || "",
          currency: currency || "",
          probation_salary: probation_salary || "",
          after_probation_gross_salary: after_probation_gross_salary || "",
          description: description || "",
          employment_type: employment_type || "",
          email_username: email_username || "",
          // password: password || "",
          role: role || "",
          timeSlot: timeSlot || "",
          leaveTypes: leaveTypes || "",
          workDays: workDays || [1, 2, 3, 4, 5],

        });
        // setFiles(response?.data?.image || null);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Fetch work schedules
  const fetchWorkSchedules = async () => {
    try {
      const response = await getWorkSchedules("", 100, 0);
      if (response?.success && response?.data) {
        setWorkSchedules(response.data);
      }
    } catch (error) {
      console.error("Error fetching work schedules:", error);
    }
  };

  useEffect(() => {
    fetchWorkSchedules();

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
      <Box mb={4} p={2}>
        <FlexBox alignItems="center">
          <IconWrapper>
            <ShoppingCart
              sx={{
                color: "primary.main",
              }}
            />
          </IconWrapper>
          <Paragraph sx={{ fontWeight: 600 }} fontSize={16}>
            Employee
          </Paragraph>
        </FlexBox>
      </Box>
      <form onSubmit={handleSubmit}>
        <Card elevation={22}>
          <Paragraph p={3} fontWeight={600} fontSize={16}>
            Personal Information{" "}
          </Paragraph>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                inputProps={{ readOnly: mode === "view" }}
                type="text"
                fullWidth
                name="name"
                label="Name"
                value={values.name}
                onChange={handleChange}
                helperText={touched.name && errors.name}
                error={Boolean(touched.name && errors.name)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                inputProps={{ readOnly: mode === "view" ? true : false }}
                type="text"
                fullWidth
                name="father_or_husband_name"
                label="Father or Husband Name"
                value={values.father_or_husband_name}
                onChange={handleChange}
                helperText={
                  touched.father_or_husband_name &&
                  errors.father_or_husband_name
                }
                error={Boolean(
                  touched.father_or_husband_name &&
                    errors.father_or_husband_name
                )}
              />
            </Grid>

            <Grid
              p={3}
              size={{
                sm: 6,
                xs: 12,
              }}
            >
              {/* <Autocomplete
                fullWidth
                inputProps={{ readOnly: mode === "view" }}
                disablePortal
                options={salutationList}
                getOptionLabel={(option) => option.label}
                value={
                  salutationList.find(
                    (opt) => opt.value === values.salutation
                  ) || null
                }
                disabled={mode === "view"} // ✅ Prevents selection changes
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "salutation",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="salutation"
                    label="Salutation"
                    helperText={touched.salutation && errors.salutation}
                    error={Boolean(touched.salutation && errors.salutation)}
                    InputProps={{
                      ...params.InputProps,
                      readOnly: mode === "view",
                    }}
                  />
                )}
              /> */}
              <Autocomplete
                fullWidth
                inputProps={{ readOnly: mode === "view" }}
                disablePortal
                options={salutationList}
                getOptionLabel={(option) => option.label}
                value={
                  salutationList.find(
                    (opt) => opt.value === values.salutation
                  ) || null
                }
                onChange={(event, newValue) => {
                  if (mode !== "view") {
                    // Only allow changes if not in view mode
                    handleChange({
                      target: {
                        name: "salutation",
                        value: newValue?.value || "",
                      },
                    });
                  }
                }}
                // Disable dropdown interactions in view mode
                forcePopupIcon={mode !== "view"}
                disableOpenOnFocus={mode === "view"}
                onOpen={(e) => {
                  if (mode === "view") e.preventDefault(); // Block opening dropdown
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="salutation"
                    label="Salutation"
                    helperText={touched.salutation && errors.salutation}
                    error={Boolean(touched.salutation && errors.salutation)}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                inputProps={{ readOnly: mode === "view" ? true : false }}
                type="date"
                fullWidth
                label="Date of Birth"
                name="d_o_b"
                value={values?.d_o_b}
                onChange={handleChange}
                helperText={touched.d_o_b && errors.d_o_b}
                error={Boolean(touched.d_o_b && errors.d_o_b)}
              />
            </Grid>

            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="text"
                fullWidth
                name="mobile_no"
                label="Mobile No"
                value={values.mobile_no}
                onChange={handleChange}
                helperText={touched.mobile_no && errors.mobile_no}
                error={Boolean(touched.mobile_no && errors.mobile_no)}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="text"
                fullWidth
                name="cnic_no"
                label="CNIC No"
                value={values.cnic_no}
                onChange={handleChange}
                helperText={touched.cnic_no && errors.cnic_no}
                error={Boolean(touched.cnic_no && errors.cnic_no)}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>

            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={countries}
                getOptionLabel={(option) => option.label}
                value={
                  countries.find((opt) => opt.value === values.nationality) ||
                  null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "nationality",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="nationality"
                    label="Nationality"
                    helperText={touched.nationality && errors.nationality}
                    error={Boolean(touched.nationality && errors.nationality)}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>
        <Card style={{ marginTop: "40px", marginBottom: "40px" }}>
          <Paragraph p={3} fontWeight={600} fontSize={16}>
            Employment
          </Paragraph>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={genderList}
                getOptionLabel={(option) => option.label}
                value={
                  genderList.find((opt) => opt.value === values.gender) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "gender",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="gender"
                    label="Gender"
                    helperText={touched.gender && errors.gender}
                    error={Boolean(touched.gender && errors.gender)}
                  />
                )}
              />
            </Grid>

            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="text"
                fullWidth
                name="user_defined_code"
                label="User Defined Code"
                value={values.user_defined_code}
                onChange={handleChange}
                helperText={
                  touched.user_defined_code && errors.user_defined_code
                }
                error={Boolean(
                  touched.user_defined_code && errors.user_defined_code
                )}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="date"
                fullWidth
                label="Joining Date"
                name="joining_date"
                value={values.joining_date}
                onChange={handleChange}
                helperText={touched.joining_date && errors.joining_date}
                error={Boolean(touched.joining_date && errors.joining_date)}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>

            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={probationList}
                getOptionLabel={(option) => option.label}
                value={
                  probationList.find((opt) => opt.value === values.probation) ||
                  null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "probation",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="probation"
                    label="Probation"
                    helperText={touched.probation && errors.probation}
                    error={Boolean(touched.probation && errors.probation)}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={locationList}
                getOptionLabel={(option) => option.label}
                value={
                  locationList.find((opt) => opt.value === values.location) ||
                  null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "location",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="location"
                    label="Location"
                    helperText={touched.location && errors.location}
                    error={Boolean(touched.location && errors.location)}
                  />
                )}
              />
            </Grid>

            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={departmentList}
                getOptionLabel={(option) => option.label}
                value={
                  departmentList.find(
                    (opt) => opt.value === values.department
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "department",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="department"
                    label="Department"
                    helperText={touched.department && errors.department}
                    error={Boolean(touched.department && errors.department)}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={designationList}
                getOptionLabel={(option) => option.label}
                value={
                  designationList.find(
                    (opt) => opt.value === values.designation
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "designation",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="designation"
                    label="Designation"
                    helperText={touched.designation && errors.designation}
                    error={Boolean(touched.designation && errors.designation)}
                  />
                )}
              />
            </Grid>

            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={designationList}
                getOptionLabel={(option) => option.label}
                value={
                  designationList.find(
                    (opt) => opt.value === values.job_title
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "job_title",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="job_title"
                    label="Job Title"
                    helperText={touched.job_title && errors.job_title}
                    error={Boolean(touched.job_title && errors.job_title)}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="email"
                fullWidth
                name="official_email"
                label="Official Email"
                value={values.official_email}
                onChange={handleChange}
                helperText={touched.official_email && errors.official_email}
                error={Boolean(touched.official_email && errors.official_email)}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>

            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={employeeTypeList}
                getOptionLabel={(option) => option.label} // Ensures correct label display
                value={
                  employeeTypeList.find(
                    (opt) => opt.value === values.employee_type
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "employee_type",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="employee_type"
                    label="Employee Type"
                    helperText={touched.employee_type && errors.employee_type}
                    error={Boolean(
                      touched.employee_type && errors.employee_type
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={employementTypeList}
                getOptionLabel={(option) => option.label} // Ensures correct label display
                value={
                  employementTypeList.find(
                    (opt) => opt.value === values.employment_type
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "employment_type",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="employment_type"
                    label="Employment Type"
                    helperText={
                      touched.employment_type && errors.employment_type
                    }
                    error={Boolean(
                      touched.employment_type && errors.employment_type
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ marginBottom: "40px" }}>
          <Paragraph p={3} fontWeight={600} fontSize={16}>
            Salary Information{" "}
          </Paragraph>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={payrollList}
                getOptionLabel={(option) => option.label}
                value={
                  payrollList.find((opt) => opt.value === values.payroll) ||
                  null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "payroll",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="payroll"
                    label="Payroll"
                    helperText={touched.payroll && errors.payroll}
                    error={Boolean(touched.payroll && errors.payroll)}
                  />
                )}
              />
            </Grid>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={payrollTypeList}
                getOptionLabel={(option) => option.label}
                value={
                  payrollTypeList.find(
                    (opt) => opt.value === values.payroll_type
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "payroll_type",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="payroll_type"
                    label="Payroll Type"
                    helperText={touched.payroll_type && errors.payroll_type}
                    error={Boolean(touched.payroll_type && errors.payroll_type)}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={paymentMethodList}
                getOptionLabel={(option) => option.label}
                value={
                  paymentMethodList.find(
                    (opt) => opt.value === values.payment_method
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "payment_method",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="payment_method"
                    label="Payment Method"
                    helperText={touched.payment_method && errors.payment_method}
                    error={Boolean(
                      touched.payment_method && errors.payment_method
                    )}
                  />
                )}
              />
            </Grid>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={curencyList}
                getOptionLabel={(option) => option.label}
                value={
                  curencyList.find((opt) => opt.value === values.currency) ||
                  null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "currency",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="currency"
                    label="Currency"
                    helperText={touched.currency && errors.currency}
                    error={Boolean(touched.currency && errors.currency)}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="number"
                fullWidth
                name="probation_salary"
                label="Probation Salary"
                value={values.probation_salary}
                onChange={handleChange}
                helperText={touched.probation_salary && errors.timeSlot}
                error={Boolean(
                  touched.probation_salary && errors.probation_salary
                )}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="number"
                fullWidth
                name="after_probation_gross_salary"
                label="After Probation/Gross Salary"
                value={values.after_probation_gross_salary}
                onChange={handleChange}
                helperText={
                  touched.after_probation_gross_salary &&
                  errors.after_probation_gross_salary
                }
                error={Boolean(
                  touched.after_probation_gross_salary &&
                    errors.after_probation_gross_salary
                )}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                helperText={touched.description && errors.description}
                error={Boolean(touched.description && errors.description)}
                inputProps={{ readOnly: mode === "view" }}
                multiline // Makes it a textarea
                rows={4} // Adjust the number of visible rows
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ marginBottom: "20" }}>
          <Paragraph p={3} fontWeight={600} fontSize={16}>
            User Account Information
          </Paragraph>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="text"
                fullWidth
                name="email_username"
                label="Email/Username"
                value={values["email_username"]}
                onChange={handleChange}
                helperText={
                  touched["email_username"] && errors["email_username"]
                }
                error={Boolean(
                  touched["email_username"] && errors["email_username"]
                )}
                inputProps={{ readOnly: mode === "view" }}
              />
            </Grid>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={LeaveTypeList}
                getOptionLabel={(option) => option.label}
                value={
                  LeaveTypeList.find(
                    (opt) => opt.value === values.leaveTypes
                  ) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "leaveTypes",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="leaveTypes"
                    label="Leave Types"
                    helperText={touched.leaveTypes && errors.leaveTypes}
                    error={Boolean(touched.leaveTypes && errors.leaveTypes)}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <TextField
                type="password"
                fullWidth
                name="password"
                label="Password"
                value={values.password}
                onChange={handleChange}
                helperText={touched.password && errors.password}
                error={Boolean(touched.password && errors.password)}
              />
            </Grid>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={roleTypeList}
                getOptionLabel={(option) => option.label}
                value={
                  roleTypeList.find((opt) => opt.value === values.role) || null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "role",
                      value: newValue?.value || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "45px" } }}
                    name="role"
                    label="Role"
                    helperText={touched.role && errors.role}
                    error={Boolean(touched.role && errors.role)}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={workSchedules}
                getOptionLabel={(option) => {
                  // Handle both object and string cases
                  if (typeof option === "object" && option !== null) {
                    return `${option.name} (${option.shiftStart} - ${option.shiftEnd})`;
                  }
                  // If it's a string ID, try to find the matching schedule
                  const schedule = workSchedules.find((s) => s._id === option);
                  return schedule
                    ? `${schedule.name} (${schedule.shiftStart} - ${schedule.shiftEnd})`
                    : option || "";
                }}
                value={
                  workSchedules.find((opt) => opt._id === values.timeSlot) ||
                  values.timeSlot ||
                  null
                }
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "timeSlot",
                      value: newValue?._id || "",
                    },
                  });
                }}
                disabled={mode === "view"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ "& .MuiInputBase-root": { height: "auto" } }}
                    name="timeSlot"
                    label="Work Schedule"
                    helperText={touched.timeSlot && errors.timeSlot}
                    error={Boolean(touched.timeSlot && errors.timeSlot)}
                  />
                )}
              />
            </Grid>
            <Grid p={3} size={{ md: 6, sm: 12, xs: 12 }}>
              <Autocomplete
                sx={{ minHeight: "100px" }}
                multiple
                id="workDays"
                options={workDaysList}
                getOptionLabel={(option) =>
                  typeof option === "object"
                    ? option.label
                    : workDaysList.find((day) => day.value === option)?.label ||
                      ""
                }
                value={values?.workDays?.map(
                  (dayValue) =>
                    workDaysList.find((day) => day.value === dayValue) ||
                    dayValue
                )}
                onChange={(_, newValue) => {
                  const selectedValues = newValue.map((item) =>
                    typeof item === "object" ? item.value : item
                  );
                  setFieldValue("workDays", selectedValues);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Work Days *"
                    placeholder="Select work days"
                    error={touched.workDays && Boolean(errors.workDays)}
                    helperText={touched.workDays && errors.workDays}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>
        {mode === "view" ? (
          <></>
        ) : (
          <Grid pt={3} pb={6} size={12}>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Grid>
        )}
      </form>
    </>
  );
}
