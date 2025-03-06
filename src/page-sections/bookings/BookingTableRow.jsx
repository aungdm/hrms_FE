import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Edit from "@mui/icons-material/Edit";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";

import { utils } from "../../utils/functionUtils";
import { useTranslation } from "react-i18next";

export default function BookingTableRow(props) {
  const { t } = useTranslation();
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
  const { booking, isSelected, handleSelectRow, handleDeleteBooking } = props;

  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  // console.log(utils.getImageUrl(booking?.car?.images));
  return (
    <>
      <TableRow hover sx={{ cursor: "pointer" }}>
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            checked={isSelected}
            onClick={(event) => handleSelectRow(event, booking.id)}
          />
        </TableCell>

        <TableCell padding="normal">
          <FlexBox
            alignItems="center"
            gap={2}
            onClick={() =>
              navigate(`/bookings-detail?id=${booking.id}`)
            }
          >
            <Avatar src={booking?.images} variant="rounded" />
            {/* <Avatar
              src={utils.getImageUrl(booking?.car?.image)}
              variant="rounded"
            /> */}
            <div>
              <Paragraph
                fontSize={13}
                sx={{
                  ":hover": {
                    textDecoration: "underline",
                    cursor: "pointer",
                  },
                }}
              >
                #{booking?.id || "-"}
              </Paragraph>
            </div>
          </FlexBox>
        </TableCell>
        <TableCell>
          {booking?.truck_driver?.first_name && booking?.truck_driver?.last_name
            ? `${booking?.truck_driver?.first_name} ${booking?.truck_driver?.last_name}`
            : "-"}
        </TableCell>

        <TableCell padding="normal">{booking?.car?.car?.maker?.name}</TableCell>

        <TableCell padding="normal">
          {booking?.service?.estimated_cost || "-"}
        </TableCell>

        <TableCell padding="normal">
          <Chip
            color="warning"
            size="small"
            label={statusLabels(booking?.status)}
            style={{
              backgroundColor: "rgba(254,191,6,0.12)",
              color: "#febf06",
            }}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
