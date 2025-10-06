import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";

const MessagesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>
        Vos conversations avec les chauffeurs test
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", color: colors.primary },
  subtitle: { marginTop: 8, color: "#555" },
});

export default MessagesScreen;
