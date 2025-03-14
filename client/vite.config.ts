import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false, // 화면 지우기 비활성화
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
