import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const CustomAutocomplete = ({
  name,
  label,
  options,
  value,
  onChange,
  errors,
  touched,
  sx = {},
}) => {
  return (
    <Autocomplete
      fullWidth
      disablePortal
      options={options}
      getOptionLabel={(option) => option.label}
      value={options.find((opt) => opt.value === value) || null}
      onChange={(event, newValue) => {
        onChange({
          target: {
            name,
            value: newValue?.value || "",
          },
        });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          sx={{
            "& .MuiInputBase-root": { height: "45px" },
            ...sx, // Allow custom styling from props
          }}
          name={name}
          label={label}
          helperText={touched?.[name] && errors?.[name]}
          error={Boolean(touched?.[name] && errors?.[name])}
        />
      )}
    />
  );
};

export default CustomAutocomplete;
