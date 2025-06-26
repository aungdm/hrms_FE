import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { utils } from "@/utils/functionUtils";
import { Chip } from "@mui/material";
import { format } from "date-fns";

export default function TableRowView(props) {
  const { 
    data, 
    isSelected, 
    handleSelectRow, 
    handleDelete, 
    handleStatusChange,
    showCheckbox = true 
  } = props;
  
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Pending":
      default:
        return "warning";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <TableRow hover selected={isSelected}>
        {showCheckbox && (
          <TableCell padding="checkbox">
            <Checkbox
              size="small"
              color="primary"
              checked={isSelected}
              onClick={(event) => handleSelectRow(event, data._id)}
            />
          </TableCell>
        )}

        <TableCell padding="normal">
          <FlexBox alignItems="center" gap={1}>
            <div>
              <Paragraph
                fontWeight={500}
                color="text.primary"
                sx={{
                  ":hover": {
                    textDecoration: "underline",
                    cursor: "pointer",
                  },
                }}
                onClick={() => navigate(`/fine-deduction-view/${data._id}`)}
              >
                {data?.employeeId?.name || "-"}
              </Paragraph>
              {data?.employeeId?.user_defined_code && (
                <Paragraph fontSize={12} color="text.secondary">
                  ID: {data.employeeId.user_defined_code}
                </Paragraph>
              )}
            </div>
          </FlexBox>
        </TableCell>

        <TableCell padding="normal">
          {data?.deductionType || "-"}
        </TableCell>

        <TableCell padding="normal">
          {data?.amount ? `$${data.amount.toFixed(2)}` : "-"}
        </TableCell>

        <TableCell padding="normal">
          {formatDate(data?.deductionDate)}
        </TableCell>

        <TableCell padding="normal">
          <Chip 
            label={data?.status || "Pending"} 
            color={getStatusColor(data?.status)}
            size="small"
          />
        </TableCell>

        <TableCell padding="normal">
          {data?.processed ? 
            <CheckCircle color="success" fontSize="small" /> : 
            <Cancel color="error" fontSize="small" />
          }
        </TableCell>

        <TableCell padding="normal">
          <TableMoreMenu
            open={openMenuEl}
            handleOpen={handleOpenMenu}
            handleClose={handleCloseOpenMenu}
          >
            <TableMoreMenuItem
              Icon={Edit}
              title="Edit"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/fine-deduction-update/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={Visibility}
              title="View"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/fine-deduction-view/${data._id}`);
              }}
            />
            {data?.status === "Pending" && (
              <TableMoreMenuItem
                Icon={CheckCircle}
                title="Approve"
                handleClick={() => {
                  handleCloseOpenMenu();
                  handleStatusChange(data._id, "Approved");
                }}
              />
            )}
            {data?.status === "Pending" && (
              <TableMoreMenuItem
                Icon={Cancel}
                title="Reject"
                handleClick={() => {
                  handleCloseOpenMenu();
                  handleStatusChange(data._id, "Rejected");
                }}
              />
            )}
            <TableMoreMenuItem
              Icon={DeleteOutline}
              title="Delete"
              handleClick={() => {
                handleCloseOpenMenu();
                handleDelete(data._id);
              }}
            />
          </TableMoreMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
