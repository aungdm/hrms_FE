import axios from "axios";

export const getEmployeeSchedules = async (
  month,
  year,
  page = 1,
  perPage = 10
) => {
  try {
    const response = await axios.get("employeeSchedule", {
      params: {
        month,
        year,
        page,
        perPage
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
    console.error("Error fetching employee schedules:", error.message);
    return { success: false, error: error.message };
  }
};

export const getEmployeeSchedule = async (
  employee_id,
  month,
  year
) => {
  try {
    const response = await axios.get("employeeSchedule/employee", {
      params: {
        employee_id,
        month,
        year
      },
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
    console.error("Error fetching employee schedule:", error.message);
    return { success: false, error: error.message };
  }
};

export const generateEmployeeSchedule = async (
  employee_id,
  month,
  year
) => {
  try {
    const response = await axios.post("employeeSchedule/generate", {
      employee_id,
      month,
      year
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
    console.error("Error generating employee schedule:", error.message);
    return { success: false, error: error.message };
  }
};

export const generateAllEmployeeSchedules = async (
  month,
  year
) => {
  try {
    const response = await axios.post("employeeSchedule/generate-all", {
      month,
      year
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
    console.error("Error generating all employee schedules:", error.message);
    return { success: false, error: error.message };
  }
};

export const updateEmployeeScheduleDay = async (dayData) => {
  try {
    // Update the specific day
    const response = await axios.put("employeeSchedule/update-day", dayData);
    
    if (response?.data?.success) {
      // After updating, get the full schedule data to ensure we have complete data
      // Extract employee_id, month, and year from the response data
      const updatedSchedule = response?.data?.data;
      const employee_id = updatedSchedule?.employee_id;
      const month = updatedSchedule?.month;
      const year = updatedSchedule?.year;
      
      // If we have the necessary data, fetch the complete schedule
      if (employee_id && month && year) {
        try {
          const fullScheduleResponse = await axios.get("employeeSchedule/employee", {
            params: { employee_id, month, year }
          });
          
          if (fullScheduleResponse?.data?.success) {
            return {
              data: fullScheduleResponse?.data?.data,
              success: true,
            };
          }
        } catch (err) {
          console.warn("Error fetching full schedule after update:", err);
          // Fall back to the original response data if fetch fails
        }
      }
      
      // Return the original response data if we couldn't fetch the full schedule
      return {
        data: updatedSchedule,
        success: true,
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to update schedule"
      };
    }
  } catch (error) {
    console.error("Error updating employee schedule day:", error.message);
    return { 
      success: false, 
      error: error.message,
      message: "An error occurred while updating the schedule"
    };
  }
};

export const deleteEmployeeSchedule = async (id) => {
  try {
    const response = await axios.delete(`employeeSchedule/${id}`);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error deleting employee schedule:", error.message);
    return { success: false, error: error.message };
  }
};

export const getMultipleEmployeeSchedules = async (
  employee_ids,
  month,
  year
) => {
  try {
    // Create an array of promises for each employee schedule request
    const promises = employee_ids.map(id => 
      axios.get("employeeSchedule/employee", {
        params: {
          employee_id: id,
          month,
          year
        },
      })
    );
    
    // Execute all requests in parallel
    const responses = await Promise.all(promises);
    
    // Process all responses
    const results = responses.map(response => {
      if (response?.data?.success) {
        return {
          data: response?.data?.data,
          success: true
        };
      } else {
        return { success: false };
      }
    });
    
    return {
      data: results.filter(r => r.success).map(r => r.data),
      success: true,
      failedCount: results.filter(r => !r.success).length
    };
  } catch (error) {
    console.error("Error fetching multiple employee schedules:", error.message);
    return { success: false, error: error.message };
  }
};

export const updateMultipleEmployeeScheduleDays = async (schedulesData) => {
  try {
    console.log('Sending batch update request with schedules:', schedulesData.length);
    
    // Call the backend endpoint for batch updates
    const response = await axios.put("employeeSchedule/update-multiple", {
      schedules: schedulesData
    });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        message: `Successfully updated ${response?.data?.data?.success} schedules`
      };
    } else {
      return { 
        success: false,
        message: response?.data?.message || "Failed to update schedules"
      };
    }
  } catch (error) {
    console.error("Error updating multiple employee schedule days:", error.message);
    return { 
      success: false, 
      error: error.message,
      message: "An error occurred while updating the schedules"
    };
  }
}; 

export const revertEmployeeSchedulesToDefault = async (
  employee_ids,
  month,
  year
) => {
  try {
    const response = await axios.post("employeeSchedule/revert", {
      employee_ids,
      month,
      year,
    });

    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        message: response?.data?.message || "Schedules reverted to default successfully",
      };
    } else {
      return {
        success: false,
        message: response?.data?.message || "Failed to revert schedules",
      };
    }
  } catch (error) {
    console.error("Error reverting employee schedules:", error.message);
    return {
      success: false,
      error: error.message,
      message: "An error occurred while reverting schedules",
    };
  }
}; 