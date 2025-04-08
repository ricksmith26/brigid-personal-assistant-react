import { API_URL } from "../config/config"
import axiosIns from "../providers/axiosIns"

export const contactRequest = async () => {
    const response = await axiosIns.get(`${API_URL}/relatedPerson/getByEmail`)
    return response.data
}
