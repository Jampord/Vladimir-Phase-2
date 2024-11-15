import React, { useEffect, useState } from "react";
import moment from "moment";
// import CustomAutoComplete from "../../../../Components/Reusable/CustomAutoComplete";
import CustomDatePicker from "../../../Components/Reusable/CustomDatePicker";
import CustomTextField from "../../../Components/Reusable/CustomTextField";

import useExcel from "../../../Hooks/Xlsx";

import { Box, Button, TextField, Typography } from "@mui/material";
import { IosShareRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useDispatch } from "react-redux";

import { useGetTypeOfRequestAllApiQuery } from "../../../Redux/Query/Masterlist/TypeOfRequest";
import { closeExport } from "../../../Redux/StateManagement/booleanStateSlice";
import { useLazyGetExportApiQuery } from "../../../Redux/Query/FixedAsset/FixedAssets";
import ExportIcon from "../../../Img/SVG/ExportIcon.svg";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useLazyGetPrWithExportApiQuery } from "../../../Redux/Query/Request/PurchaseRequest";
import useExcelJs from "../../../Hooks/ExcelJs";

const schema = yup.object().shape({
  id: yup.string(),
  from: yup.string().required().typeError("Please provide a FROM date"),
  to: yup.string().required().typeError("Please provide a TO date"),
});

const ExportPr = () => {
  const dispatch = useDispatch();

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
  ] = useLazyGetPrWithExportApiQuery();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      from: null,
      to: null,
      export: null,
    },
  });

  useEffect(() => {
    if (exportApiError && exportError?.status === 422) {
      dispatch(
        openToast({
          message: exportError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
    } else if (exportApiError && exportError?.status !== 422) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [exportApiError]);

  const handleExport = async (formData) => {
    try {
      const res = await trigger({
        search: "",
        page: "",
        perPage: "",
        from: moment(formData?.from).format("MMM DD, YYYY"),
        to: moment(formData?.to).format("MMM DD, YYYY"),
        export: 1,
      }).unwrap();

      const newObj = res?.flatMap((item) => {
        return {
          "Ymir PR Number": item?.ymir_pr_number,
          "PR Number": item?.pr_number,
          "Item Status": item?.item_status,
          Status: item?.status,
          "Asset Description": item?.asset_description,
          "Asset Specification": item?.asset_specification,
          Brand: item?.brand,
          "Transaction Number": item?.transaction_number,
          "Acquisition Details": item?.acquisition_details,
          "Company Code": item?.company_code,
          Company: item?.company,
          "Business Unit Code": item?.business_unit_code,
          "Business Unit": item?.business_unit,
          "Department Code": item?.department_code,
          Department: item?.department,
          "Unit Code": item?.unit_code,
          Unit: item?.unit,
          "Subunit Code": item?.subunit_code,
          Subunit: item?.subunit,
          "Location Code": item?.location_code,
          Location: item?.location,
          "Account Title Code": item?.account_title_code,
          "Account Title": item?.account_title,
          "Date Needed": moment(item?.date_needed).format("MMM DD, YYYY"),
          "Created At": moment(item?.created_at).format("MMM DD, YYYY"),
        };
      });

      await excelExport(newObj, "Vladimir-PR-Reports.xlsx");
      dispatch(
        openToast({
          message: "Successfully Exported",
          duration: 5000,
          variant: "success",
        })
      );
      dispatch(closeExport());
    } catch (err) {
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

  //

  const handleClose = () => {
    dispatch(closeExport());
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
        <Typography variant="h5" color="secondary" sx={{ fontFamily: "Anton" }}>
          Export PR Reports
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
            startIcon={
              exportApiLoading ? null : (
                <IosShareRounded
                  // color={disabledItems() ? "gray" : "primary"}
                  color={!isValid ? "gray" : "primary"}
                  size="small"
                />
              )
            }
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

export default ExportPr;
