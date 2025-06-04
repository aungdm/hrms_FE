import { Fragment } from "react";
import { Box } from "@mui/material";
import OvertimeList from "@/page-sections/relaxationRequest/page-view/list";

export default function OvertimePage() {
  return (
    <Fragment>
      <Box pt={2} pb={4}>
        <OvertimeList />
      </Box>
    </Fragment>
  );
}
