import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // MUI
import Chip from "@mui/material/Chip";
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';

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

const CustomerProfileTableRow = (props) => {
  const { data, isSelected, handleSelectRow, role, handleDeleteUser } = props;
  console.log({ role }, "CustomerProfileTableRow");

  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };

  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  return (
    <>
      {" "}
      {role === "car" ? (
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
              <Avatar src={data?.car?.car?.image} variant="rounded" />
              {/* <img src={data?.car?.image} alt="" /> */}
              <div>
                <Paragraph fontSize={13}>
                  {" "}
                  {data?.car?.car?.maker?.name +
                    " " +
                    data?.car?.car?.model?.name +
                    " " +
                    data?.car?.car?.year?.year}{" "}
                </Paragraph>
              </div>
            </FlexBox>
          </TableCell>
          <TableCell>{data?.car?.number_plate}</TableCell>

          <TableCell padding="normal">{data?.car?.car?.maker?.name}</TableCell>

          <TableCell padding="normal">  {data?.car?.car?.model?.name}</TableCell>

          <TableCell padding="normal">
            {data?.car?.number_plate}
            {data?.car?.car?.year?.year}
   
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

          <TableCell padding="normal">
            {" "}
            {data?.car?.car?.maker?.name +
              " " +
              data?.car?.car?.model?.name +
              " " +
              data?.car?.car?.year?.year}
          </TableCell>
          <TableCell>
            {data?.workshop?.owner?.first_name ||
            data?.workshop?.owner?.last_name
              ? `${data?.workshop?.owner?.first_name} ${data?.workshop?.owner?.last_name}`
              : "-"}
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
              label={utils.statusLabels(data?.status)}
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

export default CustomerProfileTableRow;
