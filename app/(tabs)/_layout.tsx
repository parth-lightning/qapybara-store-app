import { Tabs } from "expo-router";
import { HouseIcon as House } from "phosphor-react-native/src/icons/House";
import { MagnifyingGlassIcon as MagnifyingGlass } from "phosphor-react-native/src/icons/MagnifyingGlass";
import { HandbagIcon as Handbag } from "phosphor-react-native/src/icons/Handbag";
import { ReceiptIcon as Receipt } from "phosphor-react-native/src/icons/Receipt";
import { UserIcon as User } from "phosphor-react-native/src/icons/User";
import { useTheme } from "../../components/ui";
import { useStore } from "../../lib/provider";
export default function TabLayout() {
  const c = useTheme();
  const { state } = useStore();
  const count = (state.carts[state.session?.id ?? ""] ?? []).reduce(
    (n, l) => n + l.quantity,
    0,
  );
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.text,
        headerTitleStyle: { fontFamily: "Manrope_600SemiBold" },
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopColor: c.border,
          height: 68,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontFamily: "Manrope_400Regular", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "stillform",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <House
              color={typeof color === "string" ? color : c.muted}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => (
            <MagnifyingGlass
              color={typeof color === "string" ? color : c.muted}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Your bag",
          tabBarLabel: "Bag",
          tabBarButtonTestID: "cart-badge",
          tabBarAccessibilityLabel: "cart-badge",
          tabBarBadge: count || undefined,
          tabBarBadgeStyle: { backgroundColor: c.accent, color: c.onAccent },
          tabBarIcon: ({ color }) => (
            <Handbag
              color={typeof color === "string" ? color : c.muted}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <Receipt
              color={typeof color === "string" ? color : c.muted}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <User
              color={typeof color === "string" ? color : c.muted}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
