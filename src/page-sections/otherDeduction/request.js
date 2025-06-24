import axios from "axios";

// Get all deductions with pagination and filtering
export const getDeductions = async (params = {}) => {
  try {
    const response = await axios.get("/otherDeduction", { params });
    
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
    console.error("Error fetching deductions:", error);
    return { success: false };
  }
};

// Create a new deduction
export const createDeduction = async (data) => {
  try {
    const response = await axios.post("/otherDeduction", data);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        message: response?.data?.message || "Deduction created successfully"
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to create deduction"
      };
    }
  } catch (error) {
    console.error("Error creating deduction:", error);
    return { 
      success: false,
      message: error?.response?.data?.message || "Error creating deduction"
    };
  }
};

// Get a single deduction by ID
export const getDeduction = async (id) => {
  try {
    if (!id) return { success: false, message: "Deduction ID is required" };
    
    const response = await axios.get(`/otherDeduction/${id}`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to fetch deduction"
      };
    }
  } catch (error) {
    console.error("Error fetching deduction:", error);
    return { 
      success: false,
      message: error?.response?.data?.message || "Error fetching deduction"
    };
  }
};

// Update a deduction
export const updateDeduction = async (id, data) => {
  try {
    if (!id) return { success: false, message: "Deduction ID is required" };
    
    const response = await axios.put(`/otherDeduction/${id}`, data);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        message: response?.data?.message || "Deduction updated successfully"
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to update deduction"
      };
    }
  } catch (error) {
    console.error("Error updating deduction:", error);
    return { 
      success: false,
      message: error?.response?.data?.message || "Error updating deduction"
    };
  }
};

// Delete a deduction
export const deleteDeduction = async (id) => {
  try {
    if (!id) return { success: false, message: "Deduction ID is required" };
    
    const response = await axios.delete(`/otherDeduction/${id}`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        message: response?.data?.message || "Deduction deleted successfully"
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to delete deduction"
      };
    }
  } catch (error) {
    console.error("Error deleting deduction:", error);
    return { 
      success: false,
      message: error?.response?.data?.message || "Error deleting deduction"
    };
  }
};

// Update deduction status
export const updateDeductionStatus = async (id, status) => {
  try {
    if (!id) return { success: false, message: "Deduction ID is required" };
    if (!status) return { success: false, message: "Status is required" };
    
    const response = await axios.patch(`/otherDeduction/${id}/status`, { status });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        message: response?.data?.message || `Deduction ${status.toLowerCase()} successfully`
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to update deduction status"
      };
    }
  } catch (error) {
    console.error("Error updating deduction status:", error);
    return { 
      success: false,
      message: error?.response?.data?.message || "Error updating deduction status"
    };
  }
};

// Delete multiple deductions
export const deleteMultipleDeductions = async (ids) => {
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return { success: false, message: "Valid array of deduction IDs is required" };
    }
    
    const response = await axios.post("/otherDeduction/delete-multiple", { ids });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        message: response?.data?.message || "Deductions deleted successfully"
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to delete deductions"
      };
    }
  } catch (error) {
    console.error("Error deleting multiple deductions:", error);
    return { 
      success: false,
      message: error?.response?.data?.message || "Error deleting deductions"
    };
  }
};

// Backward compatibility exports (alias the new functions with old names)
export const create = createDeduction;
export const get = getDeduction;
export const update = updateDeduction;
export const deleteRecord = deleteDeduction;
export const getRecords = getDeductions;
export const deleteMultipleService = deleteMultipleDeductions;
