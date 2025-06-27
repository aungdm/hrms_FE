import Button from "@mui/material/Button";
import IconWrapper from "@/components/icon-wrapper";
import { Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AddIcon from "@mui/icons-material/Add";

export default function HeadingArea({ onCreateClick }) {
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
        <Paragraph fontSize={16} fontWeight={600}>Advanced Salary Management</Paragraph>
      </FlexBox>
      
      <Button 
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateClick}
      >
        Create Advanced Salary Request
      </Button>
    </FlexBetween>
  );
}
