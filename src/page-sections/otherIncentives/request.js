import axios from "axios";

export const getRecords = async (
  search,
  perPage,
  page,
  sortOrder = "Desc",
  sortField = "incentiveDate",
  startDate,
  endDate,
  status,
  employeeId
) => {
  try {
     
    const response = await axios.get("/otherIncentives", {
      params: {
        search,
        sortOrder,
        page: page + 1,
        perPage,
        sortField,
        startDate,
        endDate,
        status,
        employeeId
      },
    });
    
    console.log("API response:", response);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data || [],
        success: true,
        totalRecords: response?.data?.data?.meta?.total || 0,
      };
    } else {
      return { 
        success: false, 
        message: response?.data?.message || "Failed to fetch incentives",
        error: response?.data?.error 
      };
    }
  } catch (error) {
    console.error("Error fetching incentives:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Error fetching incentives",
      error: error.response?.data?.error || error
    };
  }
};

export const create = async (data) => {
  try {
    console.log("Creating incentive with data:", data);
    
    const response = await axios.post("/otherIncentives", data);
    
    console.log("Create response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to create incentive",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error creating incentive:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to create incentive",
      error: error.response?.data?.error || error
    };
  }
};

export const get = async (id) => {
  try {
    console.log("Fetching incentive with id:", id);
    
    const response = await axios.get(`/otherIncentives/${id}`);
    
    console.log("Get response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to fetch incentive",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error fetching incentive:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to fetch incentive",
      error: error.response?.data?.error || error
    };
  }
};

export const update = async (id, data) => {
  try {
    console.log("Updating incentive with id:", id, "and data:", data);
    
    const response = await axios.put(`/otherIncentives/${id}`, data);
    
    console.log("Update response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to update incentive",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error updating incentive:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to update incentive",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteRecord = async (id) => {
  try {
    console.log("Deleting incentive with id:", id);
    
    const response = await axios.delete(`/otherIncentives/${id}`);
    
    console.log("Delete response:", response);
    
    if (response?.data?.success) {
      return { data: response?.data?.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete incentive",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting incentive:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete incentive",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteMultipleIncentives = async (ids) => {
  const data = { ids };
  try {
    console.log("Deleting multiple incentives with ids:", ids);
    
    const response = await axios.post(`/otherIncentives/delete-multiple`, data);
    
    console.log("Delete multiple response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete incentives",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting multiple incentives:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete incentives",
      error: error.response?.data?.error || error
    };
  }
};

export const updateStatus = async (id, status) => {
  try {
    console.log("Updating incentive status with id:", id, "and status:", status);
    
    const response = await axios.patch(`/otherIncentives/${id}/status`, { status });
    
    console.log("Update status response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to update status",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error updating incentive status:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to update status",
      error: error.response?.data?.error || error
    };
  }
};

export const getAllEmployees = async () => {
  try {
    console.log("Fetching all employees");
    
    const response = await axios.get("/employee/get?perPage=10000");
    
    console.log("Get all employees response:", response);
    
    if (response.data.success) {
      return { data: response.data.data.data || response.data.data, success: true };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to fetch employees",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to fetch employees",
      error: error.response?.data?.error || error
    };
  }
};

// For backward compatibility
export const deleteMultipleService = deleteMultipleIncentives;
