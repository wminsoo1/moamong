import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform, Linking, AppState } from "react-native";
import "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import { useRegisterPushToken } from "../mutations/useRegisterPushToken";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function openNotificationUrl(url: string | undefined) {
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

    const init = (retryCount = 0) => {
      try {
        registerToken();

        unsubRefresh = messaging().onTokenRefresh((newToken) => {
          registerPushToken.mutate(newToken, {
            onError: (e) => console.warn("[FCM] 토큰 갱신 등록 실패", e),
          });
        });

        unsubOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
          openNotificationUrl(remoteMessage.data?.url as string | undefined);
        });

        messaging().onMessage(async (remoteMessage) => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: remoteMessage.notification?.title ?? "모아몽",
              body: remoteMessage.notification?.body ?? "",
              data: remoteMessage.data,
            },
            trigger: null,
          });
        });

        messaging().getInitialNotification().then((remoteMessage) => {
          if (remoteMessage) {
            openNotificationUrl(remoteMessage.data?.url as string | undefined);
          }
        });
      } catch (e) {
        if (retryCount < 3) {
          setTimeout(() => init(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          console.warn("[FCM] Firebase 초기화 실패", e);
        }
      }
    };

    init();

    const unsubAppState = AppState.addEventListener("change", (nextState) => {
      if (appState.current !== "active" && nextState === "active") {
        registerToken();
      }
      appState.current = nextState;
    });

    return () => {
      unsubRefresh?.();
      unsubOpen?.();
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
