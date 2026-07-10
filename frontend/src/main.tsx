import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      // 'always' = don't gate fetches on online/offline. Note: with a fully
      // unreachable BFF, react-query can still land queries in
      // fetchStatus:'paused' (status stays 'pending'); DashboardPage's
      // selectDashboardState treats that paused state as an error so the UI
      // doesn't spin forever. For mutations, 'always' makes a deposit fail fast
      // (error toast) instead of hanging when the BFF is down.
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
