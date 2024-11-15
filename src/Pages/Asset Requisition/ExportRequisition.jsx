import { Box, Button, Typography } from "@mui/material";
import CustomDatePicker from "../../Components/Reusable/CustomDatePicker";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoadingButton } from "@mui/lab";
import { IosShareRounded } from "@mui/icons-material";
import { closeExport } from "../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useLazyGetRequestExportApiQuery } from "../../Redux/Query/Request/Requisition";
import useExcel from "../../Hooks/Xlsx";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import moment from "moment";
import useExcelJs from "../../Hooks/ExcelJs";

const schema = yup.object().shape({
  id: yup.string(),
  from: yup.string().required().typeError("Please provide a FROM date"),
  to: yup.string().required().typeError("Please provide a TO date"),
});
const ExportRequisition = () => {
  // const { excelExport } = useExcel();
  const { excelExport } = useExcelJs();

  const [
    trigger,
    {
      data: exportApi,
      isLoading: exportApiLoading,
      isSuccess: exportApiSuccess,
      isFetching: exportApiFetching,
      isError: exportApiError,
      error: exportError,
      refetch: exportApiRefetch,
    },
  ] = useLazyGetRequestExportApiQuery();

  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeExport());
  };

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      from: null,
      to: null,
      export: null,
    },
  });

  const handleExport = async (formData) => {
    try {
      const res = await trigger({
        from: moment(formData?.from).format("YYYY-MM-DD"),
        to: moment(formData?.to).format("YYYY-MM-DD"),
        export: 0,
      }).unwrap();

      const newObj = res.flatMap((item) => {
        return {
          Aging: item?.aging === 0 || item?.aging === 1 ? item?.aging + " " + "day" : item?.aging + " " + "days",
          "Ymir PR Number": item?.ymir_pr_number === null ? "-" : item.ymir_pr_number,
          "Transaction Number": item?.transaction_number,
          "Acquisition Details": item?.acquisition_details,
          "PR Number": item?.pr_number === null ? "-" : item.ymir_pr_number,
          Remaining: item?.remaining,
          Status: item?.status,
          "Item Status": item?.item_status,
          Quantity: item?.quantity,
          Delivered: item?.delivered,
          Cancelled: item?.cancelled,
          "Company Code": item?.company_code,
          Company: item?.company_name,
          "Business Unit Code": item?.business_unit_code,
          "Business Unit": item?.business_unit_name,
          "Department Code": item?.department_code,
          Department: item?.department_name,
          "Unit Code": item?.unit_code,
          Unit: item?.unit_name,
          "Subunit Code": item?.sub_unit_code,
          Subunit: item?.sub_unit_name,
          "Location Code": item?.location_code,
          Location: item?.location_name,
          "Date Created": moment(item?.created_at).format("YYYY-MM-DD"),
        };
      });

      await excelExport(newObj, "Vladimir-User-Request-.xlsx");
      dispatch(
        openToast({
          message: "Successfully Exported",
          duration: 5000,
          variant: "success",
        })
      );
      dispatch(closeExport());
      console.log("exportData", newObj);
    } catch (err) {
      console.log("err", err);

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
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(handleExport)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Typography variant="h6" color="secondary" sx={{ fontFamily: "Anton" }}>
          Export Requisition
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <CustomDatePicker
            control={control}
            name="from"
            label="From"
            size="small"
            maxDate={new Date()}
            error={!!errors?.from}
            helperText={errors?.from?.message}
          />

          <CustomDatePicker
            control={control}
            name="to"
            label="To"
            size="small"
            disabled={!watch("from")}
            minDate={watch("from")}
            maxDate={new Date()}
            error={!!errors?.to}
            helperText={errors?.to?.message}
          />
        </Box>

        <Box sx={{ display: "flex", gap: "10px" }}>
          <LoadingButton
            variant="contained"
            loading={exportApiLoading}
            startIcon={exportApiLoading ? null : <IosShareRounded color={!isValid ? "gray" : "primary"} size="small" />}
            type="submit"
            color="secondary"
            disabled={!isValid}
          >
            Export
          </LoadingButton>

          <Button variant="outlined" size="small" color="secondary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ExportRequisition;
