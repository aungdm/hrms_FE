import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";

// table heading row
export default function ErrorLogTableHead(props) {
  const {
    order,
    orderBy,
    onRequestSort,
    rowCount,
    numSelected,
    onSelectAllRows,
  } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCells = [
    {
      id: "deviceUserId",
      numeric: false,
      disablePadding: false,
      label: "Employee",
    },
    {
      id: "recordTime",
      numeric: false,
      disablePadding: false,
      label: "Record Time",
    },
    {
      id: "processingAttempts",
      numeric: true,
      disablePadding: false,
      label: "Processing Status",
    },
    {
      id: "processingError",
      numeric: false,
      disablePadding: false,
      label: "Error Message",
    },
    {
      id: "deviceId",
      numeric: false,
      disablePadding: false,
      label: "Device",
    },
    {
      id: "actions",
      numeric: false,
      disablePadding: false,
      label: "Actions",
    },
  ];

  return (
    <TableHead
      sx={{
        backgroundColor: (theme) => theme.palette.action.hover,
      }}
    >
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllRows}
          />
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.id === "actions" ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              disabled={headCell.id === "actions"}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
} 