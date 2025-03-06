import { useState } from "react";
import { useNavigate } from "react-router-dom"; // MUI

import Avatar from "@mui/material/Avatar";
import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell"; // MUI ICON COMPONENTS

import Edit from "@mui/icons-material/Edit";
import DeleteOutline from "@mui/icons-material/DeleteOutline"; // CUSTOM COMPONENTS

import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table"; // ==============================================================
// ==============================================================
export default function UserTableRow(props) {

  const roleKey = (role) => {
    const roleObj = {
      customer: "customer-profile",
      workshop: "workshop-profile",
      "truck-driver": "driver-profile",
    };
    return roleObj[role] || "unknown_role";
  };

  const { user, isSelected, handleSelectRow, handleDeleteUser, role } = props;
  console.log({ role }, "user table row");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };

  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  return (
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
          {/* <Avatar src={user.avatar} alt={user?.name} variant="rounded" /> */}

          <div>
            <Paragraph
              fontWeight={500}
              onClick={() => {
                navigate(`/${roleKey(role)}/${role}/${user?.id}`);
              }}
              color="text.primary"
              sx={{
                ":hover": {
                  textDecoration: "underline",
                  cursor: "pointer",
                },
              }}
            >
              {user?.first_name || user?.last_name
                ? `${user?.first_name} ${user?.last_name}`
                : "-"}
            </Paragraph>

            <Paragraph fontSize={13}>#{user?.id}</Paragraph>
          </div>
        </FlexBox>
      </TableCell>

      <TableCell padding="normal">{user?.phone_number}</TableCell>

      <TableCell padding="normal">{user?.roles[0]?.name}</TableCell>

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
              navigate(`/add-user/${user?.id}`);
            }}
          />

          <TableMoreMenuItem
            Icon={DeleteOutline}
            title="Delete"
            handleClick={() => {
              handleCloseOpenMenu();
              handleDeleteUser(user?.id);
            }}
          />
        </TableMoreMenu>
      </TableCell>
    </TableRow>
  );
}
