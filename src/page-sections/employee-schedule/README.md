# Employee Schedule Module

This module provides functionality for managing employee schedules in the HRMS system.

## Features

- View employee schedules in a calendar view
- Generate schedules for all employees
- Edit individual days in schedules (mark as day off, change times)
- Filter schedules by employee, month, and year

## Setup

1. Make sure the required dependencies are installed:
   ```
   npm install date-fns @mui/x-date-pickers
   ```

2. Ensure the backend API endpoints are properly configured in the `request.js` file.

3. The module uses MUI components and requires the `LocalizationProvider` to be set up in your main.jsx or App.jsx file:
   ```jsx
   import { LocalizationProvider } from '@mui/x-date-pickers';
   import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

   // In your render method:
   <LocalizationProvider dateAdapter={AdapterDateFns}>
     <App />
   </LocalizationProvider>
   ```

## Navigation

This module is accessible from the "Employee Schedule" link in the navigation menu under the "Attendance" section.

## Troubleshooting

If you encounter issues with the date/time pickers:
1. Make sure you have the latest version of @mui/x-date-pickers
2. Check that date-fns is properly installed
3. Verify that the LocalizationProvider is properly set up at the root level

For API-related issues, check the Network tab in your browser's developer tools to see the actual request/response data. 