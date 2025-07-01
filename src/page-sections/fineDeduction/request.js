import axios from "axios";

export const getRecords = async (
  perPage,
  page,
  startDate,
  endDate,
  employeeId,
  status,
  sortOrder = "Desc",
  sortField = "deductionDate",
  search = ""
) => {
  try {
    const response = await axios.get("/fineDeduction", {
      params: {
        page: page + 1,
        perPage,
        startDate,
        endDate,
        employeeId,
        status,
        sortOrder,
        sortField,
        search
      },
    });
    
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
    console.error("Error fetching fine deductions:", error.message);
    throw error;
  }
};

export const create = async (data) => {
  try {
    const response = await axios.post("/fineDeduction", data);
    
    if (response.data.success) {
      return { 
        data: response.data.data, 
        success: true,
        message: response.data.message || "Fine deduction created successfully"
      };
    } else {
      return { 
        success: false,
        message: response.data.message || "Failed to create fine deduction"
      };
    }
  } catch (error) {
    console.error("Error creating fine deduction:", error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error creating fine deduction"
    };
  }
};

export const get = async (id) => {
  try {
    const response = await axios.get(`/fineDeduction/${id}`);
    
    if (response.data.success) {
      return { 
        data: response.data.data, 
        success: true 
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching fine deduction:", error.message);
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const response = await axios.put(`/fineDeduction/${id}`, data);
    
    if (response.data.success) {
      return { 
        data: response.data.data, 
        success: true,
        message: response.data.message || "Fine deduction updated successfully"
      };
    } else {
      return { 
        success: false,
        message: response.data.message || "Failed to update fine deduction"
      };
    }
  } catch (error) {
    console.error("Error updating fine deduction:", error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error updating fine deduction"
    };
  }
};

export const updateStatus = async (id, status) => {
  try {
    const response = await axios.patch(`/fineDeduction/${id}/status`, { status });
    
    if (response.data.success) {
      return { 
        data: response.data.data, 
        success: true,
        message: response.data.message || `Fine deduction ${status.toLowerCase()} successfully`
      };
    } else {
      return { 
        success: false,
        message: response.data.message || "Failed to update fine deduction status"
      };
    }
  } catch (error) {
    console.error("Error updating fine deduction status:", error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error updating fine deduction status"
    };
  }
};

export const deleteRecord = async (id) => {
  try {
    const response = await axios.delete(`/fineDeduction/${id}`);
    
    if (response.data.success) {
      return { 
        data: response.data.data, 
        success: true,
        message: response.data.message || "Fine deduction deleted successfully"
      };
    } else {
      return { 
        success: false,
        message: response.data.message || "Failed to delete fine deduction"
      };
    }
  } catch (error) {
    console.error("Error deleting fine deduction:", error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error deleting fine deduction"
    };
  }
};

export const deleteMultipleDeductions = async (ids) => {
  try {
    const response = await axios.post(`/fineDeduction/delete-multiple`, { ids });
    
    if (response.data.success) {
      return { 
        data: response.data.data, 
        success: true,
        message: response.data.message || "Fine deductions deleted successfully"
      };
    } else {
      return { 
        success: false,
        message: response.data.message || "Failed to delete fine deductions"
      };
    }
  } catch (error) {
    console.error("Error deleting multiple fine deductions:", error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error deleting multiple fine deductions"
    };
  }
};

// Get all employees for dropdown
export const getAllEmployees = async () => {
  try {
    const response = await axios.get("/employee/get", {
      params: {
        perPage: 1000, // Get all employees for dropdown
      },
    });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data?.data || [],
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false };
  }
};

export const updateProcessedStatus = async (id, processed) => {
  try {
    console.log(`Updating processed status for ID: ${id} to ${processed}`);
    
    // Create a dedicated endpoint for updating processed status
    const response = await axios.patch(`/fineDeduction/${id}/processed`, { processed });
    
    if (response.data.success) {
      return { 
        data: response.data.data, 
        success: true,
        message: response.data.message || `Fine deduction ${processed ? 'marked as paid' : 'marked as unpaid'} successfully`
      };
    } else {
      return { 
        success: false,
        message: response.data.message || "Failed to update payment status"
      };
    }
  } catch (error) {
    console.error("Error updating processed status:", error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error updating payment status"
    };
  }
};

export const deleteMultipleService = deleteMultipleDeductions;
