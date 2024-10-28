import React, { useEffect, useState } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Button, Dialog, Drawer, Stack, Tab, Tabs, Typography } from "@mui/material";

import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import { useLocation } from "react-router-dom";
import ReceivingTable from "../../Asset Requisition/Received Asset/ReceivedAssetTable";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { Add, AddBox, LocalOffer } from "@mui/icons-material";
import { closeDialog, closeDrawer, openDialog, openDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch, useSelector } from "react-redux";
import AddCost from "../AddEdit/AddCost";
import Elixir from "./Elixir";
import AddTag from "../AddEdit/AddTag";

const AdditionalCost = () => {
  const [value, setValue] = useState("1");
  const [openTag, setOpenTag] = useState(false);
  const location = useLocation();

  const dispatch = useDispatch();

  const drawer = useSelector((state) => state.booleanState.dialog);
  const dialog = useSelector((state) => state.booleanState.drawer);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOpenAddCost = () => {
    dispatch(openDialog());
  };

  const handleOpenAddTag = () => {
    dispatch(openDrawer());
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Additional Cost
      </Typography>

      <Box>
        <TabContext value={value}>
          <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <Tabs onChange={handleChange} value={value}>
              <Tab label="ELIXIR ETD" value="1" className={value === "1" ? "tab__background" : null} />
              <Tab label="GENUS ETD" value="2" className={value === "2" ? "tab__background" : null} />
              <Tab label="YMIR" value="3" className={value === "3" ? "tab__background" : null} />
            </Tabs>
            <Stack direction="row" spacing={1}>
              {/* <Button variant="contained" size="small" startIcon={<LocalOffer />} onClick={handleOpenAddTag}>
                Tag
              </Button> */}
              <Button variant="contained" size="small" startIcon={<AddBox />} onClick={handleOpenAddCost}>
                Add
              </Button>
            </Stack>
          </Stack>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <Elixir setOpenTag={setOpenTag} />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ReceivingTable />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="3" index="3">
            <ReceivingTable />
          </TabPanel>
        </TabContext>
      </Box>

      <Drawer anchor="right" open={drawer} onClose={() => dispatch(closeDialog())}>
        <AddCost />
      </Drawer>

      <Dialog open={dialog} onClose={() => dispatch(closeDrawer())}>
        <AddTag />
      </Dialog>
    </Box>
  );
};

export default AdditionalCost;
