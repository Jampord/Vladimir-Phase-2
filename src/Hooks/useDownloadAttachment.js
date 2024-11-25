export const useDownloadAttachment = async ({ attachment, id }) => {
  try {
    const response = await fetch(`${process.env.VLADIMIR_BASE_URL}/dl?attachment=${attachment}&id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: " application/json",
      },
    });

    if (!response.ok) {
      // Handle the error if the API response is not successful.
      throw new Error("Failed to download attachment file.");
    }

    const blob = await response.blob();
    saveAs(blob, `${attachment}`); // Specify the filename for the downloaded file.
  } catch (error) {
    console.error("Error while downloading attachment file:", error);
  }
};

export const useDownloadTransferAttachment = async ({ attachments, transfer_number }) => {
  try {
    const response = await fetch(`${process.env.VLADIMIR_BASE_URL}/transfer-download/${transfer_number}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: " application/json",
      },
    });

    if (!response.ok) {
      // Handle the error if the API response is not successful.
      throw new Error("Failed to download attachment file.");
    }

    const blob = await response.blob();
    saveAs(blob, `${attachments}`); // Specify the filename for the downloaded file.
  } catch (error) {
    console.error("Error while downloading attachment file:", error);
  }
};
