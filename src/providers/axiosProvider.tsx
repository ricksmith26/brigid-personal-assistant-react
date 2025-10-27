import axiosIns from "./axiosIns";

export const AxiosProvider = ({ children }: any) => {
    axiosIns.interceptors.request.clear()
    axiosIns.interceptors.response.clear()

    // Request interceptor - add Bearer token from localStorage
    axiosIns.interceptors.request.use(
        (config: any) => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }
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

            // Check if error is 401 and token expired
            if (error.response?.status === 401 &&
                error.response?.data?.code === 'TOKEN_EXPIRED' &&
                !originalRequest._retry) {

                originalRequest._retry = true;

                try {
                    // Call refresh endpoint
                    const refreshResponse = await axiosIns.post('/auth/refresh', {}, { withCredentials: true });

                    // If refresh returns a new token, save it
                    if (refreshResponse.data?.token) {
                        localStorage.setItem('token', refreshResponse.data.token);
                    }

                    // Retry original request
                    return axiosIns(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - clear token and redirect to login
                    localStorage.removeItem('token');
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