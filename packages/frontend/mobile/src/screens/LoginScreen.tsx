import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Validation simple
    if (!phone || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    // Vérifier le format téléphone (Guinée)
    if (!phone.startsWith("+224")) {
      Alert.alert(
        "Format téléphone",
        'Le numéro doit commencer par +224\nExemple: +224612345678'
      );
      return;
    }

    try {
      clearError();
      await login({ phone, password });
      // Navigation automatique vers tabs si succès
      router.replace("/(tabs)");
    } catch (err) {
      // L'erreur est déjà gérée dans le context
      Alert.alert("Connexion échouée", error || "Identifiants incorrects");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="+224612345678"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.primary, loading && styles.primaryDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Continuer</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => router.push("/auth/register")}
        disabled={loading}
      >
        <Text style={styles.linkText}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 16,
  },
  error: {
    color: "red",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  primary: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#666", textDecorationLine: "underline" },
});
