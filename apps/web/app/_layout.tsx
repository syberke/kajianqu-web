import { useState } from 'react'
import { Stack, router } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WebChrome } from '@kajianku/ui-web'

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
  }))
  return (
    <QueryClientProvider client={queryClient}>
      <WebChrome navigate={(href) => router.push(href as never)}>
        <Stack screenOptions={{ headerShown: false }} />
      </WebChrome>
    </QueryClientProvider>
  )
}
