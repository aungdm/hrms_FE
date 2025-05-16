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
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";

export default function TableRowView(props) {
  const { data, isSelected, handleSelectRow, handleDelete } = props;
  // console.log(data, "table row data");
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuEl(event.currentTarget);
  };
  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  return (
    <>
      <TableRow hover>
        {/* <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            checked={isSelected}
            onClick={(event) => handleSelectRow(event, data.id)}
          />
        </TableCell> */}

        <TableCell padding="normal">{data?.employment?.name || "-"}</TableCell>

        <TableCell padding="normal">
          {data?.effectiveDate?.slice(0, 10) || "-"}
        </TableCell>

        <TableCell padding="normal">{data?.previousSalary || "-"}</TableCell>
        <TableCell padding="normal">{data?.salary || "-"}</TableCell>

        <TableCell padding="normal">
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
                navigate(`/salary-revisions-view/${data._id}`);
              }}
            />
            <TableMoreMenuItem
              Icon={DeleteOutline}
              title="Undo"
              handleClick={() => {
                handleCloseOpenMenu();
                handleDelete(
                  data._id,
                  data?.employment?._id,
                  data?.previousSalary
                );
              }}
            />
          </TableMoreMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
