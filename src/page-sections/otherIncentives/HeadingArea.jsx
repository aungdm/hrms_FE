import { useNavigate } from "react-router-dom"; // MUI

import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import TabList from "@mui/lab/TabList";
import TabContext from "@mui/lab/TabContext";
import styled from "@mui/material/styles/styled"; // CUSTOM COMPONENTS

import IconWrapper from "@/components/icon-wrapper";
import { Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AddIcon from "@mui/icons-material/Add"; // STYLED COMPONENT
import duotone from "@/icons/duotone";

export default function HeadingArea() {
  const TodoList = duotone.TodoList;
  const navigate = useNavigate();
  return (
    <FlexBetween flexWrap="wrap" gap={1}>
      <FlexBox alignItems="center">
        <IconWrapper>
          <MonetizationOnIcon
            sx={{
              color: "primary.main",
            }}
          />
        </IconWrapper>
        <Paragraph fontSize={16} fontWeight={600}>Other Incentives</Paragraph>
      </FlexBox>
      
      <Button 
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate("/create-other-incentive")}
      >
        Add Incentive
      </Button>
    </FlexBetween>
  );
}
