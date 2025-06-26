import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FlexBetween from "@/components/flexbox/FlexBetween";

export default function SearchArea(props) {
  const { value = "", onChange, createRoute = "/create-other-incentive" } = props;
  const navigate = useNavigate();

  return (
    <Box mt={3} mb={3}>
      <FlexBetween gap={2} flexWrap="wrap">
        <TextField
          value={value}
          onChange={onChange}
          placeholder="Search incentives..."
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
      </FlexBetween>
    </Box>
  );
}
