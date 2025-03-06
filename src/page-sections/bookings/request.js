import axios from "axios";

export const getBookings = async (
  perPage,
  page,
  filterObj,
  sortField,
  sortOrder
) => {
  try {
    const response = await axios.get("/bookings", {
      params: {
        sortOrder: "Desc",
        perPage: perPage,
        page: page + 1,
        sortField: "created_at",
        status: filterObj.status,
        service_id: filterObj.service_id,
        created_at: filterObj.created_at,
      },
    });
    console.log({ response }, "getBookietBooking");
    console.log(response.data.meta.total, "response.data.meta.total");
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
    console.error("Error fetching services:", error.message);
    throw error;
  }
};

export const getBooking = async (id) => {
  try {
    const response = await axios.get(`/bookings/${id}`);
    console.log({ response }, "getBooking getBooking");
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching services:", error.message);
    throw error;
  }
};
