import PropTypes from "prop-types";

// Material UI
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";

const headCells = [
  {
    id: "employeeId",
    align: "left",
    disablePadding: false,
    label: "Employee",
  },
  {
    id: "date",
    align: "left",
    disablePadding: false,
    label: "Date",
  },
  {
    id: "punchType",
    align: "left",
    disablePadding: false,
    label: "Punch Type",
  },
  {
    id: "time",
    align: "left",
    disablePadding: false,
    label: "Time",
  },
  {
    id: "status",
    align: "left",
    disablePadding: false,
    label: "Status",
  },
  {
    id: "createdAt",
    align: "left",
    disablePadding: false,
    label: "Created At",
  },
  {
    id: "actions",
    align: "center",
    disablePadding: false,
    label: "Actions",
  },
];

const TableHeadView = (props) => {
  const {
    onSelectAllRows,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllRows}
            inputProps={{ "aria-label": "select all punch requests" }}
          />
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id !== "actions" ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

TableHeadView.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllRows: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default TableHeadView;
