import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Utensils, Coffee, Pizza, Car, Train, Bus, Plane, Bike, Ship,
  ShoppingCart, ShoppingBag, Gift, Music, Film, Gamepad2, Camera,
  Palette, BookOpen, Trophy, Stethoscope, Dumbbell, Heart, HeartPulse,
  Scissors, Home, Building2, Lightbulb, Wrench, Sofa, Leaf, Gem,
  CreditCard, Wallet, PiggyBank, TrendingUp, Shield, Smartphone,
  Laptop, Monitor, Wifi, Bell, Dog, Cat, Luggage, Globe, Mountain,
  Sun, Star, Zap, Flame, MoreHorizontal, Receipt, Umbrella, BarChart2, Package,
  Shirt, Sparkles,
  Sandwich, Soup, Beer, Wine, IceCreamCone, CupSoda,
  ShoppingBasket, Tag, Fuel, Headphones, Tv, Ticket, Paintbrush,
  GraduationCap, Newspaper, PenLine, Pill, Bed, Hammer, Droplets,
  Banknote, Coins, Percent, Calculator, Baby, Users, Map,
  ShieldCheck, PawPrint,
  ShoppingCart as FoodIcon, Laptop as ElectronicsIcon,
  Trophy as SportsIcon, Home as HomeLivingIcon
} from "lucide-react-native";

interface CategoryIconProps {
  emoji: string;
  color: string;
  isWhite?: boolean;
  size?: number;
}

const ICON_MAP: Record<string, any> = {
  Utensils, Coffee, Pizza, Car, Train, Bus, Plane, Bike, Ship,
  ShoppingCart, ShoppingBag, Gift, Music, Film, Gamepad2, Camera,
  Palette, BookOpen, Trophy, Stethoscope, Dumbbell, Heart, HeartPulse,
  Scissors, Home, Building2, Lightbulb, Wrench, Sofa, Leaf, Gem,
  CreditCard, Wallet, PiggyBank, TrendingUp, Shield, Smartphone,
  Laptop, Monitor, Wifi, Bell, Dog, Cat, Luggage, Globe, Mountain,
  Sun, Star, Zap, Flame, MoreHorizontal, Receipt, Umbrella, BarChart2, Package,
  Shirt, Sparkles,
  Sandwich, Soup, Beer, Wine, IceCreamCone, CupSoda,
  ShoppingBasket, Tag, Fuel, Headphones, Tv, Ticket, Paintbrush,
  GraduationCap, Newspaper, PenLine, Pill, Bed, Hammer, Droplets,
  Banknote, Coins, Percent, Calculator, Baby, Users, Map,
  ShieldCheck, PawPrint,
  // System categories
  FASHION: Shirt,
  BEAUTY: Sparkles,
  FOOD: FoodIcon,
  ELECTRONICS: ElectronicsIcon,
  SPORTS: SportsIcon,
  HOME: HomeLivingIcon,
  ETC: MoreHorizontal
};

export function CategoryIcon({ emoji, color, isWhite = false, size = 18 }: CategoryIconProps) {
  const cleanEmoji = emoji?.trim() || "";
  const lowerEmoji = cleanEmoji.toLowerCase();
  
  // Force ETC variants to dots
  if (
    lowerEmoji.includes("etc") ||
    lowerEmoji.includes("기타") ||
    cleanEmoji === "📦" ||
    cleanEmoji === "🎁" ||
    lowerEmoji.includes("horizontal")
  ) {
    const IconComponent = ICON_MAP["ETC"];
    return <IconComponent size={size} color={isWhite ? "#ffffff" : color} />;
  }

  const IconComponent = ICON_MAP[cleanEmoji];

  if (IconComponent) {
    return <IconComponent size={size} color={isWhite ? "#ffffff" : color} />;
  }

  // Fallback to emoji if it's not a known icon name
  return (
    <View style={styles.emojiContainer}>
      <Text style={[styles.emoji, { fontSize: size * 0.8 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    textAlign: "center",
  },
});
