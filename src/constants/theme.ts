export const colors = {
  primary: "#2F6690",
  primaryDark: "#1E4E70",
  primaryLight: "#DCEBF5",
  accent: "#3A9BDC",
  background: "#F6F8FA",
  surface: "#FFFFFF",
  border: "#E4E9EE",
  text: "#1A2530",
  textMuted: "#6B7B8C",
  textFaint: "#9AA7B3",
  success: "#2E9E5B",
  successLight: "#E3F6EA",
  warning: "#C88A1B",
  warningLight: "#FBF0DA",
  danger: "#D14343",
  dangerLight: "#FBE6E6",
  info: "#3A9BDC",
  infoLight: "#E4F2FC",
};

export const statusColors: Record<
  string,
  { fg: string; bg: string; label: string }
> = {
  pending: { fg: colors.warning, bg: colors.warningLight, label: "Pending" },
  confirmed: { fg: colors.info, bg: colors.infoLight, label: "Confirmed" },
  picked_up: { fg: colors.info, bg: colors.infoLight, label: "Picked Up" },
  washing: { fg: colors.primary, bg: colors.primaryLight, label: "Washing" },
  ready: { fg: colors.success, bg: colors.successLight, label: "Ready" },
  out_for_delivery: {
    fg: colors.primary,
    bg: colors.primaryLight,
    label: "Out for Delivery",
  },
  delivered: {
    fg: colors.success,
    bg: colors.successLight,
    label: "Delivered",
  },
  cancelled: { fg: colors.danger, bg: colors.dangerLight, label: "Cancelled" },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
};

export const shadow = {
  card: {
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const ORDER_STEPS: string[] = [
  "pending",
  "confirmed",
  "picked_up",
  "washing",
  "ready",
  "out_for_delivery",
  "delivered",
];
