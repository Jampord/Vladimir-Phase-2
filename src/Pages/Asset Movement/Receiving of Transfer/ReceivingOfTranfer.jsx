import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import ReceivingTable from "./ReceivingTable";

const ReceivingOfTransfer = () => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    refetch();
  }, [notifData]);

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Receiving of Transfer
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toRelease}>
                  For Receiving
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />

            <Tab label="Received" value="2" className={value === "2" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ReceivingTable />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ReceivingTable received />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default ReceivingOfTransfer;
