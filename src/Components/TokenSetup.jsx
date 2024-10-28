import {
  AddCircle,
  ArrowBackIosNewRounded,
  CheckCircleOutline,
  Delete,
  Help,
  PrintDisabledRounded,
  ReportProblem,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  Divider,
  Grow,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import tokenSetupIcon from "../Img/PNG/tokenSetup.png";
import CustomTextField from "./Reusable/CustomTextField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useEffect, useState } from "react";
import {
  useGetTokenAllApiQuery,
  usePostTokenApiMutation,
  usePatchTokenStatusApiMutation,
  useUpdateTokenApiMutation,
} from "../Redux/Query/tokenSetup";
import NoRecordsFound from "../Layout/NoRecordsFound";
import CustomTablePagination from "./Reusable/CustomTablePagination";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ActionMenu from "./Reusable/ActionMenu";
import { closeConfirm, onLoading, openConfirm } from "../Redux/StateManagement/confirmSlice";
import { openToast } from "../Redux/StateManagement/toastSlice";
import MasterlistToolbar from "./Reusable/MasterlistToolbar";
import { closeDrawer } from "../Redux/StateManagement/booleanStateSlice";
import EditToken from "../Pages/Masterlist/AddEdit/EditToken";
import MasterlistSkeleton from "../Pages/Skeleton/MasterlistSkeleton";

const schema = yup.object().shape({
  id: yup.string(),
  p_name: yup.string().required("System Name is required.").label("System Name"),
  endpoint: yup.string().required("Base URL is required.").label("Base URL"),
  token: yup.string().required("Token is required.").label("Token"),
});

const TokenSetup = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [updateToken, setUpdateToken] = useState({
    status: false,
    id: null,
    token: "",
    endpoint: "",
    p_name: "",
  });

  // Table Sorting --------------------------------
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("is_active");

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const comparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const onSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  // -----------------------------------------------------

  // Table Properties --------------------------------

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };
  // -------------------------------------------------------

  const isSmallScreen = useMediaQuery("(max-width: 1375px)");
  const isSmallerScreen = useMediaQuery("(max-width: 600px)");

  const drawer = useSelector((state) => state.booleanState.drawer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCloseDialog = () => {
    handleGoBack();
  };

  //   const onSubmitHandler = (formData) => {
  //     postIpAddress(formData);
  //     onUpdateResetHandler();
  //   };

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setError,
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      p_name: "",
      endpoint: "",
      token: "",
    },
  });

  const searchHandler = (e) => {
    if (e.key === "Enter") {
      setSearch(e.target.value);
      setPage(1);
    }
  };

  const {
    data: tokenData,
    isLoading: tokenLoading,
    isSuccess: tokenSuccess,
    isError: tokenError,
    refetch,
  } = useGetTokenAllApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [
    postToken,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostTokenApiMutation();

  const [postTokenStatusApi, { isLoading, isError: error }] = usePatchTokenStatusApiMutation();

  const [
    updatedToken,
    { data: updateData, isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError },
  ] = useUpdateTokenApiMutation();

  const onUpdateResetHandler = () => {
    setUpdateToken({
      p_name: "",
      token: "",
      endpoint: "",
    });
  };

  const onSubmitHandler = async (formData) => {
    try {
      const res = await postToken(formData).unwrap();
      onUpdateResetHandler();
      reset();
    } catch (error) {
      console.log(error);
      dispatch(
        openToast({
          message: error.data.message,
          duration: 5000,
          variant: "error",
        })
      );
      dispatch(closeConfirm());
    }
  };

  useEffect(() => {
    if (isPostSuccess) {
      dispatch(
        openToast({
          message: postData.message,
          duration: 5000,
        })
      );
    }
  }, [isPostSuccess]);

  const onArchiveRestoreHandler = (id) => {
    dispatch(
      openConfirm({
        icon: status === "active" ? ReportProblem : Help,
        iconColor: status === "active" ? "alert" : "info",
        message: (
          <Box>
            <Typography> Are you sure you want to</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              {status === "active" ? "ARCHIVE" : "ACTIVATE"}
            </Typography>{" "}
            this data?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await postTokenStatusApi({
              id: id,
              status: status === "active" ? false : true,
            }).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          } catch (err) {
            console.log(err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err.data.errors?.detail,
                  duration: 5000,
                  variant: "error",
                })
              );
            } else if (err?.status !== 422) {
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
            }
          }
        },
      })
    );
  };

  const onUpdateHandler = (props) => {
    const { id, p_name, endpoint, token } = props;
    setUpdateToken({
      status: status,
      action: "updateToken",
      id: id,
      p_name: p_name,
      endpoint: endpoint,
      token: token,
    });
  };

  return (
    <>
      {isSmallScreen ? null : (
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            mt: "10px",
          }}
        >
          <Button
            variant="text"
            size="small"
            startIcon={<ArrowBackIosNewRounded sx={{ fontSize: "20px" }} />}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignSelf: "flex-start",
              left: 0,
              ml: "20px",
            }}
            color="secondary"
            onClick={handleCloseDialog}
          >
            Back
          </Button>
        </Stack>
      )}

      <Stack
        gap="10px"
        sx={
          isSmallScreen
            ? {
                alignItems: null,
                justifyContent: null,
                flexDirection: "column",
                padding: "0 20px",
              }
            : {
                alignItems: "flex-start",
                justifyContent: "center",
                flexDirection: "row",
                padding: "10px",
              }
        }
      >
        {/* Form */}

        <Stack
          component="form"
          width={isSmallScreen ? "100%" : "300px"}
          gap={3}
          sx={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "10px 10px 20px #bebebe,-10px -15px 40px #ffffff",
          }}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Stack alignItems="center" gap={isSmallerScreen ? 1 : 2} flexDirection={isSmallScreen ? "row" : "column"}>
            {isSmallScreen ? (
              <IconButton onClick={handleCloseDialog}>
                <ArrowBackIosNewRounded />
              </IconButton>
            ) : null}
            {isSmallerScreen ? null : (
              <img
                src={tokenSetupIcon}
                alt="icon"
                width={isSmallScreen ? "40px" : "60px"}
                // height={isSmallScreen ? "40px" : "80px"}
              />
            )}
            <Typography
              color="secondary.main"
              sx={{
                fontFamily: "Anton",
                fontSize: isSmallScreen ? "1.2rem" : "1.5rem",
                textAlign: isSmallScreen ? "left" : "center",
              }}
            >
              Token Configuration
            </Typography>
          </Stack>

          <Stack
            flexDirection={isSmallerScreen ? "column" : isSmallScreen ? "row" : "column"}
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <CustomTextField
              autoComplete="off"
              control={control}
              label="System Name"
              name="p_name"
              color="secondary"
              size={isSmallScreen ? "small" : null}
              validateText={false}
              error={!!errors?.p_name}
              helperText={errors?.p_name?.message}
              fullWidth
              onInput={null}
              sx={{
                ".MuiInputBase-root": {
                  background: "white",
                },
              }}
            />

            <CustomTextField
              control={control}
              name="endpoint"
              label="Endpoint"
              color="secondary"
              size={isSmallScreen ? "small" : null}
              error={!!errors?.endpoint}
              helperText={errors?.endpoint?.message}
              allowSpecialCharacters={true}
              fullWidth
            />

            <CustomTextField
              control={control}
              name="token"
              label="Token"
              color="secondary"
              size={isSmallScreen ? "small" : null}
              error={!!errors?.token}
              helperText={errors?.token?.message}
              allowSpecialCharacters={true}
              fullWidth
            />

            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<AddCircle />}
              sx={{
                width: isSmallerScreen ? "100%" : isSmallScreen ? "200px" : "100%",
                borderRadius: "10px",
              }}
              //   loading={isPostLoading}
              disabled={!isValid}
            >
              ADD
            </LoadingButton>
          </Stack>
        </Stack>

        {/* Table */}
        <Stack
          direction="column"
          gap="10px"
          width={isSmallScreen ? "100%" : "1200px"}
          sx={{
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "10px 10px 20px #bebebe,-10px -15px 40px #ffffff",
            padding: "20px",
            // flex: 1,
          }}
        >
          {tokenLoading && <MasterlistSkeleton onExport={false} />}
          {tokenData && !tokenError && (
            <Box className="mcontainer__wrapper">
              <MasterlistToolbar path="#" onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} />

              <TableContainer
                sx={{
                  height: isSmallScreen ? "calc(100vh - 450px)" : "calc(100vh - 400px)",
                  overflow: "auto",
                  px: "10px",
                }}
              >
                <Table className="mcontainer__table" stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& > *": {
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          padding: "5px 10px",
                        },
                      }}
                    >
                      <TableCell className="tbl-cell text-center">
                        <TableSortLabel
                          active={orderBy === `id`}
                          direction={orderBy === `id` ? order : `asc`}
                          onClick={() => onSort(`id`)}
                        >
                          ID No.
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell text-center">
                        <TableSortLabel
                          active={orderBy === `id`}
                          direction={orderBy === `id` ? order : `asc`}
                          onClick={() => onSort(`id`)}
                        >
                          System Name
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell text-center">
                        <TableSortLabel
                          active={orderBy === `id`}
                          direction={orderBy === `id` ? order : `asc`}
                          onClick={() => onSort(`id`)}
                        >
                          Endpoint
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell text-center">
                        <TableSortLabel
                          active={orderBy === `id`}
                          direction={orderBy === `id` ? order : `asc`}
                          onClick={() => onSort(`id`)}
                        >
                          Token
                        </TableSortLabel>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>Status</TableCell>

                      <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody sx={{ overflow: "overlay" }}>
                    {tokenData?.data.length === 0 ? (
                      <NoRecordsFound />
                    ) : (
                      <>
                        {tokenSuccess &&
                          [...tokenData.data].sort(comparator(order, orderBy))?.map((data) => (
                            <TableRow
                              key={data.id}
                              hover={true}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                                "& > *": {
                                  padding: "10px",
                                },
                              }}
                            >
                              <TableCell sx={{ textAlign: "center", pr: "45px" }}>{data.id}</TableCell>

                              <TableCell className="tbl-cell">
                                <Typography fontWeight={600} color="secondary.main">
                                  {data.p_name}
                                </Typography>
                              </TableCell>

                              <TableCell className="tbl-cell">
                                <Typography color="secondary.main">{data.endpoint}</Typography>
                              </TableCell>

                              <TableCell className="tbl-cell">
                                <Tooltip title={data.token} arrow>
                                  <Typography
                                    color="secondary.main"
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "-webkit-box",
                                      WebkitLineClamp: "2",
                                      WebkitBoxOrient: "vertical",
                                      width: 100,
                                    }}
                                  >
                                    {data.token}
                                  </Typography>
                                </Tooltip>
                              </TableCell>

                              <TableCell sx={{ textAlign: "center" }}>
                                {data.is_active ? (
                                  <Chip
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      background: "#27ff811f",
                                      color: "active.dark",
                                      fontSize: "0.7rem",
                                      px: 1,
                                    }}
                                    label="ACTIVE"
                                  />
                                ) : (
                                  <Chip
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      background: "#fc3e3e34",
                                      color: "error.light",
                                      fontSize: "0.7rem",
                                      px: 1,
                                    }}
                                    label="INACTIVE"
                                  />
                                )}
                              </TableCell>

                              <TableCell
                                sx={{
                                  whiteSpace: "nowrap",
                                  textAlign: "center",
                                }}
                              >
                                <ActionMenu
                                  status={status}
                                  data={data}
                                  onArchiveRestoreHandler={onArchiveRestoreHandler}
                                  onUpdateHandler={onUpdateHandler}
                                  // onResetHandler={onResetHandler}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <CustomTablePagination
                total={tokenData?.total}
                success={tokenSuccess}
                current_page={tokenData?.current_page}
                per_page={tokenData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          )}
        </Stack>
      </Stack>
      <Dialog open={drawer} TransitionComponent={Grow} PaperProps={{ sx: { borderRadius: "10px" } }}>
        <EditToken data={updateToken} />
      </Dialog>
    </>
  );
};

export default TokenSetup;
