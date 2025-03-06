import { Grid, Skeleton, Box } from "@mui/material";

const TableSkeleton = () => {
  return (
    <Box
      bgcolor="grey.200"
      height="100%"
      mt={5}
      p={3}
      pt={5}
      variant="rounded"
      style={{ borderRadius: "15px" }}
    >
      <Grid container spacing={3}>
        <Grid
          item
          md={12}
          xs={12}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton
            variant="rounded"
            width="10%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
          <Skeleton
            variant="rounded"
            width="20%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <Skeleton
            variant="rounded"
            width="50%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12} mt={3} style={{ padding: "10px 24px 0px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12}  style={{ padding: "10px 24px 0px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12} style={{ padding: "10px 24px 0px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12} style={{ padding: "10px 24px 0px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12} style={{ padding: "10px 24px 0px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12} style={{ padding: "10px 24px 0px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12} style={{ padding: "10px 24px 0px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>

        <Grid item md={12} xs={12} style={{ padding: "10px 24px 24px  24px" }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={50}
            style={{ borderRadius: "15px" }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableSkeleton;
