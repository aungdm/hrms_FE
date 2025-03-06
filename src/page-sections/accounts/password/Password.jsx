import React, { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import * as Yup from "yup";
import { useFormik } from "formik"; // CUSTOM COMPONENTS

import { changePassword } from "./request";
import { getProfile } from "../basic-information/request";
import FlexBox from "@/components/flexbox/FlexBox";
import { H6, Paragraph, Small } from "@/components/typography"; // STYLED COMPONENT

import { FormWrapper, Dot } from "./styles";
import { toast } from "react-toastify";
export default function Password() {
  // const [data, setData] = useState({});
  const initialValues = {
    user_id: "",
    new_password: "",
    current_password: "",
    confirm_password: "",
  };
  const validationSchema = Yup.object({
    current_password: Yup.string()
      .min(3, "Must be greater then 3 characters")
      .required("Current Password is Required!"),
    new_password: Yup.string().min(8).required("New Password is Required!"),
    confirm_password: Yup.string().test(
      "password-should-match",
      "Passwords must match",
      function (value) {
        return this.parent.new_password === value;
      }
    ),
  });
  const {
    values,
    errors,
    setValues,
    handleSubmit,
    handleChange,
    handleBlur,
    resetForm,
    touched,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      console.log({ values });
      try {
        const response = await changePassword(values);
        console.log({ response });
        if (response.success) {
          console.log({ response });
          toast.success("Password Updated Successfully");
          resetForm();
        }
      } catch (error) {
        console.error({ error });
        toast.error("Error Updating Password")
        throw error;
      }
    },
  });

  const fetchData = async () => {
    try {
      const response = await getProfile();
      if (response.success) {
        setValues({ user_id: response?.data?.id });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <H6 fontSize={14} p={3}>
        Change Your Password
      </H6>

      <Divider />

      <FormWrapper>
        <Grid container spacing={5}>
          <Grid
            size={{
              sm: 6,
              xs: 12,
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <TextField
                  fullWidth
                  type="password"
                  variant="outlined"
                  name="current_password"
                  label="Current Password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.current_password}
                  helperText={
                    touched.current_password && errors.current_password
                  }
                  error={Boolean(
                    touched.current_password && errors.current_password
                  )}
                />

                <TextField
                  fullWidth
                  type="password"
                  name="new_password"
                  variant="outlined"
                  label="New Password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.new_password}
                  helperText={touched.new_password && errors.new_password}
                  error={Boolean(touched.new_password && errors.new_password)}
                />

                <TextField
                  fullWidth
                  type="password"
                  variant="outlined"
                  name="confirm_password"
                  label="Confirm Password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.confirm_password}
                  helperText={
                    touched.confirm_password && errors.confirm_password
                  }
                  error={Boolean(
                    touched.confirm_password && errors.confirm_password
                  )}
                />
              </Stack>

              <Stack direction="row" spacing={2} mt={4}>
                <Button type="submit" variant="contained">
                  Save Changes
                </Button>

                <Button variant="outlined">Cancel</Button>
              </Stack>
            </form>
          </Grid>

          {/* <Grid size={12}>
            <Paragraph fontWeight={500}>Password requirements:</Paragraph>
            <Small color="grey.500">
              Ensure that these requirements are met:
            </Small>

            <Stack spacing={1} mt={2}>
              {REQUIREMENTS.map((item) => (
                <FlexBox alignItems="center" gap={1} key={item}>
                  <Dot />
                  <Small>{item}</Small>
                </FlexBox>
              ))}
            </Stack>
          </Grid> */}
        </Grid>
      </FormWrapper>
    </Card>
  );
}
const REQUIREMENTS = [
  "Minimum 8 characters long - the more, the better",
  "At least one lowercase character",
  "At least one uppercase character",
  "At least one number, symbol, or whitespace character",
];
