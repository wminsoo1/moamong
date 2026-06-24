import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform, Linking, AppState } from "react-native";
import { router } from "expo-router";
import "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import { useRegisterPushToken } from "../mutations/useRegisterPushToken";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleNotificationData(data?: Record<string, string>) {
  const roomId = data?.roomId;
  const spendingId = data?.spendingId;
  const roomName = data?.roomName ?? "";
  const type = data?.type;
  const screen = data?.screen;
  const url = data?.url;

  if (roomId) {
    router.push({
      pathname: "/room-spending/[roomId]",
      params: {
        roomId,
        name: roomName,
        scrollToId: spendingId ?? "",
        openCommentId: type === "COMMENT" ? (spendingId ?? "") : "",
      },
    });
    return;
  }
  if (screen) {
    router.push(screen as any);
    return;
  }
  if (url && url !== "/") {
    Linking.openURL(url).catch(() => {});
  }
}

export function usePushTokenRegister() {
  const registerPushToken = useRegisterPushToken();
  const appState = useRef(AppState.currentState);
  const registeredToken = useRef<string | null>(null);

  useEffect(() => {
    let unsubRefresh: (() => void) | undefined;
    let unsubOpen: (() => void) | undefined;
    let unsubMessage: (() => void) | undefined;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const init = (retryCount = 0) => {
      try {
        registerToken();

        unsubRefresh = messaging().onTokenRefresh((newToken) => {
          registerPushToken.mutate(newToken, {
            onError: (e) => console.warn("[FCM] 토큰 갱신 등록 실패", e),
          });
        });

        unsubOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
          handleNotificationData(remoteMessage.data);
        });

        messaging().getInitialNotification().then((remoteMessage) => {
          if (remoteMessage) {
            handleNotificationData(remoteMessage.data);
          }
        });

        unsubMessage = messaging().onMessage(async (_remoteMessage) => {
          console.log('[FCM] onMessage called (foreground) - Firebase handles display natively');
        });
      } catch (e) {
        if (retryCount < 3) {
          retryTimeout = setTimeout(() => init(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          console.warn("[FCM] Firebase 초기화 실패", e);
        }
      }
    };

    init();

    const unsubForegroundTap = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationData(response.notification.request.content.data as Record<string, string>);
    });

    const unsubAppState = AppState.addEventListener("change", (nextState) => {
      if (appState.current !== "active" && nextState === "active") {
        registerToken();
      }
      appState.current = nextState;
    });

    return () => {
      clearTimeout(retryTimeout);
      unsubRefresh?.();
      unsubOpen?.();
      unsubMessage?.();
      unsubForegroundTap.remove();
      unsubAppState.remove();
    };
  }, []);

  async function registerToken() {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== "granted") {
        await Notifications.requestPermissionsAsync();
      }

      const fcmToken = await messaging().getToken();
      if (fcmToken === registeredToken.current) return;
      registerPushToken.mutate(fcmToken, {
        onSuccess: () => {
          registeredToken.current = fcmToken;
          console.log("[FCM] 토큰 등록 성공");
        },
        onError: (e) => console.warn("[FCM] 토큰 등록 실패", e),
      });
    } catch (e) {
      console.log("[FCM] 토큰 획득 실패", e);
    }
  }
}
