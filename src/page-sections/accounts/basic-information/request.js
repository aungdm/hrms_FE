import axios from "axios";

export const getProfile = async () => {
  try {
    const response = await axios.get(`/auth/get_profile`);
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
export const updateProfile = async (data) => {
  try {
    const response = await axios.post(`/auth/update_profile`, {
      ...data,
    });
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
export const uploadImage = async (data) => {
  try {
    const response = await axios.post(`/auth/upload-user-image`, data);
    console.log({ response });
    //   if (response.data.success) {
    //     return { data: response.data.data, success: true };
    //   } else {
    //     return { success: false };
    //   }
  } catch (error) {
    console.error("Error fetching services:", error.message);
    throw error;
  }
};
