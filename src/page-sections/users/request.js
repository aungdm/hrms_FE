import axios from "axios";

export const getData = async (page, rowsPerPage, searchString, role) => {
  console.log({ rowsPerPage });
  try {
    const response = await axios.get(`/users`, {
      params: {
        page: page + 1,
        perPage: rowsPerPage,
        sortOrder: "Desc",
        sortField: "created_at",
        name: searchString,
        role: role,
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
    console.error("Error fetching users:", error.message);
    throw error;
  }
};

export const getRelatedData = async () => {
  try {
    const response = await axios.get(`/users/related`);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching  related data:", error.message);
    throw error;
  }
};

export const createUser = async (data) => {
  try {
    const response = await axios.post(`/users`, {
      ...data,
    });
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await axios.put(`/users/${id}`, {
      ...data,
    });
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error updating users:", error.message);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await axios.get(`/users/${id}`);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`/users/${id}`);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting users", error.message);
    throw error;
  }
};

export const deleteMultipleUser = async (ids) => {
  console.log({ ids });
  const data = {
    user_ids: ids,
  };
  try {
    const response = await axios.post(`/delete-multiple-users`, data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting user:", error.message);
    throw error;
  }
};
