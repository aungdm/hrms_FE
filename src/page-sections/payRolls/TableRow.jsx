import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
// import PlayCircle from "@mui/icons-material/PlayCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { utils } from "@/utils/functionUtils";
export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
  // console.log(data, "table row data");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

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
                {data?.deviceUserId || "-"}
              </Paragraph>

              {/* <Paragraph fontSize={13}>#{data.id || "-"}</Paragraph> */}
            </div>
          </FlexBox>
        </TableCell>
        <TableCell>{data?.name || "-"}</TableCell>

        <TableCell padding="normal">
          {utils.formatISOtDateTime(data?.recordTime) || "-"}
        </TableCell>

        <TableCell padding="normal">{data?.deviceId || "-"}</TableCell>

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
                navigate(`/pay-rolls-update/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={Visibility}
              title="View"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/pay-rolls-view/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={PlayCircleIcon}
              title="Run"
              handleClick={() => {
                // handleCloseOpenMenu();
                // navigate(`/arrears-view/${data._id}`);
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
