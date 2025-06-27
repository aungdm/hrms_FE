import axios from "axios";

export const getRecords = async (
  search,
  perPage,
  page,
  sortOrder = "desc",
  sortField = "createdAt",
  startDate,
  endDate,
  status,
  employeeId,
  processed
) => {
  try {
    const response = await axios.get("/advanced-salary", {
      params: {
        search,
        sortOrder,
        page: page + 1,
        perPage,
        sortField,
        startDate,
        endDate,
        status,
        employeeId,
        processed
      },
    });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data || [],
        success: true,
        totalRecords: response?.data?.data?.meta?.total || 0,
      };
    } else {
      return { 
        success: false, 
        message: response?.data?.message || "Failed to fetch advanced salaries",
        error: response?.data?.error 
      };
    }
  } catch (error) {
    console.error("Error fetching advanced salaries:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Error fetching advanced salaries",
      error: error.response?.data?.error || error
    };
  }
};

export const create = async (data) => {
  try {
    const response = await axios.post("/advanced-salary", data);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to create advanced salary request",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error creating advanced salary request:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to create advanced salary request",
      error: error.response?.data?.error || error
    };
  }
};

export const get = async (id) => {
  try {
    const response = await axios.get(`/advanced-salary/${id}`);
    
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to fetch advanced salary",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error fetching advanced salary:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to fetch advanced salary",
      error: error.response?.data?.error || error
    };
  }
};

export const update = async (id, data) => {
  try {
    const response = await axios.put(`/advanced-salary/${id}`, data);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to update advanced salary",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error updating advanced salary:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to update advanced salary",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteRecord = async (id) => {
  try {
    const response = await axios.delete(`/advanced-salary/${id}`);
    
    if (response?.data?.success) {
      return { data: response?.data?.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete advanced salary",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting advanced salary:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete advanced salary",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteMultipleAdvancedSalaries = async (ids) => {
  const data = { ids };
  try {
    const response = await axios.post(`/advanced-salary/delete-multiple`, data);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete advanced salaries",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting multiple advanced salaries:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete advanced salaries",
      error: error.response?.data?.error || error
    };
  }
};

export const updateStatus = async (id, status, approvedAmount) => {
  try {
    // Validate ID
    if (!id) {
      console.error("Invalid ID provided to updateStatus:", id);
      return { 
        success: false, 
        message: "Invalid ID. Cannot update status."
      };
    }
    
    // Ensure approvedAmount is a valid number if provided
    const payload = { status };
    if (status === "Approved" && approvedAmount !== undefined) {
      payload.approvedAmount = parseFloat(approvedAmount);
      
      if (isNaN(payload.approvedAmount) || payload.approvedAmount <= 0) {
        return { 
          success: false, 
          message: "Invalid approved amount. Please enter a valid positive number."
        };
      }
    }
    
    console.log(`Sending status update for ID: ${id} with payload:`, payload);
    
    const response = await axios.patch(`/advanced-salary/${id}/status`, payload);
    
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
    console.error("Error updating advanced salary status:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to update status",
      error: error.response?.data?.error || error
    };
  }
};

export const getAllEmployees = async () => {
  try {
    const response = await axios.get("/employee/get?perPage=10000");
    
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
export const deleteMultipleLoans = deleteMultipleAdvancedSalaries;
