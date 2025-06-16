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
    id: "employeeId",
    numeric: false,
    disablePadding: false,
    label: "Employee ID",
  },
  {
    id: "employeeName",
    numeric: false,
    disablePadding: false,
    label: "Employee Name",
  },
  {
    id: "designation",
    numeric: false,
    disablePadding: false,
    label: "Designation",
  },
  {
    id: "payrollType",
    numeric: false,
    disablePadding: false,
    label: "Payroll Type",
  },
  {
    id: "payPeriod",
    numeric: false,
    disablePadding: false,
    label: "Pay Period",
  },
  {
    id: "grossSalary",
    numeric: true,
    disablePadding: false,
    label: "Gross Salary",
  },
  {
    id: "deductions",
    numeric: true,
    disablePadding: false,
    label: "Deductions",
  },
  {
    id: "otherDeductions",
    numeric: true,
    disablePadding: false,
    label: "Other Deductions",
  },
  {
    id: "overtime",
    numeric: true,
    disablePadding: false,
    label: "Overtime Pay",
  },
  {
    id: "netSalary",
    numeric: true,
    disablePadding: false,
    label: "Net Salary",
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
    payrollType
  } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  // Filter header cells based on payroll type
  const getFilteredHeadCells = () => {
    if (!payrollType || payrollType === 'all') return headCells;
    
    return headCells;
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

          {getFilteredHeadCells().map((headCell) => (
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
