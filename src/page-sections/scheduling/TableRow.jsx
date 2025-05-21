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
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import Chip from "@mui/material/Chip";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
  // console.log(data, "table row data");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  // Function to convert workDays array to readable format
  const formatWorkDays = (workDays) => {
    if (!workDays || !Array.isArray(workDays) || workDays.length === 0) {
      return "-";
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return workDays.map(day => dayNames[day]).join(", ");
  };

  // Function to format shift times
  const formatShiftTime = (start, end) => {
    if (!start || !end) return "-";
    return `${start} - ${end}`;
  };

  return (
    <>
      <TableRow hover>
        {/* <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            checked={isSelected}
            onClick={(event) => handleSelectRow(event, data.id)}
          />
        </TableCell> */}

        <TableCell padding="normal">
          <FlexBox alignItems="center" gap={2}>
            {/* <Avatar src={data.image} alt={data.name} variant="rounded" /> */}

            <div>
              <Paragraph
                fontWeight={500}
                color="text.primary"
                sx={{
                  ":hover": {
                    textDecoration: "underline",
                    cursor: "pointer",
                  },
                }}
              >
                {data?.name || "-"}
              </Paragraph>

              {/* <Paragraph fontSize={13}>#{data.id || "-"}</Paragraph> */}
            </div>
          </FlexBox>
        </TableCell>
        <TableCell padding="normal">{formatWorkDays(data?.workDays)}</TableCell>

        <TableCell padding="normal">{formatShiftTime(data?.shiftStart, data?.shiftEnd)}</TableCell>

        <TableCell padding="normal">{data?.graceTimeInMinutes || "-"} min</TableCell>

        <TableCell padding="normal">
          <Chip 
            label={data?.isActive ? "Active" : "Inactive"} 
            color={data?.isActive ? "success" : "error"}
            size="small"
          />
        </TableCell>

        <TableCell padding="normal">
          <TableMoreMenu
            open={openMenuEl}
            handleOpen={handleOpenMenu}
            handleClose={handleCloseOpenMenu}
          >
            <TableMoreMenuItem
              Icon={Edit}
              title="Edit"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/time-slot-update/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={Visibility}
              title="View"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/time-slot-view/${data._id}`);
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
