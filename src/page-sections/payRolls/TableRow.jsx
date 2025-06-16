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
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

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
      onClick: () => {
        handleCloseOpenMenu();
        navigate(`/pay-rolls-view/${data._id}`);
      },
    },
    {
      Icon: PictureAsPdf,
      title: "Generate Payslip",
      onClick: () => {
        handleCloseOpenMenu();
        handleGeneratePdf(data._id, data?.payrollType || data?._type);
      },
    },
    {
      Icon: Visibility,
      title: "View Payslip",
      onClick: () => {
        handleCloseOpenMenu();
        handleViewPdf(data._id, data?.payrollType || data?._type);
      },
    },
  ];

  if (isDraft) {
    iconList.push(
      {
        Icon: Edit,
        title: "Edit",
        onClick: () => {
          handleCloseOpenMenu();
          navigate(`/pay-rolls-update/${data._id}`);
        },
      },
      {
        Icon: CheckCircle,
        title: "Approve",
        onClick: () => {
          handleCloseOpenMenu();
          handleApprove(data._id, data?.payrollType || data?._type);
        },
      },
      {
        Icon: DeleteOutline,
        title: "Delete",
        onClick: () => {
          handleCloseOpenMenu();
          handleDelete(data._id, data?.payrollType || data?._type);
        },
      }
    );
  }

  if (isApproved) {
    iconList.push(
      {
        Icon: AttachMoney,
        title: "Mark as Paid",
        onClick: () => {
          handleCloseOpenMenu();
          handleMarkAsPaid(data._id, data?.payrollType || data?._type);
        },
      }
    );
  }

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
          <TableMoreMenu
            open={openMenuEl}
            handleOpen={handleOpenMenu}
            handleClose={handleCloseOpenMenu}
          >
            {iconList.map((item, index) => (
              <TableMoreMenuItem
                key={index}
                Icon={item.Icon}
                title={item.title}
                handleClick={item.onClick}
              />
            ))}
          </TableMoreMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
