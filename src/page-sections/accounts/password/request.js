import axios from "axios";

export const changePassword = async (data) => {
  try {
    const response = await axios.post("/auth/change_password", { ...data });
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
