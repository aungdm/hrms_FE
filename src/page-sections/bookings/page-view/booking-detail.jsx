import ImageSelector from "../../../components/ImageSelector.jsx";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Chip from "@mui/material/Chip";
import { Paragraph } from "../../../components/typography/index.jsx";
import Typography from "@mui/material/Typography";
import GoogleMaps from "../../../components/GoogleMaps.jsx";
import Timeline from "../../../components/Timeline.jsx";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBooking } from "../request.js";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { utils } from "../../../utils/functionUtils.js";
import { format } from "date-fns";
import BookingDetailSkeleton from "@/components/loader/BookingDetailSkeleton.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BookingDetailView() {
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
  const navigate = useNavigate();
  const [data, setdata] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  console.log({ id });

  const fetchData = async (id) => {
    try {
      setLoading(true);
      const response = await getBooking(id);
      console.log(response);
      if (response.success) {
        setdata(response.data);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const formatDateTime = (dateString) => {
    console.log({ dateString });
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy, h:mm a");
  };

  useEffect(() => {
    fetchData(id);
  }, [id]);

  return (
    <>
      {loading ? (
        <BookingDetailSkeleton />
      ) : (
        // <Paragraph> Loading....</Paragraph>
        <>
          <Card>
            <Box>
              <KeyboardArrowLeft
                onClick={() => navigate(`/dashboard/bookings-list`)}
                sx={{ color: "#6B7280", cursor: "pointer" }}
                fontSize="large"
              />
              <Grid container p={2} spacing={3}>
                <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                  <ImageSelector images={data.images} />
                </Grid>
                <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                  <Box>
                    <Chip
                      color="warning"
                      size="small"
                      label={statusLabels(data?.status)}
                      style={{
                        backgroundColor: "rgba(254,191,6,0.12)",
                        color: "#febf06",
                      }}
                    />
                  </Box>
                  <Paragraph sx={{ color: "#6B7280", marginTop: "20px" }}>
                    {/* {data?.updated_at} */}
                    {formatDateTime(data?.updated_at) || data?.created_at}

                    {/* {utils.formatDateTime(data?.updated_at) || "data?.created_at"} */}
                  </Paragraph>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: "bold", marginTop: "10px" }}
                  >
                    #098897
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      fontWeight: "bold",
                      color: "#6950E8",
                      marginTop: "10px",
                    }}
                  >
                    {data?.booking_amount ? `${data?.booking_amount}BHD` : "-"}
                  </Typography>
                  <Box sx={{ marginTop: "10px" }}>
                    <Paragraph sx={{ color: "#6B7280" }}>
                      {data?.service?.description}
                    </Paragraph>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "15px",
                      }}
                    >
                      <Paragraph
                        sx={{
                          color: "#6B7280",
                          maxWidth: "100px",
                          width: "100%",
                        }}
                      >
                        {t("car")}
                      </Paragraph>
                      <Paragraph sx={{ color: "#6B7280" }}>
                        {data?.car?.car?.maker?.name +
                          " " +
                          data?.car?.car?.model?.name +
                          " " +
                          data?.car?.car?.year?.year}
                      </Paragraph>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "8px",
                      }}
                    >
                      <Paragraph
                        sx={{
                          color: "#6B7280",
                          maxWidth: "100px",
                          width: "100%",
                        }}
                      >
                        {t("location")}
                      </Paragraph>
                      <Paragraph sx={{ color: "#6B7280" }}>
                        {data?.location?.address}
                      </Paragraph>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
          <Grid container py={2} spacing={3}>
            <Grid size={{ md: 8, sm: 12, xs: 12 }}>
              <Card sx={{ borderRadius: "16px" }}>
                <Box sx={{ backgroundColor: "#F3F4F6", padding: "20px" }}>
                  <Paragraph>{t("map")}</Paragraph>
                </Box>
                <GoogleMaps
                  lat={data?.location?.latitude}
                  lng={data?.location?.longitude}
                />
              </Card>
            </Grid>
            <Grid size={{ md: 4, sm: 12, xs: 12 }}>
              <Card sx={{ borderRadius: "16px" }}>
                <Box sx={{ backgroundColor: "#F3F4F6", padding: "20px" }}>
                  <Paragraph sx={{ color: "#6B7280" }}>
                    {t("workshop")}
                  </Paragraph>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px",
                  }}
                >
                  <Box>
                    <Paragraph>
                      {data?.workshop?.owner?.first_name &&
                      data?.workshop?.owner?.lasst_name
                        ? `${data?.workshop?.owner?.first_name} ${data?.workshop?.owner?.lasst_name}`
                        : "-"}
                    </Paragraph>
                    <Paragraph>
                      {data?.workshop?.owner?.phone_number
                        ? "+" + data?.workshop?.owner?.phone_number
                        : ""}
                    </Paragraph>
                  </Box>
                  <Box>
                    <Chip
                      size="small"
                      label={statusLabels(data?.workshop_status) || ""}
                      style={{
                        backgroundColor:
                          data?.workshop_status === "accepted"
                            ? "#11B8861A"
                            : "#EF47701A",
                        color:
                          data?.workshop_status === "accepted"
                            ? "#11B886"
                            : "#EB194C",
                        marginRight: "5px",
                      }}
                    />
                  </Box>
                </Box>
              </Card>
              <Card sx={{ borderRadius: "16px", marginTop: "20px" }}>
                <Box sx={{ backgroundColor: "#F3F4F6", padding: "20px" }}>
                  <Paragraph sx={{ color: "#6B7280" }}>
                    {t("driver_request")}
                  </Paragraph>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <Box>
                    <Paragraph>
                      {data?.truck_driver?.first_name &&
                      data?.truck_driver?.lasst_name
                        ? `${data?.truck_driver?.first_name} ${data?.truck_driver?.lasst_name}`
                        : "-"}
                    </Paragraph>
                    <Paragraph>
                      {data?.truck_driver?.phone_number
                        ? "+" + data?.truck_driver?.phone_number
                        : ""}
                    </Paragraph>
                  </Box>
                  <Box>
                    <Chip
                      size="small"
                      label={statusLabels(data?.truck_driver_status)}
                      style={{
                        backgroundColor:
                          data?.truck_driver_status === "accepted"
                            ? "#11B8861A"
                            : "#EF47701A",
                        color:
                          data?.truck_driver_status === "accepted"
                            ? "#11B886"
                            : "#EB194C",
                        marginRight: "5px",
                      }}
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
          <Grid container py={2} spacing={3}>
            <Grid size={{ md: 8, sm: 12, xs: 12 }}>
              <Card sx={{ borderRadius: "16px" }}>
                <Box sx={{ backgroundColor: "#F3F4F6", padding: "20px" }}>
                  <Paragraph>{t("timeline")}</Paragraph>
                </Box>
                <Timeline timeline={data?.booking_timelines} />
              </Card>
            </Grid>
            <Grid size={{ md: 4, sm: 12, xs: 12 }}>
              <Card sx={{ borderRadius: "16px" }}>
                <Box sx={{ backgroundColor: "#F3F4F6", padding: "20px" }}>
                  <Paragraph sx={{ color: "#6B7280" }}>
                    {t("services")}
                  </Paragraph>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <Box
                    sx={{ display: "flex", gap: "10px", alignItems: "center" }}
                  >
                    <img
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "10px",
                      }}
                      src={
                        data?.service?.image ||
                        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                      }
                      alt=""
                    />
                    <Paragraph>{data?.service?.name}</Paragraph>
                  </Box>
                  <Box>
                    <Paragraph>
                      {data?.service?.estimated_cost
                        ? `${data?.service?.estimated_cost} BHD`
                        : ""}
                    </Paragraph>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px",
                  }}
                >
                  <Box>
                    <Paragraph sx={{ fontWeight: "bold" }}>
                      {t("total")}
                    </Paragraph>
                  </Box>
                  <Box>
                    <Paragraph> </Paragraph>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
