import { PlayArrowRounded } from "@mui/icons-material";
import { Box, InputAdornment, TextField as MuiTextField, Stack, Typography } from "@mui/material";
import { Controller } from "react-hook-form";

const CustomTextField = (props) => {
  const {
    name,
    control,
    onChange: onValueChange,
    onBlur,
    optional,
    errors,
    validateText,
    allowSpecialCharacters = false,

    ...textfield
  } = props;

  const validateInput = (value) => {
    const regex = allowSpecialCharacters
      ? /^[\w\s,.&-]*$/g // Allows letters, numbers, spaces, commas, periods, & and -
      : /^[a-zA-Z0-9-\s+&,.\d]*$/g; // Keeps the original validation
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { ref, value, onChange: setValue } = field;

        return (
          <>
            <MuiTextField
              {...textfield}
              autoComplete="off"
              inputRef={ref}
              value={value}
              size="small"
              color="secondary"
              onChange={(e) => {
                const inputValue = e.target.value;

                // Clean the input value
                const newValue = allowSpecialCharacters
                  ? inputValue // If special characters are allowed, no need to clean
                  : inputValue
                      .replace(/[^a-zA-Z0-9\s,.&-]/g, "") // Clean input for disallowed characters
                      .replace(/\s{2,}/g, " "); // Replace multiple spaces with a single space

                if (validateText && !validateInput(newValue)) {
                  console.warn("Invalid input");
                  return;
                }

                if (onValueChange) {
                  onValueChange(newValue);
                }

                setValue(newValue);
              }}
              onBlur={onBlur}
              sx={{
                overscrollBehavior: "contain",
                ".MuiInputBase-root": {
                  borderRadius: "10px",
                  minWidth: "180px",
                },

                ".MuiOutlinedInput-notchedOutline": {
                  bgcolor: optional ? null : "#f5c9861c",
                  // border: optional ? "1px dashed lightgray" : null,
                },

                ".MuiInputLabel-root.Mui-disabled": {
                  backgroundColor: "transparent",
                },

                ".Mui-disabled": {
                  backgroundColor: "background.light",
                  borderRadius: "10px",
                },
              }}
            />
            {/* {errors && <Typography sx={{ color: "blue" }}>{errors}</Typography>} */}
          </>
        );
      }}
    />
  );
};

export default CustomTextField;
