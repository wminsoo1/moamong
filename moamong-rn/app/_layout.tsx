import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toast } from "@/src/components/Toast";
import { toast } from "@/src/lib/toast";
import * as Updates from "expo-updates";

function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return toast._subscribe((msg) => setMessage(msg));
  }, []);

  if (!message) return null;
  return <Toast message={message} onHide={() => setMessage(null)} />;
}

function onQueryError(error: unknown) {
  const msg = error instanceof Error ? error.message : "오류가 발생했습니다.";
  if (msg === "Unauthorized") return;
  toast.show(msg);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      throwOnError: false,
    },
  },
  queryCache: new QueryCache({ onError: onQueryError }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressToast) return;
      onQueryError(error);
    },
  }),
});

async function checkForUpdate() {
  if (!Updates.isEnabled) return;
  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch {}
}

export default function RootLayout() {
  useEffect(() => {
    checkForUpdate();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="rooms" />
            <Stack.Screen name="stats" />
            <Stack.Screen name="share" />
            <Stack.Screen name="add-expense" />
            <Stack.Screen name="edit-expense/[id]" />
            <Stack.Screen name="category-add" />
            <Stack.Screen name="category-edit" />
            <Stack.Screen name="category-management" />
            <Stack.Screen name="category-group-management" />
            <Stack.Screen name="category-group-edit" />
            <Stack.Screen name="share-item" />
            <Stack.Screen name="share-settings" />
            <Stack.Screen name="recurring-spendings" />
            <Stack.Screen name="add-recurring-spending" />
            <Stack.Screen name="edit-recurring-spending/[id]" />
          </Stack>
          <ToastHost />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
