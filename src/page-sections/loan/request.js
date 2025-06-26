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
    const response = await axios.get("/loan", {
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
        message: response?.data?.message || "Failed to fetch loans",
        error: response?.data?.error 
      };
    }
  } catch (error) {
    console.error("Error fetching loans:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Error fetching loans",
      error: error.response?.data?.error || error
    };
  }
};

export const create = async (data) => {
  try {
    const response = await axios.post("/loan", data);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to create loan request",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error creating loan request:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to create loan request",
      error: error.response?.data?.error || error
    };
  }
};

export const get = async (id) => {
  try {
    const response = await axios.get(`/loan/${id}`);
    
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to fetch loan",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error fetching loan:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to fetch loan",
      error: error.response?.data?.error || error
    };
  }
};

export const update = async (id, data) => {
  try {
    const response = await axios.put(`/loan/${id}`, data);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to update loan",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error updating loan:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to update loan",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteRecord = async (id) => {
  try {
    const response = await axios.delete(`/loan/${id}`);
    
    if (response?.data?.success) {
      return { data: response?.data?.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete loan",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting loan:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete loan",
      error: error.response?.data?.error || error
    };
  }
};

export const deleteMultipleLoans = async (ids) => {
  const data = { ids };
  try {
    const response = await axios.post(`/loan/delete-multiple`, data);
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to delete loans",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error deleting multiple loans:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to delete loans",
      error: error.response?.data?.error || error
    };
  }
};

export const updateStatus = async (id, status, approvedAmount) => {
  try {
    const response = await axios.patch(`/loan/${id}/status`, { status, approvedAmount });
    
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
    console.error("Error updating loan status:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to update status",
      error: error.response?.data?.error || error
    };
  }
};

export const payInstallment = async (id, installmentId) => {
  try {
    const response = await axios.patch(`/loan/${id}/pay-installment`, { installmentId });
    
    if (response.data.success) {
      return { data: response.data.data, success: true, message: response.data.message };
    } else {
      return { 
        success: false, 
        message: response.data.message || "Failed to pay installment",
        error: response.data.error 
      };
    }
  } catch (error) {
    console.error("Error paying installment:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to pay installment",
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
export const deleteMultipleService = deleteMultipleLoans;
