import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph, Small } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { Chip } from "@mui/material";
import { format } from "date-fns";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Get status chip color
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

  return (
    <>
      <TableRow hover selected={isSelected}>
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            checked={isSelected}
            onClick={(event) => handleSelectRow(event, data._id)}
          />
        </TableCell>

        <TableCell padding="normal">
          <FlexBox alignItems="center" gap={1.5}>
            {data?.employeeId?.name ? (
              <>
                <Avatar 
                  src={data?.employeeId?.avatar} 
                  alt={data?.employeeId?.name} 
                  sx={{ width: 30, height: 30 }}
                />
                <div>
                  <Paragraph fontWeight={500} color="text.primary">
                    {data?.employeeId?.name}
                  </Paragraph>
                  <Small color="text.secondary">
                    {data?.employeeId?.user_defined_code || "-"}
                  </Small>
                </div>
              </>
            ) : (
              "-"
            )}
          </FlexBox>
        </TableCell>

        <TableCell>{data?.deductionType || "-"}</TableCell>

        <TableCell>{data?.amount ? `$${data.amount.toFixed(2)}` : "-"}</TableCell>

        <TableCell>{formatDate(data?.deductionDate)}</TableCell>

        <TableCell>
          <Chip 
            label={data?.status || "Pending"} 
            size="small" 
            color={getStatusColor(data?.status)}
            variant="outlined"
          />
        </TableCell>

        <TableCell>
          <Chip 
            label={data?.processed ? "Processed" : "Not Processed"} 
            size="small" 
            color={data?.processed ? "success" : "default"}
            variant="outlined"
          />
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
                navigate(`/arrears-update/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={Visibility}
              title="View"
              handleClick={() => {
                handleCloseOpenMenu();
                navigate(`/arrears-view/${data._id}`);
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
          </TableMoreMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
