import axios from "axios";

export const getWorkSchedules = async (
  search,
  perPage,
  page,
  sortOrder = "Desc",
  sortField = "created_at"
) => {
  console.log({ search }, "getEmployees search ");
  try {
    const response = await axios.get("workSchedule", {
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
    console.error("Error fetching work schedules:", error.message);
    throw error;
  }
};

export const create = async (data) => {
  console.log({ data });
  try {
    const response = await axios.post("workSchedule", data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error creating work schedule", error.message);
    throw error;
  }
};

export const get = async (id) => {
  try {
    const response = await axios.get(`workSchedule/${id}`);
    console.log({ response });
    if (response.data.success) {
      return { data: response?.data?.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching work schedule", error.message);
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const response = await axios.put(`workSchedule/${id}`, data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error updating work schedule", error.message);
    throw error;
  }
};

export const deleteRecord = async (id) => {
  try {
    const response = await axios.delete(`workSchedule/${id}`);
    console.log({ response });
    if (response?.data?.success) {
      return { data: response?.data?.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting work schedule:", error.message);
    throw error;
  }
};

export const deleteMultipleWorkSchedules = async (ids) => {
  console.log({ ids });
  const data = {
    ids: ids,
  };
  try {
    const response = await axios.post(`/delete-multiple-workSchedules`, data);
    console.log({ response });
    if (response.data.success) {
      return { data: response.data.data, success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting multiple work schedules:", error.message);
    throw error;
  }
};

export const getLeaves = async (params = {}) => {
  try {
    const response = await axios.get("/leave", { params });
    if (response.data) {
      console.log({ response }, "leaves");
      return {
        success: true,
        data: response?.data?.data?.data,
        totalRecords: response?.data?.data.meta?.total || 0,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return { success: false };
  }
};

export const createLeave = async (leaveData) => {
  try {
    const { employeeId, date, status, createdFromAbsence } = leaveData;

    const payload = {
      employeeId,
      date,
      status: status || "Pending",
    };

    if (createdFromAbsence !== undefined) {
      payload.createdFromAbsence = createdFromAbsence;
    }

    const response = await axios.post("/leave", payload);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error creating leave:", error);
    return { success: false };
  }
};

export const getLeaveById = async (id) => {
  try {
    const response = await axios.get(`/leave/${id}`);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error fetching leave with ID ${id}:`, error);
    return { success: false };
  }
};

export const updateLeave = async (id, leaveData) => {
  try {
    const response = await axios.put(`/leave/${id}`, leaveData);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error updating leave with ID ${id}:`, error);
    return { success: false };
  }
};

export const deleteLeave = async (id) => {
  try {
    const response = await axios.delete(`/leave/${id}`);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error deleting leave with ID ${id}:`, error);
    return { success: false };
  }
};

export const updateLeaveStatus = async (id, status) => {
  try {
    const response = await axios.patch(`/leave/${id}/status`, { status });
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error updating leave status with ID ${id}:`, error);
    return { success: false };
  }
};

export const getAllEmployees = async () => {
  try {
    const response = await axios.get("employee/get", {
      params: {
        perPage: 1000, // Get all employees
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

// Get all punch requests with pagination and filtering
export const getPunches = async (params = {}) => {
  try {
    const response = await axios.get("/punch", { params });
    if (response.data) {
      return {
        success: true,
        data: response?.data?.data?.data || [],
        totalRecords: response?.data?.data?.meta?.total || 0,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching punch requests:", error);
    return { success: false };
  }
};

// Get attendance records for an employee
export const getAttendanceRecordsByEmployee = async (employeeId, startDate, endDate) => {
  try {
    if (!employeeId) return { success: false, data: [] };

    const params = {
      employeeId,
      perPage: 100,
      page: 1
    };

    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axios.get("dailyAttendance/get", { params });
    
    if (response?.data?.success) {
      return {
        success: true,
        data: response?.data?.data?.data || [],
      };
    } else {
      return { success: false, data: [] };
    }
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return { success: false, data: [] };
  }
};

// Create a new punch request
export const createPunch = async (punchData) => {
  try {
    const { employeeId, date, time, punchType, attendanceId } = punchData;
    
    const payload = {
      employeeId,
      date,
      time,
      punchType,
      attendanceId
    };

    const response = await axios.post("/punch", payload);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error creating punch request:", error);
    return { success: false };
  }
};

// Get a single punch request by ID
export const getPunchById = async (id) => {
  try {
    const response = await axios.get(`/punch/${id}`);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error fetching punch request with ID ${id}:`, error);
    return { success: false };
  }
};

// Update a punch request
export const updatePunch = async (id, punchData) => {
  try {
    const response = await axios.put(`/punch/${id}`, punchData);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error updating punch request with ID ${id}:`, error);
    return { success: false };
  }
};

// Delete a punch request
export const deletePunch = async (id) => {
  try {
    const response = await axios.delete(`/punch/${id}`);
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error deleting punch request with ID ${id}:`, error);
    return { success: false };
  }
};

// Approve or reject a punch request
export const updatePunchStatus = async (id, status) => {
  try {
    const response = await axios.patch(`/punch/${id}/status`, { status });
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(`Error updating punch status with ID ${id}:`, error);
    return { success: false };
  }
};
