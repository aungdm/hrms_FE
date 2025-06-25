import axios from "axios";
import moment from "moment";

export const getRecords = async (
  perPage,
  page,
  startDate = moment().startOf("month").toISOString(),
  endDate = moment().endOf("month").toISOString(),
  employeeId,
  status,
  hasOvertime,
  overtimeStatus
) => {
  try {
    const response = await axios.get("dailyAttendance/get", {
      params: {
        page: page + 1,
        perPage: perPage || 5,
        startDate,
        endDate,
        employeeId,
        status,
        hasOvertime,
        overtimeStatus
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
    console.error("Error fetching attendance records:", error.message);
    throw error;
  }
};

// Get all employees for filter dropdown
export const getAllEmployees = async () => {
  try {
    const response = await axios.get("employee/get", {
      params: {
        perPage: 1000, // Get all employees for dropdown
      },
    });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data || [],
        success: true,
        totalRecords: response?.data?.data?.meta?.total || 0,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false };
  }
};

export const create = async (data) => {
  console.log({ data });
  try {
    const response = await axios.post("dailyAttendance/create", data);
    console.log({ response });
    // if (response.data.success) {
    //   return { data: response.data.data, success: true };
    // } else {
    //   return { success: false };
    // }
  } catch (error) {
    console.error("Error creating Employee", error.message);
    throw error;
  }
};

export const get = async (id) => {
  try {
    const response = await axios.get(`dailyAttendance/get/${id}`);
    console.log({ response });
    if (response.data.success) {
      return { data: response?.data?.data                                                                                                                                                                                                           , success: true };
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
    const response = await axios.put(`/dailyAttendance/update/${id}`, data);
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
    const response = await axios.delete(`/dailyAttendance/delete/${id}`);
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

// Recalculate attendance based on updated employee schedule
export const recalculateAttendance = async (id) => {
  try {
    const response = await axios.post(`/dailyAttendance/recalculate/${id}`);
    
    if (response?.data?.success) {
      return { 
        data: response?.data?.data, 
        success: true,
        message: response?.data?.message || "Attendance recalculated successfully"
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to recalculate attendance"
      };
    }
  } catch (error) {
    console.error("Error recalculating attendance:", error.message);
    return { 
      success: false, 
      message: error?.response?.data?.message || "Error recalculating attendance"
    };
  }
};
