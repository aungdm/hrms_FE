import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";
import visuallyHidden from "@mui/utils/visuallyHidden";
import { Span } from "@/components/typography";
import { isDark } from "@/utils/constants";
import { Paragraph } from "@/components/typography";

// const headCells = [
//   {
//     id: "name",
//     numeric: false,
//     disablePadding: false,
//     label: "Schedule Name",
//   },
//   {
//     id: "workDays",
//     numeric: false,
//     disablePadding: false,
//     label: "Work Days",
//   },
//   {
//     id: "shiftTime",
//     numeric: false,
//     disablePadding: false,
//     label: "Shift Time",
//   },
//   {
//     id: "graceTime",
//     numeric: true,
//     disablePadding: false,
//     label: "Grace Time",
//   },
//   {
//     id: "status",
//     numeric: false,
//     disablePadding: false,
//     label: "Status",
//   },
//   {
//     id: "actions",
//     numeric: false,
//     disablePadding: false,
//     label: "Actions",
//   },
// ];

export default function TableHeadView(props) {
  const {
    // onSelectAllRows,
    order,
    orderBy,
    // numSelected,
    // rowCount,
    onRequestSort,
  } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {/* Actions column (non-sortable) */}
        <TableCell padding="normal"><Paragraph fontWeight={600}>Actions</Paragraph></TableCell>

        {/* Date column (sortable) */}
        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "date"}
            direction={order}
            onClick={createSortHandler("date")}
          >
            <Paragraph fontWeight={600}>Date</Paragraph>
          </TableSortLabel>
        </TableCell>

        {/* Employee column (sortable) */}
        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "employeeId.name"}
            direction={order}
            onClick={createSortHandler("employeeId.name")}
          >
            <Paragraph fontWeight={600}>Employee</Paragraph>
          </TableSortLabel>
        </TableCell>

        {/* Expected Check-in (non-sortable) */}
        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Exp. Check-in</Paragraph>
        </TableCell>

        {/* Expected Check-out (non-sortable) */}
        <TableCell padding="normal">
          <Paragraph fontWeight={600}>Exp. Check-out</Paragraph>
        </TableCell>

        {/* Late Arrival (sortable) */}
        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "lateArrival"}
            direction={order}
            onClick={createSortHandler("lateArrival")}
          >
            <Paragraph fontWeight={600}>Late Arrival (min)</Paragraph>
          </TableSortLabel>
        </TableCell>

        {/* Early Departure (sortable) */}
        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "earlyDeparture"}
            direction={order}
            onClick={createSortHandler("earlyDeparture")}
          >
            <Paragraph fontWeight={600}>Early Departure (min)</Paragraph>
          </TableSortLabel>
        </TableCell>

        {/* Work Duration (sortable) */}
         <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "workDuration"}
            direction={order}
            onClick={createSortHandler("workDuration")}
          >
            <Paragraph fontWeight={600}>Worked (min)</Paragraph>
          </TableSortLabel>
        </TableCell>

        {/* Status (sortable) */}
        <TableCell padding="normal">
           <TableSortLabel
            active={orderBy === "status"}
            direction={order}
            onClick={createSortHandler("status")}
          >
             <Paragraph fontWeight={600}>Status</Paragraph>
           </TableSortLabel>
        </TableCell>

        {/* Relaxation Request Status (sortable) */}
        <TableCell padding="normal">
          <TableSortLabel
            active={orderBy === "relaxationRequestStatus"}
            direction={order}
            onClick={createSortHandler("relaxationRequestStatus")}
          >
            <Paragraph fontWeight={600}>Request Status</Paragraph>
          </TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );
}
