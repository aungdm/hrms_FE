import axios from "axios";
import { jsPDF } from 'jspdf';

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
    // Choose the appropriate endpoint based on payroll type
    const endpoint = payrollType === "Hourly" 
      ? "/payroll/hourly" 
      : payrollType === "Monthly" 
        ? "/payroll/monthly" 
        : "/payroll";
        
    const response = await axios.get(endpoint, {
      params: {
        search,
        sortOrder,
        page,
        perPage,
        sortField,
        startDate,
        endDate,
        employeeId,
        status: payrollStatus,
      },
    });
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
        totalRecords: response?.data?.total || response?.data?.data?.meta?.total,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching payrolls:", error.message);
    return { success: false, error: error.message };
  }
};

export const getPayrollById = async (id, payrollType) => {
  try {
    // Choose the appropriate endpoint based on payroll type
    const endpoint = payrollType === "Hourly" 
      ? `/payroll/hourly/${id}` 
      : payrollType === "Monthly" 
        ? `/payroll/monthly/${id}` 
        : `/payroll/${id}`;
        
    const response = await axios.get(endpoint);
    
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
    return { success: false, error: error.message };
  }
};

export const generatePayroll = async (data) => {
  try {
    // Choose the appropriate endpoint based on payroll type
    const endpoint = data.payrollType === "Hourly" 
      ? "/payroll/hourly/generate" 
      : "/payroll/monthly/generate";
    
    const response = await axios.post(endpoint, data);
    
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
    return { success: false, error: error.message };
  }
};

export const updatePayroll = async (id, data, payrollType) => {
  try {
    // Choose the appropriate endpoint based on payroll type
    const endpoint = payrollType === "Hourly" 
      ? `/payroll/hourly/${id}` 
      : payrollType === "Monthly" 
        ? `/payroll/monthly/${id}` 
        : `/payroll/${id}`;
        
    const response = await axios.put(endpoint, data);
    
    if (response?.data?.success) {
      return {
        data: response?.data?.data,
        success: true,
      };
    } else {
      return { success: false, message: response?.data?.message };
    }
  } catch (error) {
    console.error("Error updating payroll:", error.message);
    return { success: false, error: error.message };
  }
};

export const approvePayroll = async (id, payrollType) => {
  try {
    // In a real implementation, this might be a specific endpoint for approval
    // Here we're just updating the status
    const data = { status: "Approved" };
    return updatePayroll(id, data, payrollType);
  } catch (error) {
    console.error("Error approving payroll:", error.message);
    throw error;
  }
};

export const markPayrollAsPaid = async (id, payrollType) => {
  try {
    // In a real implementation, this might be a specific endpoint for marking as paid
    // Here we're just updating the status
    const data = { status: "Paid" };
    return updatePayroll(id, data, payrollType);
  } catch (error) {
    console.error("Error marking payroll as paid:", error.message);
    throw error;
  }
};

