import { Grid, Skeleton, Box } from "@mui/material";

const BookingDetailSkeleton = () => {
  return (
    <Box
      bgcolor="grey.200"
      width="100%"
      height="750px"
      p={3}
      mt={6}
      style={{ borderRadius: "20px", height: "100%" }}
    >
      <Grid container spacing={3}>
        <Grid item md={4} xs={12}>
          <Box
            bgcolor="grey.300"
            p={2}
            width="100%"
            height="330px"
            style={{ borderRadius: "20px" }}
          >
            <Grid
              md={12}
              xs={12}
              style={{ display: "flex", justifyContent: "center" }}
            >
              {/* <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{
                  borderRadius: 20,
                }}
              /> */}
            </Grid>
          </Box>
        </Grid>

        <Grid item md={8} xs={12}>
          <Grid container spacing={3}>
            <Grid item md={12} xs={12}>
              <Box
                bgcolor="grey.300"
                p={2}
                width="100%"
                height="330px"
                style={{ borderRadius: "20px" }}
              >
                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>

                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>
                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>
                <Grid pt={2}>
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={10}
                    sx={{
                      borderRadius: 5,
                    }}
                  />
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item md={12} xs={12} mt={4}>
        <Grid container spacing={3}>
          <Grid item md={12} xs={12}>
            <Box
              bgcolor="grey.300"
              p={2}
              width="100%"
              height="330px"
              style={{ borderRadius: "20px" }}
            >
              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>
              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>
              <Grid pt={2}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={10}
                  sx={{
                    borderRadius: 5,
                  }}
                />
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingDetailSkeleton;
