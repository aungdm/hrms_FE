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
    case "Draft":
      color = "warning";
      break;
    case "Approved":
      color = "success";
      break;
    case "Paid":
      color = "info";
      break;
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
  const { data, isSelected, handleSelectRow, handleDelete, handleApprove, handleMarkAsPaid, handleGeneratePdf } = props;
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  // Determine which actions to show based on payroll status
  const isDraft = data?.payrollStatus === "Draft";
  const isApproved = data?.payrollStatus === "Approved";
  
  return (
    <>
      <TableRow hover>
        <TableCell>{data?.employeeId?.employeeId || "-"}</TableCell>
        <TableCell>
          <FlexBox alignItems="center" gap={1}>
            <Paragraph fontWeight={500} color="text.primary">
              {data?.employeeId?.name || "-"}
            </Paragraph>
          </FlexBox>
        </TableCell>
        <TableCell>{data?.payrollType || "-"}</TableCell>
        <TableCell>{formatDateRange(data?.startDate, data?.endDate)}</TableCell>
        <TableCell>{formatCurrency(data?.basicSalary || 0)}</TableCell>
        <TableCell>{formatCurrency(data?.totalAdditions || 0)}</TableCell>
        <TableCell>{formatCurrency(data?.totalDeductions || 0)}</TableCell>
        <TableCell>{formatCurrency(data?.netSalary || 0)}</TableCell>
        <TableCell>
          <StatusChip status={data?.payrollStatus || "Draft"} />
        </TableCell>

        <TableCell>
          <TableMoreMenu
            open={openMenuEl}
            handleOpen={handleOpenMenu}
            handleClose={handleCloseOpenMenu}
          >
            <TableMoreMenuItem
              Icon={Visibility}
              title="View"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/pay-rolls-view/${data._id}`);
              }}
            />
            
            {isDraft && (
              <>
                <TableMoreMenuItem
                  Icon={Edit}
                  title="Edit"
                  handleClick={() => {
                    handleCloseOpenMenu();
                    navigate(`/pay-rolls-update/${data._id}`);
                  }}
                />
                
                <TableMoreMenuItem
                  Icon={CheckCircle}
                  title="Approve"
                  handleClick={() => {
                    handleCloseOpenMenu();
                    handleApprove(data._id);
                  }}
                />
                
                <TableMoreMenuItem
                  Icon={DeleteOutline}
                  title="Delete"
                  handleClick={() => {
                    handleCloseOpenMenu();
                    handleDelete(data._id);
                  }}
                />
              </>
            )}
            
            {isApproved && (
              <TableMoreMenuItem
                Icon={AttachMoney}
                title="Mark as Paid"
                handleClick={() => {
                  handleCloseOpenMenu();
                  handleMarkAsPaid(data._id);
                }}
              />
            )}
            
            <TableMoreMenuItem
              Icon={PictureAsPdf}
              title="Generate PDF"
              handleClick={() => {
                handleCloseOpenMenu();
                handleGeneratePdf(data._id);
              }}
            />
          </TableMoreMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
