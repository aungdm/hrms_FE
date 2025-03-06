import axios from "axios";

export const getRecords = async (
  search,
  perPage,
  page,
  sortOrder = "Desc",
  sortField = "created_at"
) => {
  console.log({ search }, "getEmployees search ");
  try {
    const response = await axios.get("salaryRevisions/get", {
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
    console.error("Error fetching services:", error.message);
    throw error;
  }
};

export const searchEmployees = async (search) => {
  try {
    const response = await axios.get("employee/search", {
      params: {
        search,
      },
    });
    console.log({ response });
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching services:", error.message);
    throw error;
  }
};

export const create = async (data) => {
  console.log({ data });
  try {
    const response = await axios.post("salaryRevisions/create", data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error creating Employee", error.message);
    throw error;
  }
};

export const get = async (id) => {
  try {
    const response = await axios.get(`/salaryRevisions/get/${id}`);
    console.log({ response });
    if (response.data.success) {
      return { data: response?.data?.data?.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching employee", error.message);
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const response = await axios.put(`/employee/update/${id}`, data);
    console.log({ response });
    if (response.data.success) {
      return { data: response?.data?.data?.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error updating services:", error.message);
    throw error;
  }
};

export const deleteRecord = async (id) => {
  try {
    const response = await axios.delete(`/salaryRevisions/delete/${id}`);
    console.log({ response });
    if (response?.data?.success) {
      return { data: response?.data?.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching services:", error.message);
    throw error;
  }
};

export const deleteMultipleService = async (ids) => {
  console.log({ ids });
  const data = {
    service_ids: ids,
  };
  try {
    const response = await axios.post(`/delete-multiple-services`, data);
    console.log({ response });
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
