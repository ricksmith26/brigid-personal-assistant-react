import { API_URL } from "../config/config";
import axiosIns from "../providers/axiosIns";

export const getImagesRequest = async () => {
    const response = await axiosIns.get(`${API_URL}/images/all`);
    return response.data.images;
}