import { useNavigate } from "react-router-dom"; // MUI

import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import TabList from "@mui/lab/TabList";
import TabContext from "@mui/lab/TabContext";
import styled from "@mui/material/styles/styled"; // CUSTOM COMPONENTS

import IconWrapper from "@/components/icon-wrapper";
import { H5, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS

import GroupSenior from "@/icons/GroupSenior";
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import Add from "@mui/icons-material/Add";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import duotone from "@/icons/duotone";

export default function HeadingArea({ selectedIds = [], handleBulkDelete }) {
  const TodoList = duotone.TodoList;
  const navigate = useNavigate();
  return (
    <FlexBetween flexWrap="wrap" gap={1}>
      <FlexBox alignItems="center" gap={1}>
        <IconWrapper>
          <MoneyOffIcon
            sx={{
              color: "primary.main",
            }}
          />
        </IconWrapper>
        <div>
          <H5>Fine Deductions</H5>
          <Paragraph color="text.secondary">
            Manage employee fines and deductions
          </Paragraph>
        </div>
      </FlexBox>
      
      <FlexBox gap={1}>
        {selectedIds.length > 0 && (
          <Button
            color="error"
            variant="outlined"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
        )}
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/fine-deduction-create")}
        >
          Add Fine Deduction
        </Button>
      </FlexBox>
    </FlexBetween>
  );
}
