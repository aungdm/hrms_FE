import React from "react";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { Span } from "@/components/typography";
import { isDark } from "@/utils/constants";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";

const carHeadCells = [
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
    label: "Number Plate",
  },
  {
    id: "maker",
    numeric: true,
    disablePadding: false,
    label: "Maker",
  },
  {
    id: "modal",
    numeric: true,
    disablePadding: false,
    label: "Modal",
  },
  {
    id: "year",
    numeric: true,
    disablePadding: false,
    label: "Year",
  },
];

const BookingheadCells = [
  {
    id: "booking_id",
    numeric: true,
    disablePadding: false,
    label: "Booking id",
  },
  {
    id: "car",
    numeric: false,
    disablePadding: false,
    label: "Car",
  },
  {
    id: "workshop",
    numeric: true,
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


const UserProfileTableHead = (props) => {
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
    <TableHead
      sx={{
        backgroundColor: (theme) => (isDark(theme) ? "grey.700" : "grey.100"),
      }}
    >
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            color="primary"
            onChange={onSelectAllRows}
            checked={rowCount > 0 && numSelected === rowCount}
            indeterminate={numSelected > 0 && numSelected < rowCount}
          />
        </TableCell>

        {carHeadCells.map((headCell) => (
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
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default UserProfileTableHead;
