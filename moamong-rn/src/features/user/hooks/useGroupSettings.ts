import { useQueryClient } from "@tanstack/react-query";
import { CategoryGroup, CATEGORY_GROUP_COLORS, CATEGORY_GROUP_ICONS, CATEGORY_GROUP_LABELS } from "../types";
import { useCategoryGroups } from "../queries/useCategoryGroups";
import { useUpdateCategoryGroup } from "../mutations/useUpdateCategoryGroup";
import { userKeys } from "../keys";

export function useGroupSettings() {
  const queryClient = useQueryClient();
  const { data: groups = [] } = useCategoryGroups();
  const updateMutation = useUpdateCategoryGroup();

  const getGroup = (group: CategoryGroup) =>
    groups.find((g) => g.groupKey === group);

  const getColor = (group: CategoryGroup): string =>
    getGroup(group)?.color ?? CATEGORY_GROUP_COLORS[group] ?? "#6B7280";

  const getIcon = (group: CategoryGroup): string =>
    getGroup(group)?.icon ?? CATEGORY_GROUP_ICONS[group] ?? "MoreHorizontal";

  const getLabel = (group: CategoryGroup): string =>
    getGroup(group)?.label ?? CATEGORY_GROUP_LABELS[group] ?? "";

  const updateGroup = (group: CategoryGroup, color: string, icon: string) =>
    updateMutation.mutate({ groupKey: group, color, icon });

  return { getColor, getIcon, getLabel, updateGroup, groups };
}
