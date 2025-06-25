import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph, Small } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { utils } from "@/utils/functionUtils";
import { Chip, Stack, Tooltip } from "@mui/material";
import { format } from "date-fns";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingIcon from "@mui/icons-material/Pending";
import PersonIcon from "@mui/icons-material/Person";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
  // console.log(data, "table row data");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <TableRow hover>
        {/* Employee column */}
        <TableCell padding="normal">
          <FlexBox alignItems="center" gap={1.5}>
            <Avatar 
              sx={{ 
                bgcolor: data?.deviceUserId?.name ? 'primary.light' : 'grey.300',
                width: 40,
                height: 40
              }}
            >
              {data?.deviceUserId?.name ? (
                data?.deviceUserId?.name.charAt(0).toUpperCase()
              ) : (
                <PersonIcon />
              )}
            </Avatar>

            <div>
              <Paragraph
                fontWeight={500}
                color="text.primary"
              >
                {data?.deviceUserId?.name || "Unknown Employee"}
              </Paragraph>

              <Small color="text.secondary">
                ID: {data?.deviceUserId?.user_defined_code || data?.deviceUserId?._id || data?.deviceUserId || "-"}
              </Small>
            </div>
          </FlexBox>
        </TableCell>

        {/* Record Time column */}
        <TableCell>
          {formatDate(data?.recordTime)}
        </TableCell>

        {/* Device ID column */}
        <TableCell>
          <Tooltip title={`Device IP: ${data?.deviceId || "Unknown"}`} arrow>
            <Chip 
              label={data?.deviceId || "Unknown"} 
              size="small"
              variant="outlined"
              color="info"
            />
          </Tooltip>
        </TableCell>

        {/* Status column */}
        <TableCell>
          {data?.isProcessed ? (
            <Chip 
              icon={<CheckCircleOutlineIcon />}
              label="Processed" 
              size="small"
              color="success"
              variant="outlined"
            />
          ) : (
            <Chip 
              icon={<PendingIcon />}
              label="Not Processed" 
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </TableCell>

        {/* Synced At column */}
        <TableCell>
          {formatDate(data?.syncedAt)}
        </TableCell>

        {/* Actions column */}
        <TableCell padding="normal">
          <TableMoreMenu
            open={openMenuEl}
            handleOpen={handleOpenMenu}
            handleClose={handleCloseOpenMenu}
          >
            <TableMoreMenuItem
              Icon={Visibility}
              title="View Details"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/dashboard/attendance-logs/view/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={DeleteOutline}
              title="Delete"
              handleClick={() => {
                handleCloseOpenMenu();
                handleDelete(data._id);
              }}
            />
          </TableMoreMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
