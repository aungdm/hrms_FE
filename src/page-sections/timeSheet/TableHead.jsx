import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { Span } from "@/components/typography";
import { isDark } from "@/utils/constants";

const headCells = [
  {
    id: "actions",
    numeric: true,
    disablePadding: false,
    label: "Actions",
  },
  {
    id: "date",
    numeric: true,
    disablePadding: false,
    label: "Date",
  },
  {
    id: "employee",
    numeric: true,
    disablePadding: false,
    label: "Employee",
  },
  {
    id: "time_slote",
    numeric: true,
    disablePadding: false,
    label: "Time Slot",
  },
  {
    id: "checked_in",
    numeric: false,
    disablePadding: false,
    label: "Checked In",
  },

  {
    id: "checkdin_status",
    numeric: true,
    disablePadding: false,
    label: "Checkin Status",
  },
  {
    id: "checked_out",
    numeric: true,
    disablePadding: false,
    label: "Checked Out",
  },
  {
    id: "checkout_status",
    numeric: true,
    disablePadding: false,
    label: "Checkout Status",
  },
  {
    id: "expected_hours",
    numeric: true,
    disablePadding: false,
    label: "Expected Hours",
  },
  {
    id: "worked_hours",
    numeric: true,
    disablePadding: false,
    label: "Worked Hours",
  },
  {
    id: "overtime",
    numeric: true,
    disablePadding: false,
    label: "Overtime",
  },
  // {
  //   id: "approved_overtime",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Approved Overtime",
  // },
  // {
  //   id: "break_hours",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Break Hours",
  // },
  // {
  //   id: "shift_worked_hours",
  //   numeric: true,
  //   disablePadding: false,
  //   label: "Shift Worked Hours",
  // },

];
export default function TableHeadView(props) {
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
    <>
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

          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                color: "text.primary",
                fontWeight: 600,
                whiteSpace: "nowrap",
                minWidth: "120px",
                padding: "16px 8px",
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
          ))}
        </TableRow>
      </TableHead>
    </>
  );
}
