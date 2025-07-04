import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import IconWrapper from "@/components/icon-wrapper";
import { Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box } from "@mui/material";

export default function ErrorLogHeadingArea({ onRefresh }) {
  const navigate = useNavigate();
  
  return (
    <FlexBetween flexWrap="wrap" gap={1}>
      <FlexBox alignItems="center">
        <IconWrapper>
          <ErrorOutlineIcon
            sx={{
              color: "error.main",
            }}
          />
        </IconWrapper>
        <Paragraph fontSize={16}>Processing Error Logs</Paragraph>
      </FlexBox>
      
      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/attendance-logs-list")}
        >
          Back to All Logs
        </Button>
      </Box>
    </FlexBetween>
  );
} 