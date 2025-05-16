import axios from "axios";

export const getWorkSchedules = async (
  search,
  perPage,
  page,
  sortOrder = "Desc",
  sortField = "created_at"
) => {
  console.log({ search }, "getEmployees search ");
  try {
    const response = await axios.get("workSchedule", {
      params: {
        search,
        sortOrder,
        page: page + 1,
        perPage: perPage,
        sortField,
      },
    });
    console.log({ response });
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data,
        success: true,
        totalRecords: response?.data?.data?.meta?.total,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching work schedules:", error.message);
    throw error;
  }
};

export const create = async (data) => {
  console.log({ data });
  try {
    const response = await axios.post("workSchedule", data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error creating work schedule", error.message);
    throw error;
  }
};

export const get = async (id) => {
  try {
    const response = await axios.get(`workSchedule/${id}`);
    console.log({ response });
    if (response.data.success) {
      return { data: response?.data?.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching work schedule", error.message);
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const response = await axios.put(`workSchedule/${id}`, data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error updating work schedule", error.message);
    throw error;
  }
};

export const deleteRecord = async (id) => {
  try {
    const response = await axios.delete(`workSchedule/${id}`);
    console.log({ response });
    if (response?.data?.success) {
      return { data: response?.data?.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting work schedule:", error.message);
    throw error;
  }
};

export const deleteMultipleWorkSchedules = async (ids) => {
  console.log({ ids });
  const data = {
    ids: ids,
  };
  try {
    const response = await axios.post(`/delete-multiple-workSchedules`, data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting multiple work schedules:", error.message);
    throw error;
  }
};
