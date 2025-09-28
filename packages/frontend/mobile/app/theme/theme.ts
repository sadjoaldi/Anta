import { Theme } from "@react-navigation/native";
import colors from "../../src/theme/colors";

export const navTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: "#ffffff",
    card: "#ffffff",
    text: "#111111",
    border: "#e5e5e5",
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: "Inter_400Regular", fontWeight: "normal" },
    medium: { fontFamily: "Inter_500Medium", fontWeight: "normal" },
    bold: { fontFamily: "Inter_700Bold", fontWeight: "normal" },
    heavy: { fontFamily: "Inter_900Black", fontWeight: "normal" },
  },
};
