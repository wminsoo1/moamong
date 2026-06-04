import { Tabs, usePathname } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Home, CalendarDays, User } from "lucide-react-native";
import { usePushTokenRegister } from "@/src/features/user/hooks/usePushTokenRegister";

function TabIcon({ focused, icon: Icon, relatedPaths }: { focused: boolean; icon: any; label: string; relatedPaths?: string[] }) {
  const pathname = usePathname();
  const active = focused || relatedPaths?.some((p) => pathname.includes(p));
  const color = active ? "#3182f6" : "#adb5bd";
  return (
    <View style={styles.iconWrap}>
      <Icon size={26} color={color} strokeWidth={active ? 2.5 : 1.8} />
    </View>
  );
}

export default function TabLayout() {
  usePushTokenRegister();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={CalendarDays} label="캘린더" relatedPaths={["stats"]} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Home} label="홈" />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={User} label="내 정보" relatedPaths={["rooms"]} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopColor: "#f2f4f6",
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
