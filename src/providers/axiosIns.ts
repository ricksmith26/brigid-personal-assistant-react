import axios from "axios";

const axiosIns = axios.create({
    baseURL: process.env.API_URL,
    timeout: 10000
});
 export default axiosIns;