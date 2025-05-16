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
    id: "employee",
    numeric: true,
    disablePadding: false,
    label: "Employee",
  },
  {
    id: "payment_method",
    numeric: true,
    disablePadding: false,
    label: "Payment Method",
  },
  {
    id: "standard_salary",
    numeric: false,
    disablePadding: false,
    label: "Standard Salary",
  },

  {
    id: "monthly_basic_salary",
    numeric: true,
    disablePadding: false,
    label: "Monthly Basic Salary",
  },
  {
    id: "commision",
    numeric: true,
    disablePadding: false,
    label: "Commision",
  },
  {
    id: "other_incentives",
    numeric: true,
    disablePadding: false,
    label: "Other Incentives",
  },
  {
    id: "arrears",
    numeric: true,
    disablePadding: false,
    label: "Arrears",
  },
  {
    id: "leave_deduction",
    numeric: true,
    disablePadding: false,
    label: "Leave Deduction",
  },
  {
    id: "approved_overtime",
    numeric: true,
    disablePadding: false,
    label: "Approved Overtime",
  },
  {
    id: "other_deductions",
    numeric: true,
    disablePadding: false,
    label: "Other Deductions",
  },
  {
    id: "personal_loan",
    numeric: true,
    disablePadding: false,
    label: "Personal Loan",
  },
  {
    id: "advance_against_salary",
    numeric: true,
    disablePadding: false,
    label: "Advance Against Salary",
  },
  {
    id: "total_earnings",
    numeric: true,
    disablePadding: false,
    label: "Total Earnings",
  },
  {
    id: "total_deductions",
    numeric: true,
    disablePadding: false,
    label: "Total Deductions",
  },
  {
    id: "total_reimbursements",
    numeric: true,
    disablePadding: false,
    label: "Total Reimbursements",
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
