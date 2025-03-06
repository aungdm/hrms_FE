import React from "react";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { Span } from "@/components/typography";
import { isDark } from "@/utils/constants";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";

const customerHeadCells = [
  {
    id: "car",
    numeric: true,
    disablePadding: false,
    label: "Car",
  },
  {
    id: "number_plate",
    numeric: false,
    disablePadding: false,
    label: "Number plate",
  },
  {
    id: "maker",
    numeric: true,
    disablePadding: false,
    label: "Maker",
  },
  {
    id: "model",
    numeric: true,
    disablePadding: false,
    label: "Model",
  },
  {
    id: "year",
    numeric: true,
    disablePadding: false,
    label: "Year",
  },
];

const bookingHeadCells = [
  {
    id: "bookingId",
    numeric: true,
    disablePadding: false,
    label: "Booking ID",
  },

  {
    id: "car",
    numeric: false,
    disablePadding: false,
    label: "Car",
  },
  {
    id: "workshop",
    numeric: false,
    disablePadding: false,
    label: "Workshop",
  },
  {
    id: "price",
    numeric: true,
    disablePadding: false,
    label: "Price",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
];

const CustomerProfileTableHead = (props) => {
  const {
    onSelectAllRows,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    role,
  } = props;

  console.log({ role }, "CustomerProfileTableHead");
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead
      sx={{
        backgroundColor: (theme) => (isDark(theme) ? "grey.700" : "grey.100"),
      }}
    >
      <TableRow>
        {/* <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            onChange={onSelectAllRows}
            checked={rowCount > 0 && numSelected === rowCount}
            indeterminate={numSelected > 0 && numSelected < rowCount}
          />
        </TableCell> */}

        {(role === "booking" ? bookingHeadCells : customerHeadCells).map(
          (headCell) => (
            <TableCell
              key={headCell.id}
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                onClick={createSortHandler(headCell.id)}
                direction={orderBy === headCell.id ? order : "asc"}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Span sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          )
        )}
      </TableRow>
    </TableHead>
  );
};

export default CustomerProfileTableHead;
