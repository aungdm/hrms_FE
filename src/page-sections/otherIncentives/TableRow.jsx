import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { Chip } from "@mui/material";
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
import { format } from "date-fns";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
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
      default:
        return "warning";
    }
  };

  return (
    <TableRow hover selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox
          size="small"
          color="primary"
          checked={isSelected}
          onClick={(event) => handleSelectRow(event, data._id)}
        />
      </TableCell>

      <TableCell>
        <FlexBox alignItems="center" gap={1.5}>
          <div>
            <Paragraph fontWeight={500} color="text.primary">
              {data?.employeeId?.name || "N/A"}
            </Paragraph>
            <Paragraph fontSize={13} color="text.secondary">
              {data?.employeeId?.user_defined_code || ""}
            </Paragraph>
          </div>
        </FlexBox>
      </TableCell>

      <TableCell>{data?.incentiveType || "N/A"}</TableCell>
      
      <TableCell>
        {data?.amount ? `$${data.amount.toFixed(2)}` : "N/A"}
      </TableCell>
      
      <TableCell>
        {data?.incentiveDate ? format(new Date(data.incentiveDate), "MMM dd, yyyy") : "N/A"}
      </TableCell>
      
      {/* <TableCell>
        <Chip 
          label={data?.status || "Pending"} 
          size="small" 
          color={getStatusColor(data?.status)}
        />
      </TableCell> */}
      
      <TableCell>
        <Chip 
          label={data?.processed ? "Paid" : "Unpaid"} 
          size="small" 
          color={data?.processed ? "success" : "default"}
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
              navigate(`/other-incentives-update/${data._id}`);
            }}
          />
          <TableMoreMenuItem
            Icon={Visibility}
            title="View"
            handleClick={() => {
              handleCloseOpenMenu();
              navigate(`/other-incentives-view/${data._id}`);
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
  );
}
