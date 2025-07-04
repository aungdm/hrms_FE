import { useNavigate } from "react-router-dom"; // MUI

import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import TabList from "@mui/lab/TabList";
import TabContext from "@mui/lab/TabContext";
import styled from "@mui/material/styles/styled"; // CUSTOM COMPONENTS

import IconWrapper from "@/components/icon-wrapper";
import { Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS

import GroupSenior from "@/icons/GroupSenior";
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import Add from "@/icons/Add"; // STYLED COMPONENT
import duotone from "@/icons/duotone";
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

export default function HeadingArea() {
  const TodoList = duotone.TodoList;
  const navigate = useNavigate();
  return (
    <FlexBetween flexWrap="wrap" gap={1}>
      <FlexBox alignItems="center">
        <IconWrapper>
          <MoneyOffIcon
            sx={{
              color: "error.main",
            }}
          />
        </IconWrapper>
        <Paragraph fontSize={16} fontWeight={600}>Arrears</Paragraph>
      </FlexBox>
      <Button 
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate("/arrears-create")}
      >
        Create Deduction
      </Button>
    </FlexBetween>
  );
}
