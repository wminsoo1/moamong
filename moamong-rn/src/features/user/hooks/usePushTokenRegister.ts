import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
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

export function usePushTokenRegister() {
  const registerPushToken = useRegisterPushToken();

  useEffect(() => {
    registerToken();
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

      const tokenData = await Notifications.getDevicePushTokenAsync();
      console.log("[FCM] token:", tokenData.data);
      registerPushToken.mutate(tokenData.data, {
        onSuccess: () => console.log("[FCM] 토큰 등록 성공"),
        onError: (e) => console.warn("[FCM] 토큰 등록 실패", e),
      });
    } catch (e) {
      // 시뮬레이터 또는 인타이틀먼트 미설정 환경에서는 무시
      console.log("[FCM] 토큰 획득 실패 (시뮬레이터)", e);
    }
  }
}
