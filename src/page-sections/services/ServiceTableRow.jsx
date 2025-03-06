import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Edit from "@mui/icons-material/Edit";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";

export default function ServiceTableRow(props) {
  const { user, isSelected, handleSelectRow, handleDeleteService } = props;
  console.log(user, "table row user");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            checked={isSelected}
            onClick={(event) => handleSelectRow(event, user.id)}
          />
        </TableCell>

        <TableCell padding="normal">
          <FlexBox alignItems="center" gap={2}>
            <Avatar src={user.image} alt={user.name} variant="rounded" />

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
                {user.name || "-"}
              </Paragraph>

              {/* <Paragraph fontSize={13}>#{user.id || "-"}</Paragraph> */}
            </div>
          </FlexBox>
        </TableCell>
        <TableCell>{user.description || "-"}</TableCell>

        <TableCell padding="normal">{user.estimated_time || "-"}</TableCell>

        <TableCell padding="normal">{user.estimated_cost || "-"}</TableCell>

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
                navigate(`/service-create/${user.id}`);
              }}
            />

            <TableMoreMenuItem
              Icon={DeleteOutline}
              title="Delete"
              handleClick={() => {
                handleCloseOpenMenu();
                handleDeleteService(user.id);
              }}
            />
          </TableMoreMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
