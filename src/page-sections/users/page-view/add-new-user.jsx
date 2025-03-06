import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import styled from "@mui/material/styles/styled"; // MUI ICON COMPONENT
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS
import IconWrapper from "@/components/icon-wrapper";
import GroupSenior from "@/icons/GroupSenior";

import PhotoCamera from "@mui/icons-material/PhotoCamera";
import * as Yup from "yup";
import { useFormik } from "formik"; // CUSTOM COMPONENTS

import { Paragraph, Small } from "@/components/typography"; // CUSTOM UTILS METHOD

import { isDark } from "@/utils/constants"; // STYLED COMPONENTS
import { useEffect, useState } from "react";
import { getRelatedData, createUser, updateUser, getUser } from "../request";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import BookingDetailSkeleton from "@/components/loader/BookingDetailSkeleton.jsx";
import { useNavigate } from "react-router-dom";
import { KeyboardArrowLeft } from "@mui/icons-material";

const SwitchWrapper = styled("div")({
  width: "100%",
  marginTop: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});
const StyledCard = styled(Card)({
  padding: 24,
  minHeight: 300,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  border: "1px solid #ededed",
});
const ButtonWrapper = styled("div")(({ theme }) => ({
  width: 100,
  height: 100,
  display: "flex",
  borderRadius: "50%",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100],
}));
const UploadButton = styled("div")(({ theme }) => ({
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.grey[isDark(theme) ? 600 : 200],
  border: `1px solid ${theme.palette.background.paper}`,
}));
export default function AddNewUserPageView() {
  const navigate = useNavigate();
  const { id } = useParams(); // Use the hook directly
  console.log({ id });
  const [isEdit, setIsEdit] = useState(false);
  const [roles, setRoles] = useState({});
  const initialValues = {
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone_number: "",
    password: "",
    role_id: null,
  };
  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is Required!"),
    middle_name: Yup.string().required("Middle name is Required!"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is Required!"),
    last_name: Yup.string().required("Last name is Required!"),
    phone_number: Yup.number().min(8).required("Phone is Required!"),
    password: Yup.string().required("Password is Required!"),
    role_id: Yup.number()
      .typeError("Role is Required!")
      .required("Role is Required!")
      .integer("Role must be a valid selection!"),
  });
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    touched,
    resetForm,
    setValues,
  } = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      const dataToSubmit = {
        ...values,
        role_id: Number(values.role_id),
      };
      console.log(dataToSubmit);
      try {
        let response;
        if (!isEdit) {
          response = await createUser(values);
        } else {
          const dataObj = {
            ...values,
            role_id: [values.role_id],
          };
          response = await updateUser(id, dataObj);
        }
        console.log({ response });
        if (response.success) {
          toast.success(
            isEdit ? "Data updated successfully" : "Data created successfully"
          );
          resetForm();
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  const fetchList = async () => {
    try {
      const response = await getRelatedData();
      console.log(response.data);
      if (response.success) {
        setRoles(response?.data?.roles);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getUserData = async (id) => {
    try {
      const response = await getUser(id);
      console.log(response.data);
      if (response.success) {
        setValues({
          first_name: response?.data?.first_name || "",
          last_name: response?.data?.last_name || "",
          middle_name: response?.data?.middle_name || "",
          email: response?.data?.email || "",
          phone_number: response?.data?.phone_number || "",
          password: "",
          role_id: response?.data?.roles?.[0]?.id || "",
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    if (id) {
      getUserData(id);
    }
    fetchList();
    setIsEdit(id ? true : false);
  }, []);

  return (
    <div className="pt-2 pb-4">
      <Card sx={{ p: 4 }}>
        <FlexBox alignItems="center" sx={{ pb: 4 }}>
          <KeyboardArrowLeft
            onClick={() => navigate(`/user-list`)}
            sx={{ color: "#6B7280", cursor: "pointer", marginRight: "10px" }}
            fontSize="large"
          />
          <IconWrapper>
            <GroupSenior
              sx={{
                color: "primary.main",
              }}
            />
          </IconWrapper>

          <Paragraph fontSize={16}>
            {" "}
            {isEdit ? "Update User" : "Create User"}
          </Paragraph>
        </FlexBox>
        <Grid container spacing={3}>
          {/* <Grid
            size={{
              md: 4,
              xs: 12,
            }}
          >
            <StyledCard>
              <ButtonWrapper>
                <UploadButton>
                  <label htmlFor="upload-btn">
                    <input
                      accept="image/*"
                      id="upload-btn"
                      type="file"
                      style={{
                        display: "none",
                      }}
                    />
                    <IconButton component="span">
                      <PhotoCamera
                        sx={{
                          fontSize: 26,
                          color: "grey.400",
                        }}
                      />
                    </IconButton>
                  </label>
                </UploadButton>
              </ButtonWrapper>

              <Paragraph
                marginTop={2}
                maxWidth={200}
                display="block"
                textAlign="center"
                color="text.secondary"
              >
                Allowed *.jpeg, *.jpg, *.png, *.gif max size of 3.1 MB
              </Paragraph>
            </StyledCard>
          </Grid> */}

          <Grid
            size={{
              md: 12,
              xs: 12,
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <TextField
                    type="text"
                    fullWidth
                    name="first_name"
                    label="First Name"
                    value={values.first_name}
                    onChange={handleChange}
                    helperText={touched.first_name && errors.first_name}
                    error={Boolean(touched.first_name && errors.first_name)}
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <TextField
                    type="text"
                    fullWidth
                    name="middle_name"
                    label="Middle Name"
                    value={values.middle_name}
                    onChange={handleChange}
                    helperText={touched.middle_name && errors.middle_name}
                    error={Boolean(touched.middle_name && errors.middle_name)}
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <TextField
                    type="text"
                    fullWidth
                    name="last_name"
                    label="Last Name"
                    value={values.last_name}
                    onChange={handleChange}
                    helperText={touched.last_name && errors.last_name}
                    error={Boolean(touched.last_name && errors.last_name)}
                  />
                </Grid>
                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <TextField
                    type="email"
                    fullWidth
                    name="email"
                    label="Email"
                    value={values.email}
                    onChange={handleChange}
                    helperText={touched.email && errors.email}
                    error={Boolean(touched.email && errors.email)}
                  />
                </Grid>

                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <TextField
                    type="number"
                    fullWidth
                    name="phone_number"
                    label="Phone Number"
                    value={values.phone_number}
                    onChange={handleChange}
                    helperText={touched.phone_number && errors.phone_number}
                    error={Boolean(touched.phone_number && errors.phone_number)}
                  />
                </Grid>

                <Grid
                  size={{
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <TextField
                    fullWidth
                    type="password"
                    name="password"
                    label="Password"
                    value={values.password}
                    onChange={handleChange}
                    helperText={touched.password && errors.password}
                    error={Boolean(touched.password && errors.password)}
                  />
                </Grid>

                <Grid
                  size={{
                    sm: 12,
                    xs: 12,
                  }}
                >
                  <TextField
                    select
                    fullWidth
                    name="role_id"
                    // value={values.role_id}
                    style={{ color: "red" }}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "role_id",
                          value: Number(e.target.value),
                        },
                      })
                    }
                    helperText={touched.role_id && errors.role_id}
                    error={Boolean(touched.role_id && errors.role_id)}
                    slotProps={{
                      select: {
                        native: true,
                      },
                    }}
                  >
                    <option value="" disabled>
                      Assign Role
                    </option>
                    {Object.values(roles).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name.charAt(0).toUpperCase() +
                          role.name.slice(1).replace("-", " ")}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={12}>
                  <Button type="submit" variant="contained">
                    {isEdit ? "Update User" : "Create User"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
}
