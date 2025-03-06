import { useDropzone } from "react-dropzone"; // CUSTOM COMPONENTS

import { H6, Paragraph } from "@/components/typography"; // CUSTOM ICON COMPONENT
import { Box, IconButton } from "@mui/material";
import UploadOnCloud from "@/icons/UploadOnCloud"; // STYLED COMPONENT
import CloseIcon from "@mui/icons-material/Close"; // Icon for the cross

import { RootStyle } from "./styles"; // =======================================================================

// =======================================================================
export default function DropZone({ onDrop, file, onRemove }) {
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
    },
    onDrop,
  });
  console.log({ file }, "dropzone file");
  return (
    <RootStyle
      {...getRootProps({
        className: "dropzone",
      })}
    >
      {file !== null ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxHeight: "250px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: { xs: "100%", sm: "80%", md: "60%" },
              maxHeight: "250px",
            }}
          >
            <Box
              component="img"
              src={file}
              alt="Responsive"
              sx={{
                width: { xs: "100%", sm: "80%", md: "60%" },
                maxHeight: "250px",
              }}
            />

            <IconButton
              sx={{
                position: "absolute",
                top: "0px",
                right: "0px",
                backgroundColor: "red",
                width: "1.2rem",
                height: "1.2rem",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
              }}
              onClick={onRemove}
            >
              <CloseIcon sx={{ fontSize: "12px" }} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <>
          <UploadOnCloud
            sx={{
              fontSize: 38,
              color: "text.secondary",
            }}
          />
          <Paragraph color="text.secondary">Drop your images here or</Paragraph>
          <H6 fontSize={16} color="primary.main">
            Select click to browse
          </H6>

          <input {...getInputProps()} placeholder="Select click to browse" />
        </>
      )}
    </RootStyle>
  );
}
