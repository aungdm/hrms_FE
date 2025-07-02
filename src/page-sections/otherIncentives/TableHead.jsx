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
    id: "select",
    numeric: false,
    disablePadding: true,
    label: "",
  },
  {
    id: "employeeId",
    numeric: false,
    disablePadding: false,
    label: "Employee",
  },
  {
    id: "incentiveType",
    numeric: false,
    disablePadding: false,
    label: "Incentive Type",
  },
  {
    id: "amount",
    numeric: true,
    disablePadding: false,
    label: "Amount",
  },
  {
    id: "incentiveDate",
    numeric: false,
    disablePadding: false,
    label: "Date",
  },
  // {
  //   id: "status",
  //   numeric: false,
  //   disablePadding: false,
  //   label: "Status",
  // },
  {
    id: "processed",
    numeric: false,
    disablePadding: false,
    label: "Payment Status",
  },
  { 
    id: "actions",
    numeric: false,
    disablePadding: false,
    label: "Actions",
  },
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

        {headCells.slice(1).map((headCell) => (
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
        ))}
      </TableRow>
    </TableHead>
  );
}
