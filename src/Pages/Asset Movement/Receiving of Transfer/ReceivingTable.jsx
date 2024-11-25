import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useGetTransferReceiverApiQuery } from "../../../Redux/Query/Movement/Transfer";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import Moment from "moment";
import { useNavigate } from "react-router-dom";
import FaStatusChange from "../../../Components/Reusable/FaStatusComponent";

const ReceivingTable = ({ received }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const {
    data: receivingData,
    isLoading: receivingLoading,
    isSuccess: receivingSuccess,
    isError: receivingError,
    error: errorData,
    refetch,
  } = useGetTransferReceiverApiQuery(
    {
      page: page,
      per_page: perPage,
      status: received ? "Received" : "To Receive",
    },
    { refetchOnMountOrArgChange: true }
  );

  const handleTableData = (data) => {
    navigate(`/asset-movement/transfer-receiving/${data.vladimir_tag_number}`, {
      state: { ...data, status },
    });
  };

  return (
    <Stack sx={{ height: "calc(100vh - 250px)" }}>
      {receivingLoading && <MasterlistSkeleton onAdd={true} category />}
      {receivingError && <ErrorFetching refetch={refetch} error={errorData} />}
      {receivingData && !receivingError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

            <Box>
              <TableContainer className="mcontainer__th-body-category">
                <Table className="mcontainer__table" stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& > *": {
                          fontWeight: "bold!important",
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <TableCell className="tbl-cell">Request #</TableCell>
                      <TableCell className="tbl-cell">Vladimir Tag #</TableCell>
                      <TableCell className="tbl-cell">New Custodian</TableCell>
                      <TableCell className="tbl-cell">COA (New Custodian)</TableCell>
                      <TableCell className="tbl-cell">Asset Status</TableCell>
                      <TableCell className="tbl-cell">Date Requested</TableCell>
                      {/* <TableCell className="tbl-cell">Action</TableCell> */}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {receivingData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {receivingSuccess &&
                          [...receivingData?.data].map((data) => (
                            <TableRow
                              key={data.id}
                              hover
                              onClick={() => handleTableData(data)}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                                cursor: "pointer",
                              }}
                            >
                              {console.log("data: ", data)}
                              <TableCell className="tbl-cell">
                                <Chip
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    color: "white",
                                    font: "bold 12px Roboto",
                                    backgroundColor: "quaternary.light",
                                  }}
                                  label={data.id}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  {data?.vladimir_tag_number}
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  {data?.accountable}
                                </Typography>

                                <Typography fontSize={13} fontWeight={400} color="secondary.main">
                                  {data?.accountability}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={10} color="gray">
                                  ({data.company_code}) - {data.company}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.business_unit_code}) - ${data.business_unit}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.department_code}) - ${data?.department}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.unit_code}) - ${data?.unit}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.sub_unit_code}) - ${data?.sub_unit}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.location_code}) - {data?.location}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <FaStatusChange faStatus={data?.status} data={data?.status} />
                              </TableCell>
                              <TableCell className="tbl-cell">{Moment(data?.created_at).format("LL")}</TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </>
      )}
    </Stack>
  );
};

export default ReceivingTable;
