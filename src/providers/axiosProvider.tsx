import axiosIns from "./axiosIns";

export const AxiosProvider = ({ children }: any) => {
    axiosIns.interceptors.request.clear()
    axiosIns.interceptors.response.clear()

    // Request interceptor - just set Accept header (auth via cookies)
    axiosIns.interceptors.request.use(
        (config: any) => {
            config.headers.Accept = 'application/json';
            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    )

    // Response interceptor - handle token expiration and refresh
    axiosIns.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // Check if error is 401 (no token, expired token, or invalid token)
            const errorCode = error.response?.data?.code;
            if (error.response?.status === 401 &&
                (errorCode === 'TOKEN_EXPIRED' || errorCode === 'NO_TOKEN' || errorCode === 'INVALID_TOKEN') &&
                !originalRequest._retry) {

                originalRequest._retry = true;

                try {
                    // Call refresh endpoint - this will set new accessToken cookie
                    await axiosIns.post('/auth/refresh', {}, { withCredentials: true });

                    // Retry original request
                    return axiosIns(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - redirect to login
                    window.location.href = `${process.env.API_URL}/auth/google`;
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    )

    return <div>{children}</div>
}

export default AxiosProvider;