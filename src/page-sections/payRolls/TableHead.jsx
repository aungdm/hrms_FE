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
    id: "code",
    numeric: true,
    disablePadding: false,
    label: "Code",
  },
  {
    id: "name",
    numeric: true,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "tax_structure",
    numeric: false,
    disablePadding: false,
    label: "Tax Structure",
  },

  {
    id: "month",
    numeric: true,
    disablePadding: false,
    label: "Month",
  },
  {
    id: "last_Running",
    numeric: true,
    disablePadding: false,
    label: "Last Running",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "last_Closing",
    numeric: true,
    disablePadding: false,
    label: "Last Closing",
  },
  {
    id: "actions",
    numeric: true,
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
