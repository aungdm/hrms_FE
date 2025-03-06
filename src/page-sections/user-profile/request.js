import axios from "axios";

// const roleKey = (role) => {
//   const roleObj = {
//     customer: "customer_id",
//     workshop: "workshop_id",
//     "truck-driver": "truck-driver-id",
//   };
//   return roleObj[role] || "unknown_role";
// };

export const getProfileBookings = async (
  perPage = 100,
  role,
  id,
  page,
  sortOrder = "Desc",
  sortField = "created_at"
) => {
  console.log({ role, id });
  try {
    const response = await axios.get("/bookings", {
      params: {
        sortOrder,
        perPage,
        sortField,
        page: page + 1,
        // [role]: id,
      },
    });
    console.log({ response });
    if (response.data.success) {
      return {
        data: response.data.data,
        success: true,
        totalRecords: response?.data?.meta?.total,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching services:", {
      message: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};
