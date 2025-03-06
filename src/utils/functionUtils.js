import { format } from "date-fns";

const formatDateTime = (dateString) => {
  console.log({ dateString });
  const correctedDateString = dateString.replace(" ", "T");
  const date = new Date(correctedDateString);
  return format(date, "dd MMM yyyy, h:mm a");
};

const formatISOtDateTime = (dateString) => {
  console.log({ dateString });
  const date = new Date(dateString); // No need for replacing the space, it's already valid
  return format(date, "dd MMM yyyy, h:mm a");
};

// const stausesObject = [
//   { value: "", label: t("select_status") },
//   { value: "in_progress", label: t("in_progress") },
//   { value: "pending", label: t("pending") },
//   { value: "accepted", label: t("accepted") },
//   { value: "rejected", label: t("rejected") },
//   { value: "completed", label: t("completed") },
//   { value: "cancelled", label: t("cancelled") },
//   { value: "done", label: t("done") },
//   { value: "quote_received", label: t("quote_received") },
//   { value: "quote_accepted", label: t("quote_accepted") },
//   { value: "quote_rejected", label: t("quote_rejected") },
//   { value: "quote_send", label: t("quote_send") },
// ];

// const statusLabels = (status, t) => {
//   const labels = {
//     in_progress: t("in_progress"),
//     pending: t("pending"),
//     accepted: t("accepted"),
//     rejected: t("rejected"),
//     completed: t("completed"),
//     cancelled: t("cancelled"),
//     done: t("done"),
//     quote_received: t("quote_received"),
//     quote_accepted: t("quote_accepted"),
//     quote_rejected: t("quote_rejected"),
//     quote_send: t("quote_send"),
//   };
//   return labels[status];
// };

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
console.log({ VITE_BASE_URL });

const getImageUrl = (imagePath) => {
  const finalURL = `${VITE_BASE_URL.slice(0, VITE_BASE_URL.length - 3)}${imagePath}`;
  // console.log({ finalURL });
  return finalURL;
};

export const utils = {
  formatDateTime,
  // statusLabels,
  formatISOtDateTime,
  getImageUrl,
};
3;
