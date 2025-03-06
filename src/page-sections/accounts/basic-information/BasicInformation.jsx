import { Fragment } from "react";
import Card from "@mui/material/Card"; // CUSTOM COMPONENTS
import React, { useEffect, useState } from "react";

import InfoForm from "./info-form";
import UserInfo from "./user-info"; // STYLED COMPONENTS

import { CoverPicWrapper } from "./styles";
import { getProfile } from "./request";
import CircularProgresss from "@/components/loader/CircularProgress.jsx";
import { Box } from "@mui/material";

export default function BasicInformation() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      console.log({ response });
      setData(response.data);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <Box 
          sx={{
            height: "50vh",
            width: "50vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgresss />
        </Box>
      ) : (
        <Fragment>
          <Card
            sx={{
              padding: 3,
              position: "relative",
            }}
          >
            {/* COVER IMAGE SECTION */}
            <CoverPicWrapper>
              <img
                width="100%"
                height="100%"
                alt="Team Member"
                src="/static/cover/user-cover-pic.png"
              />
            </CoverPicWrapper>

            {/* USER INFO SECTION */}
            <UserInfo data={data} fetchData={fetchData} />
          </Card>

          {/* BASIC INFORMATION FORM SECTION */}
          <InfoForm data={data} fetchData={fetchData} />
        </Fragment>
      )}
    </>
  );
}
