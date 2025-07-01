import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import CheckCircle from "@mui/icons-material/CheckCircle";
import AttachMoney from "@mui/icons-material/AttachMoney";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { Chip } from "@mui/material";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";

// Status chip component for better visual representation
const StatusChip = ({ status }) => {
  let color = "default";
  
  switch (status) {
    case "Generated":
    case "Draft":
      color = "warning";
      break;
    case "Approved":
      color = "success";
      break;
    case "Paid":
      color = "info";
      break;
    case "Rejected":
    case "Cancelled":
      color = "error";
      break;
    default:
      color = "default";
  }
  
  return <Chip label={status} color={color} size="small" />;
};

// Format currency values
const formatCurrency = (amount) => {
  return `Rs. ${Number(amount).toLocaleString()}`;
};

// Format date range for display
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "-";
  return `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`;
};

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete, handleApprove, handleMarkAsPaid, handleGeneratePdf, handleViewPdf } = props;
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigateToView = () => {
    navigate(`/pay-rolls-view/${data._id}`);
    handleClose();
  };

  const navigateToEdit = () => {
    // Only allow editing if status is "Generated"
    if (data.status === "Generated") {
      navigate(`/pay-rolls-edit/${data._id}`);
    } else {
      toast.warning("Only payrolls with 'Generated' status can be edited");
    }
    handleClose();
  };

  const handleDeleteClick = () => {
    // Only allow deletion if status is "Generated"
    if (data.status === "Generated") {
      handleDelete(data._id, data.payrollType);
    } else {
      toast.warning("Only payrolls with 'Generated' status can be deleted");
    }
    handleClose();
  };

  const handleApproveClick = () => {
    // Only allow approval if status is "Generated"
    if (data.status === "Generated") {
      handleApprove(data._id, data.payrollType);
    } else {
      toast.warning("Only payrolls with 'Generated' status can be approved");
    }
    handleClose();
  };

  const handleMarkAsPaidClick = () => {
    // Only allow marking as paid if status is "Approved"
    if (data.status === "Approved") {
      handleMarkAsPaid(data._id, data.payrollType);
    } else {
      toast.warning("Only payrolls with 'Approved' status can be marked as paid");
    }
    handleClose();
  };

  const handleGeneratePdfClick = () => {
    handleGeneratePdf(data._id, data.payrollType);
    handleClose();
  };

  const handleViewPdfClick = () => {
    handleViewPdf(data._id, data.payrollType);
    handleClose();
  };

  // Determine which actions to show based on payroll status
  const isDraft = data?.status === "Generated" || data?.status === "Draft";
  const isApproved = data?.status === "Approved";
  
  // Determine salary fields based on payroll type (Hourly vs Monthly)
  const renderSalaryFields = () => {
    if (data?.payrollType === "Hourly" || data?._type === "Hourly") {
      return (
        <>
          <TableCell>{formatCurrency(data?.grossSalary || 0)}</TableCell>
          <TableCell>{formatCurrency(data?.lateFines || 0)}</TableCell>
          <TableCell>{formatCurrency(data?.otherDeductions || 0)}</TableCell>
          <TableCell>{formatCurrency(data?.overtimePay || 0)}</TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell>{formatCurrency(data?.grossSalary || 0)}</TableCell>
          <TableCell>{formatCurrency(data?.absentDeductions || 0)}</TableCell>
          <TableCell>{formatCurrency(data?.otherDeductions || 0)}</TableCell>
          <TableCell>-</TableCell>
        </>
      );
    }
  };
  
  const iconList = [
    {
      Icon: Visibility,
      title: "View",
      onClick: navigateToView,
    },
    {
      Icon: Edit,
      title: "Edit",
      onClick: navigateToEdit,
    },
    {
      Icon: CheckCircle,
      title: "Approve",
      onClick: handleApproveClick,
    },
    {
      Icon: AttachMoney,
      title: "Mark as Paid",
      onClick: handleMarkAsPaidClick,
    },
    {
      Icon: PictureAsPdf,
      title: "Generate Payslip",
      onClick: handleGeneratePdfClick,
    },
    {
      Icon: PictureAsPdf,
      title: "View Payslip",
      onClick: handleViewPdfClick,
    },
    {
      Icon: DeleteOutline,
      title: "Delete",
      onClick: handleDeleteClick,
    },
  ];

  return (
    <>
      <TableRow hover>
        <TableCell>{data?.employeeId || "-"}</TableCell>
        <TableCell>
          <FlexBox alignItems="center" gap={1}>
            <Paragraph fontWeight={500} color="text.primary">
              {data?.employeeName || "-"}
            </Paragraph>
          </FlexBox>
        </TableCell>
        <TableCell>{data?.designation || "-"}</TableCell>
        <TableCell>{data?.payrollType || data?._type || "-"}</TableCell>
        <TableCell>{formatDateRange(data?.startDate, data?.endDate)}</TableCell>
        
        {renderSalaryFields()}
        
        <TableCell>{formatCurrency(data?.netSalary || 0)}</TableCell>
        <TableCell>
          <StatusChip status={data?.status || "Generated"} />
        </TableCell>

        <TableCell>
          <IconButton onClick={handleClick}>
            <MoreHorizIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {iconList.map((item, index) => (
              <MenuItem
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {item.Icon && <item.Icon fontSize="small" sx={{ mr: 1 }} />}
                {item.title}
              </MenuItem>
            ))}
          </Menu>
        </TableCell>
      </TableRow>
    </>
  );
}
