import axiosIns from "./axiosIns";

export const AxiosProvider = ({children}:any) => {
        // if (window.location.search.includes('?token=')) {
            const hasBearerToken = window.location.search.includes('?token=')
            console.log(hasBearerToken, hasBearerToken
                ? window.location.search.split('?token=')[1]
                : localStorage.getItem('token'))
            if (hasBearerToken) localStorage.setItem('token', window.location.search.split('?token=')[1])
            axiosIns.interceptors.request.clear()
            axiosIns.interceptors.response.clear()
            axiosIns.interceptors.request.use(
                (config: any) => {
                    config.headers.Authorization = `Bearer ${hasBearerToken
                        ? window.location.search.split('?token=')[1]
                        : localStorage.getItem('token')}`;
                    config.headers.Accept = 'application/json';
                    return config;
                }, 
                (error: any) => {
                    return Promise.reject(error);
                }
            )
        // }
    return <div>{children}</div>
}

export default AxiosProvider;