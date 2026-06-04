import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { router } from "expo-router";

// Android 에뮬레이터에서는 10.0.2.2가 호스트 머신 localhost
const DEFAULT_URL = Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL;
const SESSION_KEY = "X-Auth-Token";

export const getSessionId = async () => AsyncStorage.getItem(SESSION_KEY);
export const setSessionId = (id: string) => AsyncStorage.setItem(SESSION_KEY, id);
export const clearSessionId = () => AsyncStorage.removeItem(SESSION_KEY);

export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const sessionId = await getSessionId();
  const method = options?.method || 'GET';
  
  console.log(`[API] [${method}] [${url}] [token:${sessionId ? 'PRESENT' : 'NONE'}]`);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(sessionId ? { "X-Auth-Token": sessionId } : {}),
        ...options?.headers,
      },
    });
  } catch (error) {
    console.warn(`[API] [Error] [${url}]`, error);
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      throw new Error("인터넷 연결을 확인해주세요.");
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  console.log(`[API] [${method}] [${url}] [status:${res.status}]`);

  const newSessionId = res.headers.get("X-Auth-Token");
  if (newSessionId) {
    await setSessionId(newSessionId);
  }

  if (res.status === 401) {
    console.warn(`[API] [401] [${url}] Redirecting to login`);
    await clearSessionId();
    router.replace("/(auth)/login");
    throw new Error("Unauthorized");
  }

  const text = await res.text();
  let body: any;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }

  if (!res.ok) {
    console.warn(`[API] [Error] [${url}] [${res.status}]`, body);
    if (res.status >= 500) {
      throw new Error(body?.message ?? "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new Error(body?.message ?? "요청에 실패했습니다.");
  }

  return body as T;
}
