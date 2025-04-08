import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { config } from 'dotenv';
import tailwindcss from '@tailwindcss/vite'
// import basicSsl from '@vitejs/plugin-basic-ssl';
config();

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     // basicSsl(),
//     react(),
//     tailwindcss(),
//   ],
  // define: {
  //   'process.env': process.env
  // },
  // server: {
  //   host: '0.0.0.0',
  // },

// })
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': process.env
  },
})