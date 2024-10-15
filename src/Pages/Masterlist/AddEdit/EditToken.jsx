import { Box, Button, Stack, Typography } from "@mui/material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { LoadingButton } from "@mui/lab";
import { AddBox } from "@mui/icons-material";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useUpdateTokenApiMutation } from "../../../Redux/Query/tokenSetup";
import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

const schema = yup.object().shape({
  id: yup.string(),
  p_name: yup.string().required("System Name is required.").label("System Name"),
  endpoint: yup.string().required("Base URL is required.").label("Base URL"),
  token: yup.string().required("Token is required.").label("Token"),
});

const EditToken = ({ data }) => {
  //   const [updatedToken, setUpdatedToken] = useState({
  //     // status: false,
  //     id: null,
  //     token: "",
  //     endpoint: "",
  //     p_name: "",
  //   });
  const dispatch = useDispatch();

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

  const [
    updateToken,
    {
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      data: updateData,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateTokenApiMutation();

  const onUpdateTokenHandler = (formData) => {
    updateToken(formData);
    // onUpdateResetHandler();
    handleCloseDrawer();
    dispatch(
      openToast({
        message: formData.message,
        duration: 5000,
      })
    );
  };

  const handleCloseDrawer = () => {
    // setTimeout(() => {
    //   onUpdateResetHandler();
    // }, 500);

    dispatch(closeDrawer());
  };

  //   const onUpdateResetHandler = () => {
  //     setUpdatedToken({
  //       p_name: "",
  //       token: "",
  //       endpoint: "",
  //     });
  //   };

  useEffect(() => {
    setValue("id", data.id);
    setValue("p_name", data?.p_name);
    setValue("endpoint", data?.endpoint);
    setValue("token", data?.token);
  }, [data]);

  return (
    <Box className="add-role">
      <Stack flexDirection="row" alignItems="center" gap={1} alignSelf="flex-start" pb={1}>
        <AddBox color="secondary" sx={{ fontSize: "30px" }} />
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
          Edit Token
        </Typography>
      </Stack>

      <Box
        component="form"
        onSubmit={handleSubmit(onUpdateTokenHandler)}
        className="add-userAccount__employee"
        sx={{ mx: "10px" }}
      >
        <CustomTextField
          required
          disabled
          control={control}
          name="p_name"
          label="System Name"
          type="text"
          color="secondary"
          size="small"
          error={!!errors?.p_name?.message}
          helperText={errors?.p_name?.message}
          fullWidth
        />
        <CustomTextField
          required
          control={control}
          name="endpoint"
          label="Base URL"
          type="text"
          color="secondary"
          size="small"
          error={!!errors?.endpoint?.message}
          helperText={errors?.endpoint?.message}
          allowSpecialCharacters={true}
          fullWidth
        />
        <CustomTextField
          required
          control={control}
          name="token"
          label="Token"
          type="text"
          color="secondary"
          size="small"
          error={!!errors?.token?.message}
          helperText={errors?.token?.message}
          allowSpecialCharacters={true}
          fullWidth
        />

        <Stack flexDirection="row" justifyContent="flex-end" gap="20px" sx={{ pt: "15px" }}>
          <LoadingButton type="submit" variant="contained" size="small" loading={isUpdateLoading}>
            Update
          </LoadingButton>

          <Button variant="outlined" color="secondary" size="small" onClick={handleCloseDrawer}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default EditToken;
