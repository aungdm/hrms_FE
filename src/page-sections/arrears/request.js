import axios from "axios";

export const getRecords = async (
  search,
  perPage,
  page,
  sortOrder = "Desc",
  sortField = "deductionDate",
  startDate,
  endDate,
  status,
  employeeId,
  processed
) => {
  try {
    // Create params object
    const params = {
      search,
      sortOrder,
      page: page + 1,
      perPage,
      sortField,
      startDate,
      endDate,
      status,
      employeeId,
    };
    
    // Only add processed parameter if it's explicitly set to "true" or "false"
    if (processed === "true" || processed === "false") {
      params.processed = processed;
    }
    
    const response = await axios.get("/arrears", {
      params
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
        message: response?.data?.message || "Failed to fetch arrears",
        error: response?.data?.error 
      };
    }
  } catch (error) {
    console.error("Error fetching arrears:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Error fetching arrears",
      error: error.response?.data?.error || error
    };
  }
};

export const create = async (data) => {
  try {
    console.log("Creating arrears with data:", data);
    
    const response = await axios.post("/arrears", data);
    
    console.log("Create response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to create arrears",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error creating arrears:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to create arrears",
      error: error.response?.data?.error || error
    };
  }
};

export const get = async (id) => {
  try {
    console.log("Fetching arrears with id:", id);
    
    const response = await axios.get(`/arrears/${id}`);
    
    console.log("Get response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to fetch arrears",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error fetching arrears:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to fetch arrears",
      error: error.response?.data?.error || error
    };
  }
};

export const update = async (id, data) => {
  try {
    console.log("Updating arrears with id:", id, "and data:", data);
    
    const response = await axios.put(`/arrears/${id}`, data);
    
    console.log("Update response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to update arrears",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error updating arrears:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to update arrears",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteRecord = async (id) => {
  try {
    console.log("Deleting arrears with id:", id);
    
    const response = await axios.delete(`/arrears/${id}`);
    
    console.log("Delete response:", response);
    
    if (response?.data?.success) {
      return { data: response?.data?.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete arrears",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting arrears:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete arrears",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteMultipleRecords = async (ids) => {
  const data = { ids };
  try {
    console.log("Deleting multiple arrears with ids:", ids);
    
    const response = await axios.post(`/arrears/delete-multiple`, data);
    
    console.log("Delete multiple response:", response);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete arrears",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting multiple arrears:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete arrears",
      error: error.response?.data?.error || error
    };
  }
};

export const updateStatus = async (id, status) => {
  try {
    console.log("Updating arrears status with id:", id, "and status:", status);
    
    const response = await axios.patch(`/arrears/${id}/status`, { status });
    
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
    console.error("Error updating arrears status:", error);
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
export const deleteMultipleService = deleteMultipleRecords;
