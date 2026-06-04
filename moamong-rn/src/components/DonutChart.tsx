import { View, Text, Dimensions, StyleSheet } from "react-native";
import Svg, { Circle, Line as SvgLine } from "react-native-svg";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { CategoryEntry } from "@/src/features/spending/types";
import { CategoryGroup } from "@/src/features/user/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const TOSS_COLORS = [
  "#3182f6",
  "#0ea5e9",
  "#10b981",
  "#ffbb00",
  "#f04452",
  "#ec4899",
  "#8b5cf6",
  "#6b7280",
];

export function DonutChart({ data, total }: { data: CategoryEntry[]; total: number }) {
  const { getColor, getIcon, getLabel } = useGroupSettings();
  const SIZE = SCREEN_WIDTH;
  const center = SIZE / 2;
  const DONUT_RADIUS = SIZE * 0.2;
  const STROKE_WIDTH = SIZE * 0.082;
  const OUTER_EDGE = DONUT_RADIUS + STROKE_WIDTH / 2;
  const EMOJI_RADIUS = OUTER_EDGE + 46;
  const EMOJI_SIZE = 26;
  const NAME_RADIUS = EMOJI_RADIUS + EMOJI_SIZE / 2 + 10;
  const circumference = 2 * Math.PI * DONUT_RADIUS;

  let currentAngle = -90;
  const rawSlices = data.map((item, idx) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const midAngleDeg = currentAngle + sliceAngle / 2;
    const rotation = currentAngle;
    currentAngle += sliceAngle;
    const midRad = (midAngleDeg * Math.PI) / 180;
    const color = getColor(item.categoryGroup as CategoryGroup);
    return {
      ...item,
      idx,
      rotation,
      color,
      midAngleDeg,
      strokeDashoffset: circumference - (item.percentage / 100) * circumference,
      sliceLineX: center + (OUTER_EDGE + 5) * Math.cos(midRad),
      sliceLineY: center + (OUTER_EDGE + 5) * Math.sin(midRad),
    };
  });

  // 라벨 겹침 방지: 인접 쌍 순서로 교차 없이 간격 확보
  const MIN_GAP_RAD = (EMOJI_SIZE + 14) / EMOJI_RADIUS;
  const labelAngles = rawSlices.map((s) => (s.midAngleDeg * Math.PI) / 180);

  for (let iter = 0; iter < 300; iter++) {
    let moved = false;
    for (let i = 0; i < labelAngles.length - 1; i++) {
      const gap = labelAngles[i + 1] - labelAngles[i];
      if (gap < MIN_GAP_RAD) {
        const push = (MIN_GAP_RAD - gap) / 2;
        labelAngles[i] -= push;
        labelAngles[i + 1] += push;
        moved = true;
      }
    }
    if (!moved) break;
  }

  const slices = rawSlices.map((s, i) => {
    const ar = labelAngles[i];
    return {
      ...s,
      emojiX: center + EMOJI_RADIUS * Math.cos(ar),
      emojiY: center + EMOJI_RADIUS * Math.sin(ar),
      lineEndX: center + (EMOJI_RADIUS - EMOJI_SIZE / 2 - 2) * Math.cos(ar),
      lineEndY: center + (EMOJI_RADIUS - EMOJI_SIZE / 2 - 2) * Math.sin(ar),
      nameX: center + NAME_RADIUS * Math.cos(ar),
      nameY: center + NAME_RADIUS * Math.sin(ar),
    };
  });

  return (
    <View style={{ width: SIZE, height: SIZE, alignSelf: "center" }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={center} cy={center} r={DONUT_RADIUS} stroke="#f2f4f6" strokeWidth={STROKE_WIDTH} fill="transparent" />
        {slices.map((s) => (
          <Circle
            key={s.idx}
            cx={center}
            cy={center}
            r={DONUT_RADIUS}
            stroke={s.color}
            strokeWidth={STROKE_WIDTH - 2}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={s.strokeDashoffset}
            fill="transparent"
            transform={`rotate(${s.rotation}, ${center}, ${center})`}
          />
        ))}
        {slices.map((s) => (
          <SvgLine
            key={`l-${s.idx}`}
            x1={s.sliceLineX}
            y1={s.sliceLineY}
            x2={s.lineEndX}
            y2={s.lineEndY}
            stroke={s.color}
            strokeWidth={1.2}
            opacity={0.35}
          />
        ))}
      </Svg>

      <View style={styles.centerLabel}>
        <Text style={styles.centerTitle}>이번 달</Text>
        <Text style={styles.centerValue}>{Math.round(total / 10000).toLocaleString()}만원</Text>
      </View>

      {slices.map((s) => (
        <View
          key={`e-${s.idx}`}
          style={{
            position: "absolute",
            left: s.emojiX - EMOJI_SIZE / 2,
            top: s.emojiY - EMOJI_SIZE / 2,
            width: EMOJI_SIZE,
            height: EMOJI_SIZE,
            borderRadius: EMOJI_SIZE / 2,
            backgroundColor: "#ffffff",
            borderWidth: 1.5,
            borderColor: s.color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CategoryIcon emoji={getIcon(s.categoryGroup as CategoryGroup)} color={s.color} size={14} />
        </View>
      ))}

      {slices.map((s) => (
        <View
          key={`n-${s.idx}`}
          style={{
            position: "absolute",
            left: s.nameX - 28,
            top: s.nameY - 7,
            width: 56,
            alignItems: "center",
          }}
        >
          <Text numberOfLines={1} style={{ fontSize: 9, fontWeight: "700", color: s.color, textAlign: "center" }}>
            {getLabel(s.categoryGroup as CategoryGroup)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centerLabel: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  centerTitle: { fontSize: 13, fontWeight: "600", color: "#8b95a1" },
  centerValue: { fontSize: 22, fontWeight: "900", color: "#191f28", marginTop: 2 },
});
