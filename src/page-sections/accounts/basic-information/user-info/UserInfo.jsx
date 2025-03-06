import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress"; // MUI ICON COMPONENTS

import CameraAlt from "@mui/icons-material/CameraAlt";
import MoreHoriz from "@mui/icons-material/MoreHoriz"; // CUSTOM ICON COMPONENTS

import DateRange from "@/icons/DateRange";
import Bratislava from "@/icons/Bratislava";
import Call from "@/icons/Call";
import MapMarkerIcon from "@/icons/MapMarkerIcon"; // CUSTOM COMPONENTS

import InfoItem from "./InfoItem";
import AvatarBadge from "@/components/avatar-badge";
import AvatarLoading from "@/components/avatar-loading";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph, Small } from "@/components/typography"; // STYLED COMPONENTS
import { format } from "date-fns";

import { ProgressWrapper, ContentWrapper } from "../styles";
import { getProfile, uploadImage } from "../request";

import { utils } from "../../../../utils/functionUtils";
import convertToFormData from "../../../../utils/convertToFormData";

import { useFormik } from "formik";

export default function UserInfo({ data, fetchData }) {
  // const [data, setData] = useState({});

  const formatISOtDateTime = (dateString) => {
    // console.log({ dateString });

    // 2024-12-31T07:10:57Z
    // const date = new Date(dateString);
    const date = new Date("2024-12-31T07:10:57Z");
    console.log({ date });
    return format(date, "dd MMM yyyy, h:mm a");
  };

  const { values, handleSubmit, setFieldValue } = useFormik({
    initialValues: { avatar: null },
  });

  const uploadImageFn = async (file) => {
    try {
      const formData = convertToFormData({ profile_image: file });
      onse = await uploadImage(formData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("second");
      setFieldValue("avatar", file);
    }

    await uploadImageFn(file);
  };

  const imagePreview = values.avatar
    ? URL.createObjectURL(values.avatar)
    : data.avatar
      ? data.avatar
      : "/static/user/user-11.png";

  // const fetchData = async () => {
  //   try {
  //     const response = await getProfile();
  //     console.log({ response });
  //     setData(response.data);
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // };

  useEffect(() => {
    // fetchData();

    return () => {
      if (values.avatar) {
        URL.revokeObjectURL(values.avatar);
      }
    };
  }, [values.avatar, data]);

  return (
    <ContentWrapper>
      <form>
        <FlexBox justifyContent="center">
          <AvatarBadge
            badgeContent={
              <label htmlFor="icon-button-file">
                <input
                  type="file"
                  accept="image/*"
                  id="icon-button-file"
                  onChange={handleImageChange}
                  style={{
                    display: "none",
                  }}
                />

                <IconButton aria-label="upload picture" component="span">
                  <CameraAlt
                    sx={{
                      fontSize: 16,
                      color: "grey.400",
                    }}
                  />
                </IconButton>
              </label>
            }
          >
            <AvatarLoading
              borderSize={2}
              percentage={60}
              alt="Team Member"
              src={imagePreview || data?.avatar}
              sx={{
                width: 100,
                height: 100,
              }}
            />
          </AvatarBadge>
        </FlexBox>
      </form>

      <Box mt={2}>
        <H6 fontSize={18} textAlign="center">
          {data?.first_name || data?.middle_name || data?.last_name
            ? `${data.first_name} ${data.middle_name}  ${data.last_name}`
            : "username"}
        </H6>

        <FlexBetween maxWidth={600} flexWrap="wrap" margin="auto" mt={1}>
          <InfoItem Icon={Call} title={data?.phone_number} />
          <InfoItem Icon={MapMarkerIcon} title={data?.email} />
          <InfoItem Icon={DateRange} title={formatISOtDateTime()} />
        </FlexBetween>

        <FlexBox
        
          alignItems="center"
          justifyContent="center"
          gap={1}
          color="grey.500"
        >
          <Paragraph>Driver Mode</Paragraph>
          <Button disabled={data?.driver_mode === 0 ? false : true}>
            {" "}
            {data?.driver_mode === 0 ? "Active" : "In active"}
          </Button>
        </FlexBox>

        {/* <FlexBetween marginTop={6} flexWrap="wrap">
          <ProgressWrapper>
            <Paragraph mb={0.5}>Profile Completion</Paragraph>

            <FlexBox alignItems="center" gap={1}>
              <LinearProgress
                value={60}
                color="success"
                variant="determinate"
              />
              <Small fontWeight={500}>60%</Small>
            </FlexBox>
          </ProgressWrapper>

          <FlexBox gap={1}>
            <Button size="small" color="secondary">
              Follow
            </Button>

            <Button size="small">Hire Me</Button>

            <Button
              size="small"
              color="secondary"
              sx={{
                minWidth: 0,
              }}
            >
              <MoreHoriz fontSize="small" />
            </Button>
          </FlexBox>
        </FlexBetween> */}
      </Box>
    </ContentWrapper>
  );
}
