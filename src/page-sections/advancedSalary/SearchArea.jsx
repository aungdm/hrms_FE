import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function SearchArea({ value = "", onChange, processed, onProcessedChange }) {
  return (
    <Box mt={3} mb={3}>
      <FlexBetween gap={2} flexWrap="wrap">
        <TextField
          value={value}
          onChange={onChange}
          placeholder="Search advanced salaries..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.disabled" }} />
              </InputAdornment>
            )
          }}
          sx={{
            maxWidth: 400,
            width: "100%"
          }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="processed-filter-label">Processed Status</InputLabel>
          <Select
            labelId="processed-filter-label"
            id="processed-filter"
            value={processed}
            label="Processed Status"
            onChange={onProcessedChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Processed</MenuItem>
            <MenuItem value="false">Unprocessed</MenuItem>
          </Select>
        </FormControl>
      </FlexBetween>
    </Box>
  );
}
