import { useState } from "react";
import { format } from "date-fns";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import { Tooltip, Typography, Chip, Box, Collapse, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { toast } from "react-toastify";
import { resetProcessingErrors } from "./request";

// ========================================================================

// ========================================================================

export default function ErrorLogTableRow({ log, selected, handleSelectRow, fetchList }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy hh:mm:ss a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleRetryProcessing = async (logId) => {
    try {
      const response = await resetProcessingErrors([logId]);
      if (response.success) {
        toast.success("Log reset for reprocessing");
        if (fetchList) fetchList();
      } else {
        toast.error("Failed to reset log");
      }
    } catch (error) {
      console.error("Error resetting log:", error);
      toast.error("Failed to reset log");
    }
  };

  const getStatusColor = (attempts) => {
    if (attempts >= 5) return "error";
    if (attempts >= 3) return "warning";
    return "info";
  };

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{
          "&.MuiTableRow-root": {
            backgroundColor: selected ? "action.hover" : "transparent",
            "&:hover": { backgroundColor: "action.hover" },
          },
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={(e) => handleSelectRow(log._id)}
            color="primary"
          />
        </TableCell>

        <TableCell align="left">
          {log.deviceUserId?.name || log.deviceUserId || "Unknown"}
          <Typography variant="caption" display="block" color="text.secondary">
            ID: {log.deviceUserId?.user_defined_code || "N/A"}
          </Typography>
        </TableCell>

        <TableCell align="left">
          {formatDate(log.recordTime)}
          <Typography variant="caption" display="block" color="text.secondary">
            Synced: {formatDate(log.syncedAt)}
          </Typography>
        </TableCell>

        <TableCell align="left">
          <Chip 
            label={`${log.processingAttempts} attempts`} 
            color={getStatusColor(log.processingAttempts)}
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" display="block" color="text.secondary">
            Last attempt: {formatDate(log.lastProcessingAttempt)}
          </Typography>
        </TableCell>

        <TableCell align="left">
          <Typography 
            variant="body2" 
            sx={{ 
              maxWidth: 200, 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {log.processingError}
          </Typography>
        </TableCell>

        <TableCell align="center">{log.deviceId}</TableCell>

        <TableCell align="right">
          <Tooltip title="Retry Processing">
            <IconButton
              onClick={() => handleRetryProcessing(log._id)}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={expanded ? "Show Less" : "Show More"}>
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Expanded details row */}
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 3, backgroundColor: "action.hover" }}>
              <Typography variant="subtitle1" gutterBottom>
                Error Details
              </Typography>
              <Typography variant="body2" paragraph>
                {log.processingError}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Log Information
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Record Time
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(log.recordTime)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Synced At
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(log.syncedAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Processing Attempt
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(log.lastProcessingAttempt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Processing Attempts
                  </Typography>
                  <Typography variant="body2">
                    {log.processingAttempts}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Device ID
                  </Typography>
                  <Typography variant="body2">
                    {log.deviceId}
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => handleRetryProcessing(log._id)}
                startIcon={<RefreshIcon />}
              >
                Reset & Retry Processing
              </Button>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
} 