import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"passenger" | "driver">("passenger");

  const handleRegister = async () => {
    // Validation
    if (!name || !phone || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Vérifier format téléphone (Guinée)
    if (!phone.startsWith("+224")) {
      Alert.alert(
        "Format téléphone",
        'Le numéro doit commencer par +224\nExemple: +224612345678'
      );
      return;
    }

    // Vérifier longueur mot de passe
    if (password.length < 8) {
      Alert.alert(
        "Mot de passe",
        "Le mot de passe doit contenir au moins 8 caractères"
      );
      return;
    }

    // Vérifier confirmation
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      clearError();
      await register({
        name,
        phone,
        password,
        email: email || undefined,
        role: role, // Utilise le rôle sélectionné
      });
      // Navigation automatique si succès
      Alert.alert("Succès", "Compte créé avec succès !", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err) {
      Alert.alert("Inscription échouée", error || "Une erreur est survenue");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Créer un compte</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* Sélecteur de rôle (temporaire pour tests) */}
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "passenger" && styles.roleButtonActive,
            ]}
            onPress={() => setRole("passenger")}
            disabled={loading}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === "passenger" && styles.roleButtonTextActive,
              ]}
            >
              👤 Passager
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "driver" && styles.roleButtonActive,
            ]}
            onPress={() => setRole("driver")}
            disabled={loading}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === "driver" && styles.roleButtonTextActive,
              ]}
            >
              🚗 Chauffeur
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nom complet *"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email (optionnel)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="+224612345678 *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe (min 8 caractères) *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.primary, loading && styles.primaryDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/auth/login")}
          disabled={loading}
        >
          <Text style={styles.linkText}>J'ai déjà un compte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
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
  roleSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  roleButtonTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
