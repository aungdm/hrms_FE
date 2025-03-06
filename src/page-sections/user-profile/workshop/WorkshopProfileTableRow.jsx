import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // MUI
import Chip from "@mui/material/Chip";

import Avatar from "@mui/material/Avatar";
import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell"; // MUI ICON COMPONENTS

import Edit from "@mui/icons-material/Edit";
import DeleteOutline from "@mui/icons-material/DeleteOutline"; // CUSTOM COMPONENTS

import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";

import { utils } from "../../../utils/functionUtils";
import { useTranslation } from "react-i18next";

const WorkshopProfileTableRow = (props) => {
  const { t } = useTranslation();
  const { data, isSelected, handleSelectRow, role, handleDeleteUser } = props;
  console.log({ role }, "WorkshopProfileTableRow");

  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };

  const handleCloseOpenMenu = () => setOpenMenuEl(null);
  const statusLabels = (status) => {
    const labels = {
      in_progress: t("in_progress"),
      pending: t("pending"),
      accepted: t("accepted"),
      rejected: t("rejected"),
      completed: t("completed"),
      cancelled: t("cancelled"),
      done: t("done"),
      quote_received: t("quote_received"),
      quote_accepted: t("quote_accepted"),
      quote_rejected: t("quote_rejected"),
      quote_send: t("quote_send"),
    };
    return labels[status];
  };
  return (
    // <TableRow hover>
    //   <TableCell padding="checkbox">
    //     <Checkbox
    //       size="small"
    //       color="primary"
    //       checked={isSelected}
    //       onClick={(event) => handleSelectRow(event, user.id)}
    //     />
    //   </TableCell>

    //   <TableCell padding="normal">
    //     <FlexBox alignItems="center" gap={2}>
    //       {/* <Avatar src={user.avatar} alt={user.name} variant="rounded" /> */}

    //       <div>
    //         <Paragraph
    //           fontWeight={500}
    //           color="text.primary"
    //           sx={{
    //             ":hover": {
    //               textDecoration: "underline",
    //               cursor: "pointer",
    //             },
    //           }}
    //         >
    //           {user.name}
    //         </Paragraph>
    //         <Paragraph fontSize={13}>#{user.id}</Paragraph>
    //       </div>
    //     </FlexBox>
    //   </TableCell>

    //   <TableCell padding="normal">{user.phone}</TableCell>

    //   <TableCell padding="normal">{user.role}</TableCell>

    //   <TableCell padding="normal">
    //     <TableMoreMenu
    //       open={openMenuEl}
    //       handleOpen={handleOpenMenu}
    //       handleClose={handleCloseOpenMenu}
    //     >
    //       <TableMoreMenuItem
    //         Icon={DeleteOutline}
    //         title="Delete"
    //         handleClick={() => {
    //           handleCloseOpenMenu();
    //           handleDeleteUser(user.id);
    //         }}
    //       />
    //     </TableMoreMenu>
    //   </TableCell>
    // </TableRow>

    <>
      {" "}
      {role === "service" ? (
        <TableRow
          onClick={() =>
            navigate(`/dashboard/bookings-detail?id=${booking.id}`)
          }
          hover
          sx={{ cursor: "pointer" }}
        >
          {/* <TableCell padding="checkbox">
            <Checkbox
              size="small"
              color="primary"
              checked={isSelected}
              onClick={(event) => handleSelectRow(event, booking.id)}
            />
          </TableCell> */}

          <TableCell padding="normal">
            <FlexBox alignItems="center" gap={2}>
              <Avatar src={data?.service?.image} variant="rounded" />
              {/* <img src={data?.car?.image} alt="" /> */}
              <div>
                <Paragraph fontSize={13}>
                  {data?.service?.name || "-"}
                </Paragraph>
              </div>
            </FlexBox>
          </TableCell>
          <TableCell>
            {data?.service?.estimated_time
              ? `${data?.service?.estimated_time} Min`
              : "-"}
          </TableCell>

          <TableCell padding="normal">
            {data?.car?.car?.maker?.name +
              " " +
              data?.car?.car?.model?.name +
              " " +
              data?.car?.car?.year?.year}
          </TableCell>

          <TableCell padding="normal">
            {data?.service?.estimated_cost
              ? `${data?.service?.estimated_cost} BHD`
              : "-"}
          </TableCell>

          <TableCell padding="normal">
            <Chip
              color="warning"
              size="small"
              label={statusLabels(data?.status)}
              style={{
                backgroundColor: "rgba(254,191,6,0.12)",
                color: "#febf06",
              }}
            />
          </TableCell>
        </TableRow>
      ) : (
        <TableRow
          onClick={() =>
            navigate(`/dashboard/bookings-detail?id=${booking.id}`)
          }
          hover
          sx={{ cursor: "pointer" }}
        >
          {/* <TableCell padding="checkbox">
            <Checkbox
              size="small"
              color="primary"
              checked={isSelected}
              onClick={(event) => handleSelectRow(event, booking.id)}
            />
          </TableCell> */}

          <TableCell padding="normal">
            <FlexBox alignItems="center" gap={2}>
              {/* <Avatar src={data?.car?.image} variant="rounded" /> */}
              {/* <img src={data?.car?.image} alt="" /> */}
              <div>
                <Paragraph fontSize={13}>#{data?.id || "-"}</Paragraph>
              </div>
            </FlexBox>
          </TableCell>
          <TableCell>
            {data?.truck_driver?.first_name && data?.truck_driver?.last_name
              ? `${data?.truck_driver?.first_name} ${data?.truck_driver?.last_name}`
              : "-"}
          </TableCell>

          <TableCell padding="normal">
            {" "}
            {data?.car?.car?.maker?.name +
              " " +
              data?.car?.car?.model?.name +
              " " +
              data?.car?.car?.year?.year}
          </TableCell>

          <TableCell padding="normal">
            {data?.service?.estimated_cost || "-"}
          </TableCell>

          <TableCell padding="normal">
            <Chip
              color="warning"
              size="small"
              label={statusLabels(data?.status)}
              style={{
                backgroundColor: "rgba(254,191,6,0.12)",
                color: "#febf06",
              }}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default WorkshopProfileTableRow;
