import axios from "axios";

export const getRecords = async (
  perPage,
  page,
  startDate = null,
  endDate = null,
  userId = null,
  processed = null,
  deviceId = null,
  search = null
) => {
  try {
    // Create params object with only defined values
    const params = {
      page: page + 1,
      perPage: perPage
    };
    
    // Only add parameters that have values
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (userId) params.userId = userId;
    if (processed !== null && processed !== "") params.processed = processed;
    if (deviceId) params.deviceId = deviceId;
    if (search) params.search = search;
    
    const response = await axios.get("attendanceLogs/get", { params });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data,
        success: true,
        meta: response?.data?.data?.meta
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching attendance logs:", error.message);
    throw error;
  }
};

// Get attendance logs with processing errors
export const getProcessingErrors = async (
  perPage,
  page,
  startDate = null,
  endDate = null,
  userId = null,
  deviceId = null,
  search = null
) => {
  try {
    // Create params object with only defined values
    const params = {
      page: page + 1,
      perPage: perPage
    };
    
    // Only add parameters that have values
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (userId) params.userId = userId;
    if (deviceId) params.deviceId = deviceId;
    if (search) params.search = search;
    
    const response = await axios.get("attendanceLogs/processing-errors", { params });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data,
        success: true,
        meta: response?.data?.data?.meta
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching processing errors:", error.message);
    throw error;
  }
};

// Reset processing errors for selected logs
export const resetProcessingErrors = async (logIds) => {
  try {
    const response = await axios.post("attendanceLogs/reset-errors", { logIds });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error resetting processing errors:", error.message);
    throw error;
  }
};

// Get information about configured attendance machines
export const getMachinesInfo = async () => {
  try {
    const response = await axios.get("attendanceLogs/machines");
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching machine information:", error.message);
    throw error;
  }
};

// Force sync attendance logs from all machines
export const forceSyncRecords = async () => {
  try {
    const response = await axios.post("attendanceLogs/sync");
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error syncing attendance logs:", error.message);
    throw error;
  }
};

export const create = async (data) => {
  console.log({ data });
  try {
    const response = await axios.post("employee/create", data);
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
    const response = await axios.get(`/employee/get/${id}`);
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
    const response = await axios.delete(`/attendanceLogs/delete/${id}`);
    
    if (response?.data?.success) {
      return { 
        data: response?.data?.data, 
        success: true 
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting attendance log:", error.message);
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
