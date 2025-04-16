import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import './index.css'
import App from './App.tsx'
import { store } from './redux/store.ts'
import AxiosProvider from './providers/axiosProvider.tsx';
import { SocketProvider } from './providers/socketProvider.tsx';


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SocketProvider>
      <Provider store={store}>
        <AxiosProvider>
            <App />
        </AxiosProvider>
      </Provider>
    </SocketProvider>
  </BrowserRouter>,
)
