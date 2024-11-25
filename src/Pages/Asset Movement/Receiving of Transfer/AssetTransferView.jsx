import { ArrowBackIosRounded, ExpandMore, Help, MoveDownOutlined, Warning } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  useGetSingleTransferReceiverApiQuery,
  usePatchTransferReceivingApiMutation,
} from "../../../Redux/Query/Movement/Transfer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useDispatch } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import FaStatusChange from "../../../Components/Reusable/FaStatusComponent";

const AssetTransferView = () => {
  const { state: data } = useLocation();
  console.log("data: ", data);
  const { movement_id } = useParams();
  console.log("movement_id: ", movement_id);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isSmallScreen = useMediaQuery("(max-width: 350px)");

  const {
    data: dataApi,
    isLoading: dataApiLoading,
    isSuccess: dataApiSuccess,
    isFetching: dataApiFetching,
    isError: dataApiError,
    refetch: dataApiRefetch,
  } = useGetSingleTransferReceiverApiQuery(
    { movement_id: data?.id },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  console.log("dataApi: ", dataApi);

  const [receiveTransferApi, { isLoading: isPatchLoading }] = usePatchTransferReceivingApiMutation();

  const onBackHandler = () => {
    dataApi?.is_additional_cost === 0 ? navigate("/asset-movement/transfer-receiving") : navigate(-1);
  };

  const handleReceiving = (id) => {
    dispatch(
      openConfirm({
        icon: Warning,
        iconColor: "warning",
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
              RECEIVE
            </Typography>{" "}
            this request?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await receiveTransferApi({ transfer_ids: [id] }).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
          } catch (err) {
            console.log("err", err);
            if (err?.status === 404) {
            } else if (err?.status === 422) {
              dispatch(
                openToast({
                  // message: err.data.message,
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

  return (
    <>
      <Box className="mcontainer">
        <Box className="tableCard">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <IconButton sx={{ mt: "5px" }} size="small" onClick={onBackHandler}>
                <ArrowBackIosRounded size="small" />
              </IconButton>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Anton",
                    fontSize: "1.4rem",
                    pl: "10px",
                    pb: "5px",
                    lineHeight: "1",
                  }}
                  color="primary.main"
                >
                  VLADIMIR TAG NUMBER
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    mt: "-5px",
                    pb: "5px",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Anton",
                      fontSize: "1.2rem",
                      p: "0 10px",
                      pr: "15px",
                    }}
                    color="secondary.main"
                  >
                    #{dataApi?.vladimir_tag_number}
                  </Typography>
                  {/* <FaStatusChange faStatus={dataApi?.status} data={dataApi?.status} /> */}
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                pl: "10px",
                pb: "10px",
                display: "flex",
                justifyContent: "center",
                alignSelf: "flex-end",
                gap: 1,
                overflow: "auto",
              }}
            >
              {console.log("dataApireceived", dataApi?.is_received)}
              {dataApi?.received_at === "-" ? (
                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  onClick={() => handleReceiving(data?.id)}
                  startIcon={isSmallScreen ? null : <MoveDownOutlined color={"primary"} />}
                >
                  {isSmallScreen ? <MoveDownOutlined color={"primary"} /> : "Receive"}
                </Button>
              ) : null}
            </Box>
          </Box>

          <Box className="tableCard__container">
            <Stack alignItems="center">
              {dataApi?.is_additional_cost === 1 && (
                <Chip
                  variant="contained"
                  size="small"
                  sx={{
                    fontFamily: "Anton",
                    fontSize: "1rem",
                    color: "secondary.main",
                    mb: "5px",
                    backgroundColor: "primary.light",
                    width: "90%",
                    height: "25px",
                  }}
                  label="ADDITIONAL COST"
                />
              )}
              <Card className="tableCard__cardCapex" sx={{ bgcolor: "secondary.main" }}>
                <Typography
                  color="secondary.main"
                  sx={{
                    fontFamily: "Anton",
                    fontSize: "1rem",
                    color: "primary.main",
                  }}
                >
                  Type of Request
                </Typography>

                <Box sx={{ py: "5px" }}>
                  <Box className="tableCard__propertiesCapex">
                    Type of Request:
                    <Typography className="tableCard__infoCapex" fontSize="14px">
                      {dataApi?.type_of_request?.type_of_request_name}
                    </Typography>
                  </Box>

                  {dataApi?.sub_capex?.sub_capex !== "-" && (
                    <>
                      <Box className="tableCard__propertiesCapex">
                        Capex:
                        <Typography className="tableCard__infoCapex" fontSize="14px">
                          {dataApi?.sub_capex?.sub_capex}
                        </Typography>
                      </Box>

                      <Box className="tableCard__propertiesCapex">
                        Project Name:
                        <Typography className="tableCard__infoCapex" fontSize="14px">
                          {dataApi?.sub_capex?.sub_project}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Card>

              <Card className="tableCard__cardCapex" sx={{ bgcolor: "white", py: "10.5px" }}>
                <Box>
                  <Typography
                    color="secondary.main"
                    sx={{
                      fontFamily: "Anton",
                      fontSize: "1rem",
                    }}
                  >
                    TAG NUMBER
                  </Typography>
                  <Box className="tableCard__properties">
                    Tag Number:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.tag_number}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Old Tag Number:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.tag_number_old}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              <Card className="tableCard__cardCapex" sx={{ bgcolor: "white", py: "10.5px" }}>
                <Box color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                  CATEGORY
                </Box>
                <Box>
                  <Box className="tableCard__properties">
                    Division:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.division.division_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Major Category:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.major_category.major_category_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Minor Category:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.minor_category.minor_category_name}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Stack>

            <Box className="tableCard__wrapper" sx={{ pb: "2px" }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                    CHART OF ACCOUNT
                  </Typography>
                </AccordionSummary>

                <Divider />

                <AccordionDetails>
                  <Box className="tableCard__properties">
                    Company:
                    <Typography className="tableCard__info" fontSize="14px">
                      {`${dataApi?.company.company_code} - ${dataApi?.company.company_name}`}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Business Unit:
                    <Typography className="tableCard__info" fontSize="14px">
                      {`${dataApi?.business_unit.business_unit_code} - ${dataApi?.business_unit.business_unit_name}`}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Department:
                    <Typography className="tableCard__info" fontSize="14px">
                      {`${dataApi?.department.department_code} - ${dataApi?.department.department_name}`}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Unit:
                    <Typography className="tableCard__info" fontSize="14px">
                      {`${dataApi?.unit.unit_code} - ${dataApi?.unit.unit_name}`}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Location:
                    <Typography className="tableCard__info" fontSize="14px">
                      {`${dataApi?.location.location_code} - ${dataApi?.location.location_name}`}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Account Title:
                    <Typography className="tableCard__info" fontSize="14px">
                      {`${dataApi?.account_title.account_title_code} - ${dataApi?.account_title.account_title_name}`}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "secondary.main" }} />}
                  sx={{ bgcolor: "white" }}
                >
                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                    ASSET INFORMATION
                  </Typography>
                </AccordionSummary>

                <Divider />

                <AccordionDetails className="tableCard__border">
                  <Box className="tableCard__properties">
                    Asset Description:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.asset_description}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Asset Specification:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.asset_specification}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Accountability:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.accountability}
                    </Typography>
                  </Box>

                  {dataApi?.accountability === "Common" ? null : (
                    <>
                      <Box className="tableCard__properties">
                        Accountable:
                        <Typography className="tableCard__info" fontSize="14px">
                          {dataApi?.accountable}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Box className="tableCard__properties">
                    Acquisition Date:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.acquisition_date}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Cellphone Number:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.cellphone_number}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Brand:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.brand}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Care of:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.care_of}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Voucher:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.voucher}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Voucher Date:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.voucher_date}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Receipt:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.receipt}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Quantity:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.quantity}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    UOM:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.unit_of_measure?.uom_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Asset Status:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.asset_status?.asset_status_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Asset Movement Status:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.movement_status?.movement_status_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Cycle Count Status:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.cycle_count_status?.cycle_count_status_name}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                    DEPRECIATION
                  </Typography>
                </AccordionSummary>

                <Divider />

                <AccordionDetails>
                  <Box className="tableCard__properties">
                    Depreciation Status:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.depreciation_status?.depreciation_status_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Acquisition Cost:
                    <Typography className="tableCard__info" fontSize="14px">
                      ₱{dataApi?.acquisition_cost === (0 || null) ? 0 : dataApi?.acquisition_cost.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Release Date:
                    <Typography className="tableCard__info" fontSize="14px">
                      {dataApi?.release_date}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Scrap Value:
                    <Typography className="tableCard__info" fontSize="14px">
                      ₱{dataApi?.scrap_value === (0 || null) ? 0 : dataApi?.scrap_value.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Depreciable Basis:
                    <Typography className="tableCard__info" fontSize="14px">
                      ₱{dataApi?.depreciable_basis === (0 || null) ? 0 : dataApi?.depreciable_basis.toLocaleString()}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion> */}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AssetTransferView;
