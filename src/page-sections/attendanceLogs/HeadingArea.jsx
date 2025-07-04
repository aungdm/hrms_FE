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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function HeadingArea() {
  const TodoList = duotone.TodoList;
  const navigate = useNavigate();
  return (
    <FlexBetween flexWrap="wrap" gap={1}>
      <FlexBox alignItems="center">
        <IconWrapper>
          <TodoList
            sx={{
              color: "primary.main",
            }}
          />
        </IconWrapper>
        <Paragraph fontSize={16}>Logs</Paragraph>
      </FlexBox>
      {/* <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate("/employee-create")}
      >
        Create
      </Button> */}
      <Button
        variant="outlined"
        color="error"
        startIcon={<ErrorOutlineIcon />}
        onClick={() => navigate("/attendance-logs-errors")}
      >
        View Processing Errors
      </Button>
    </FlexBetween>
  );
}
