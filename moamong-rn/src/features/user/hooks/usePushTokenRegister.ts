import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform, Linking } from "react-native";
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

  useEffect(() => {
    registerToken();

    // 토큰이 갱신될 때마다 서버에 재등록
    const unsubRefresh = messaging().onTokenRefresh((newToken) => {
      registerPushToken.mutate(newToken, {
        onError: (e) => console.warn("[FCM] 토큰 갱신 등록 실패", e),
      });
    });

    // 앱이 백그라운드에 있을 때 알림 탭
    const unsubOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      openNotificationUrl(remoteMessage.data?.url as string | undefined);
    });

    // 앱이 완전히 종료된 상태에서 알림 탭으로 앱 시작
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        openNotificationUrl(remoteMessage.data?.url as string | undefined);
      }
    });

    return () => {
      unsubRefresh();
      unsubOpen();
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
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      const fcmToken = await messaging().getToken();
      registerPushToken.mutate(fcmToken, {
        onSuccess: () => console.log("[FCM] 토큰 등록 성공"),
        onError: (e) => console.warn("[FCM] 토큰 등록 실패", e),
      });
    } catch (e) {
      console.log("[FCM] 토큰 획득 실패 (시뮬레이터)", e);
    }
  }
}
