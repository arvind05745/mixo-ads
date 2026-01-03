import axios from "axios";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

export const AllCampaings = async () => {
  try {
    const url = `${siteName}/campaigns`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const SingleCampaings = async (id) => {
  try {
    const url = `${siteName}/campaigns/${id}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const GetInsights = async () => {
  try {
    const url = `${siteName}/campaigns/insights`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const GetSingleInsights = async (campaign_id) => {
  try {
    const url = `${siteName}/campaigns/${campaign_id}/insights`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};
