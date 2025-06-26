import { visuallyHidden } from "@mui/utils";
import { Box, TableCell, TableHead, TableRow, TableSortLabel, Checkbox } from "@mui/material";

// ----------------------------------------------------------------------

export default function TableHeadView({
  order,
  orderBy,
  rowCount,
  numSelected,
  onRequestSort,
  onSelectAllRows,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCells = [
    {
      id: "employeeId",
      align: "left",
      disablePadding: false,
      label: "Employee",
    },
    {
      id: "requestedAmount",
      align: "left",
      disablePadding: false,
      label: "Requested Amount",
    },
    {
      id: "approvedAmount",
      align: "left",
      disablePadding: false,
      label: "Approved Amount",
    },
    {
      id: "totalInstallments",
      align: "left",
      disablePadding: false,
      label: "Total Installments",
    },
    {
      id: "leftInstallments",
      align: "left",
      disablePadding: false,
      label: "Left Installments",
    },
    {
      id: "leftAmount",
      align: "left",
      disablePadding: false,
      label: "Left Amount",
    },
    {
      id: "requiredDate",
      align: "left",
      disablePadding: false,
      label: "Required Date",
    },
    {
      id: "requestDate",
      align: "left",
      disablePadding: false,
      label: "Request Date",
    },
    {
      id: "status",
      align: "left",
      disablePadding: false,
      label: "Status",
    },
    {
      id: "processed",
      align: "left",
      disablePadding: false,
      label: "Processed",
    },
    {
      id: "action",
      align: "center",
      disablePadding: false,
      label: "Action",
    },
  ];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllRows}
          />
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
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
