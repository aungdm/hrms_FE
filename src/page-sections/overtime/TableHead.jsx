import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { Span } from "@/components/typography";
import { isDark } from "@/utils/constants";
import { Paragraph } from "@/components/typography";

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Schedule Name",
  },
  {
    id: "workDays",
    numeric: false,
    disablePadding: false,
    label: "Work Days",
  },
  {
    id: "shiftTime",
    numeric: false,
    disablePadding: false,
    label: "Shift Time",
  },
  {
    id: "graceTime",
    numeric: true,
    disablePadding: false,
    label: "Grace Time",
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "Status",
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
    <TableHead>
      <TableRow>
        <TableCell padding="normal">Actions</TableCell>
        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "date"}
            onClick={() => onRequestSort("date")}
            direction={order === "asc" ? "asc" : "desc"}
          >
            <Paragraph fontWeight={600}>Date</Paragraph>
          </TableSortLabel>
        </TableCell>

        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "employeeId.name"}
            onClick={() => onRequestSort("employeeId.name")}
            direction={order === "asc" ? "asc" : "desc"}
          >
            <Paragraph fontWeight={600}>Employee</Paragraph>
          </TableSortLabel>
        </TableCell>

        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Check-in</Paragraph>
        </TableCell>

        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Check-out</Paragraph>
        </TableCell>

        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Status</Paragraph>
        </TableCell>

        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Expected Hours</Paragraph>
        </TableCell>

        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Worked Hours</Paragraph>
        </TableCell>

        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Overtime</Paragraph>
        </TableCell>

        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "approvedOverTime"}
            onClick={() => onRequestSort("approvedOverTime")}
            direction={order === "asc" ? "asc" : "desc"}
          >
            <Paragraph fontWeight={600}>Approval Status</Paragraph>
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
