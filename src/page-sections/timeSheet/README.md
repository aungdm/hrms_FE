# Timesheet Module Documentation

## Recent Enhancements

### Employee Selection Autocomplete (Latest Update)
- Replaced the basic dropdown select for employee filtering with an enhanced MUI Autocomplete component
- Added search functionality to allow users to quickly find employees by typing their name
- Implemented clear button functionality through the `clearOnEscape` property
- Added custom filtering logic to search employee names case-insensitively

### Advanced Filtering System
- **Date Range Filtering**: Filter records by a specific start and end date (default is current month)
- **Employee Filtering**: Select specific employees or view all records
- **Status Filtering**: Filter by various attendance statuses (Present, Absent, Half Day, Day Off, Weekend, Holiday, Leave)
- **Overtime Filtering**: Filter records based on overtime status
  - Additional dropdown for filtering by overtime status (Pending, Approved, Rejected) when "With Overtime" is selected

### Additional Features
- **Search Functionality**: Search through records
- **Reset Filters Button**: Clear all applied filters
- **Refresh Button**: Reload data with current filter settings
- **Filter Toggle**: Show/hide the filter section

## Usage

### Employee Autocomplete
The employee selection now supports typing to search:
1. Click on the "Employee" field
2. Start typing the employee name to see matching results
3. Select an employee from the dropdown
4. To clear the selection, press the Escape key or click the clear (X) button

### Filters
1. Click "Show Filters" to display the filtering options
2. Set your desired filter criteria
3. Click "Apply Filters" to update the displayed records
4. Use "Reset Filters" to clear all filter settings

## API Integration
The filter system integrates with the backend `getRecords` function, passing all filter parameters to retrieve the appropriate data. 