import { useLocation, useNavigate } from "react-router-dom"; // MUI

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Search from "@mui/icons-material/Search";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { FlexBox } from "@/components/flexbox";
import { useEffect, useCallback, useState } from "react";
import Apps from "@/icons/Apps";
import FormatBullets from "@/icons/FormatBullets";
import { getServices } from "@/page-sections/services/request";
import { Paragraph } from "../../components/typography/index.jsx";
import IconWrapper from "@/components/icon-wrapper";
import Chat from "@/icons/Chat.jsx";
import Filter from "@/icons/Filter";
import { useTranslation } from "react-i18next";

export default function SearchArea(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    service_id: "",
    status: "",
    created_at: "",
  });
  const { value = "", onChange, gridRoute, listRoute } = props;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeColor = (path) =>
    pathname === path ? "primary.main" : "grey.400";

  const stausesObject = [
    { value: "", label: t("select_status") },
    { value: "in_progress", label: t("in_progress") },
    { value: "pending", label: t("pending") },
    { value: "accepted", label: t("accepted") },
    { value: "rejected", label: t("rejected") },
    { value: "completed", label: t("completed") },
    { value: "cancelled", label: t("cancelled") },
    { value: "done", label: t("done") },
    { value: "quote_received", label: t("quote_received") },
    { value: "quote_accepted", label: t("quote_accepted") },
    { value: "quote_rejected", label: t("quote_rejected") },
    { value: "quote_send", label: t("quote_send") },
  ];

  const onChangeFn = (e) => {
    const { name, value } = e.target; // Extract name and value
    setFilters((prev) => ({
      ...prev,
      [name]: value, // Update the corresponding filter field
    }));
    console.log(value, "valuevalue value value ");
    onChange(e); // Call the parent onChange if needed
  };

  const fetchList = useCallback(async () => {
    try {
      // setLoading(true);
      const response = await getServices("bookingMode");
      console.log(response);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      // setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <>
      <Box p={2}>
        <FlexBox alignItems="center">
          <Paragraph fontSize={16}>{t("filters")}</Paragraph>
        </FlexBox>
      </Box>
      <FlexBetween gap={1} my={1}>
        <TextField
          type="date"
          fullWidth
          name="created_at"
          value={filters.created_at}
          onChange={onChangeFn}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          select
          fullWidth
          // label="Service"
          name="service_id"
          value={filters.service_id}
          onChange={onChangeFn}
          slotProps={{
            select: {
              native: true,
            },
          }}
        >
          <option value="">{t("select_service")}</option>
          {users.map((user, index) => (
            <option key={index} value={user.id}>
              {user.name}
            </option>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          // label="Status"
          name="status"
          value={filters.status}
          onChange={onChangeFn}
          slotProps={{
            select: {
              native: true,
            },
          }}
        >
          {stausesObject.map((status, index) => (
            <option key={index} value={status.value}>
              {status.label}
            </option>
          ))}
        </TextField>
      </FlexBetween>
    </>
  );
}
