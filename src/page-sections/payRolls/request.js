import axios from "axios";

export const getRecords = async (
  search,
  perPage,
  page,
  sortOrder = "Desc",
  sortField = "created_at"
) => {
  console.log({ search }, "getEmployees search ");
  try {
    const response = await axios.get("attendanceLogs/get", {
      params: {
        search,
        sortOrder,
        page: page + 1,
        perPage: perPage,
        sortField,
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
    console.error("Error fetching services:", error.message);
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
    const response = await axios.delete(`/employee/delete/${id}`);
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

export const getPayrolls = async (
  search,
  perPage,
  page,
  startDate,
  endDate,
  employeeId,
  payrollStatus,
  payrollType,
  sortOrder = "Desc",
  sortField = "createdAt"
) => {
  try {
    const response = await axios.get("/payroll", {
      params: {
        search,
        sortOrder,
        page,
        perPage,
        sortField,
        startDate,
        endDate,
        employeeId,
        payrollStatus,
        payrollType
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
    console.error("Error fetching payrolls:", error.message);
    throw error;
  }
};

export const getPayrollById = async (id) => {
  try {
    const response = await axios.get(`/payroll/${id}`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching payroll details:", error.message);
    throw error;
  }
};

export const generatePayroll = async (data) => {
  try {
    const response = await axios.post("/payroll/generate", data);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false, message: response?.data?.message };
    }
  } catch (error) {
    console.error("Error generating payroll:", error.message);
    throw error;
  }
};

export const updatePayroll = async (id, data) => {
  try {
    const response = await axios.put(`/payroll/${id}`, data);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error updating payroll:", error.message);
    throw error;
  }
};

export const approvePayroll = async (id) => {
  try {
    const response = await axios.patch(`/payroll/${id}/approve`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error approving payroll:", error.message);
    throw error;
  }
};

export const markPayrollAsPaid = async (id) => {
  try {
    const response = await axios.patch(`/payroll/${id}/paid`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error marking payroll as paid:", error.message);
    throw error;
  }
};

export const deletePayroll = async (id) => {
  try {
    const response = await axios.delete(`/payroll/${id}`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting payroll:", error.message);
    throw error;
  }
};

export const getPayrollSummary = async (startDate, endDate) => {
  try {
    const response = await axios.get("/payroll/summary", {
      params: {
        startDate,
        endDate
      }
    });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching payroll summary:", error.message);
    throw error;
  }
};

export const getEmployees = async (search, perPage, page) => {
  try {
    const response = await axios.get("/employee", {
      params: {
        search,
        page,
        perPage
      }
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
    console.error("Error fetching employees:", error.message);
    throw error;
  }
};

export const generatePayrollPdf = async (id) => {
  try {
    const response = await axios.get(`/payroll/${id}/pdf`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error generating payroll PDF:", error.message);
    throw error;
  }
};