export const deletePayroll = async (id, payrollType) => {
  try {
    // Choose the appropriate endpoint based on payroll type
    const endpoint = payrollType === "Hourly" 
      ? `/payroll/hourly/${id}` 
      : payrollType === "Monthly" 
        ? `/payroll/monthly/${id}` 
        : `/payroll/${id}`;
        
    const response = await axios.delete(endpoint);
    
    if (response?.data?.success) {
      return {
        success: true,
        message: response?.data?.message,
      };
    } else {
      return { success: false, message: response?.data?.message };
    }
  } catch (error) {
    console.error("Error deleting payroll:", error.message);
    return { success: false, error: error.message };
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
    const response = await axios.get("/employee/get", {
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

export const generatePayrollPdf = async (id, payrollType) => {
  try {
    // Choose the appropriate endpoint based on payroll type
    const endpoint = payrollType === "Hourly" 
      ? `/payroll/hourly/${id}/payslip` 
      : payrollType === "Monthly" 
        ? `/payroll/monthly/${id}/payslip` 
        : `/payroll/${id}/payslip`;

    console.log("Fetching payroll data from:", endpoint);

    // Fetch the JSON data from the backend
    const response = await axios.get(endpoint);
    
    console.log("Payroll response:", response.data);
    
    if (response.data && response.data.success) {
      const payrollData = response.data.data;
      console.log("Payroll data structure:", payrollData);
      
      // Create PDF from the JSON data
      const pdf = createPayslipPDF(payrollData);
      
      return {
        success: true,
        pdfBlob: pdf.output('blob'),
        pdfData: payrollData
      };
    } else {
      console.error("Failed to fetch payroll data:", response.data);
      return {
        success: false,
        error: response.data?.message || "Failed to fetch payroll data"
      };
    }
  } catch (error) {
    console.error("Error generating payroll PDF:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || "Error generating PDF"
    };
  }
};

const createPayslipPDF = (data) => {
  const pdf = new jsPDF();
  
  // Set font
  pdf.setFont('helvetica');
  
  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('PAYSLIP', 105, 20, { align: 'center' });
  
  let yPosition = 40;
  
  // Employee Information
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Employee Information', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  
  // Employee details
  const employeeId = data.employeeInfo?.id || data.employeeId || 'N/A';
  const employeeName = data.employeeInfo?.name || data.employeeName || 'N/A';
  const designation = data.employeeInfo?.designation || data.designation || 'N/A';
  const employeeType = data.employeeInfo?.type || data.type || (data.lateFines !== undefined ? 'Hourly' : 'Monthly');
  
  pdf.text(`Employee ID: ${employeeId}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Employee Name: ${employeeName}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Designation: ${designation}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Employee Type: ${employeeType}`, 20, yPosition);
  yPosition += 15;
  
  // Payroll Period
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Payroll Period', 20, yPosition);
  yPosition += 10;
  
  const startDate = (data.payrollPeriod?.startDate || data.startDate) ? 
    new Date(data.payrollPeriod?.startDate || data.startDate).toLocaleDateString() : 'N/A';
  const endDate = (data.payrollPeriod?.endDate || data.endDate) ? 
    new Date(data.payrollPeriod?.endDate || data.endDate).toLocaleDateString() : 'N/A';
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Period: ${startDate} to ${endDate}`, 20, yPosition);
  yPosition += 20;
  
  // Salary Details
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Salary Details', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  
  // Handle both nested and flat data structures
  const salaryDetails = data.salaryDetails || data;
  
  // Draw salary details
  pdf.text(`Gross Salary: Rs. ${(salaryDetails.grossSalary || 0).toLocaleString()}`, 20, yPosition);
  yPosition += 8;
  
  if (salaryDetails.perHourRate !== undefined || salaryDetails.hourlyRate !== undefined) {
    pdf.text(`Per Hour Rate: Rs. ${(salaryDetails.perHourRate || salaryDetails.hourlyRate || 0).toFixed(2)}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (salaryDetails.payableHours !== undefined || salaryDetails.totalHours !== undefined) {
    pdf.text(`Payable Hours: ${salaryDetails.payableHours || salaryDetails.totalHours || 0}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (salaryDetails.lateFines !== undefined) {
    pdf.text(`Late Fines: Rs. ${(salaryDetails.lateFines || 0).toLocaleString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (salaryDetails.absentDeductions !== undefined) {
    pdf.text(`Absent Deductions: Rs. ${(salaryDetails.absentDeductions || 0).toLocaleString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (salaryDetails.otherDeductions !== undefined) {
    pdf.text(`Other Deductions: Rs. ${(salaryDetails.otherDeductions || 0).toLocaleString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (salaryDetails.overtimePay !== undefined) {
    pdf.text(`Overtime Pay: Rs. ${(salaryDetails.overtimePay || 0).toLocaleString()}`, 20, yPosition);
    yPosition += 8;
  }
  
  // Net salary with emphasis
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  pdf.text(`Net Salary: Rs. ${(salaryDetails.netSalary || 0).toLocaleString()}`, 20, yPosition);
  yPosition += 20;
  
  // Daily Calculations (if available and space permits)
  const dailyCalcs = data.dailyCalculations || [];
  if (dailyCalcs.length > 0 && yPosition < 200) {
    pdf.setFontSize(14);
    pdf.setTextColor(60, 60, 60);
    pdf.text('Daily Salary Calculations', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);
    
    // Header for daily calculations
    pdf.text('Date', 20, yPosition);
    pdf.text('Status', 50, yPosition);
    pdf.text('Hours', 80, yPosition);
    pdf.text('Daily Pay', 100, yPosition);
    pdf.text('Late Fine', 130, yPosition);
    pdf.text('OT Pay', 160, yPosition);
    pdf.text('Total', 180, yPosition);
    yPosition += 8;
    
    // Draw a line
    pdf.line(20, yPosition - 2, 200, yPosition - 2);
    
    // Show first 10 days to fit on page
    const maxDays = Math.min(dailyCalcs.length, Math.floor((280 - yPosition) / 8));
    
    for (let i = 0; i < maxDays; i++) {
      const day = dailyCalcs[i];
      const date = day.date ? new Date(day.date).toLocaleDateString('en-GB') : 'N/A';
      
      pdf.text(date, 20, yPosition);
      pdf.text(day.status || 'N/A', 50, yPosition);
      pdf.text(String(day.regularHours || day.hours || 0), 80, yPosition);
      pdf.text(`Rs. ${(day.dailyPay || 0).toFixed(0)}`, 100, yPosition);
      pdf.text(`Rs. ${(day.lateFine || 0).toFixed(0)}`, 130, yPosition);
      pdf.text(`Rs. ${(day.overtimePay || 0).toFixed(0)}`, 160, yPosition);
      pdf.text(`Rs. ${(day.totalDailyPay || day.total || 0).toFixed(0)}`, 180, yPosition);
      yPosition += 8;
    }
    
    if (dailyCalcs.length > maxDays) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`... and ${dailyCalcs.length - maxDays} more days`, 20, yPosition + 5);
    }
    
    // Add note about late fines
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Note: First three late days are not charged with fines.', 20, yPosition + 15);
  }
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 285);
  pdf.text('Page 1 of 1', 170, 285);
  
  return pdf;
};
