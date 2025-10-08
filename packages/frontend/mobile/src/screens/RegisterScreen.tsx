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
  const { loading, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name || !phone) {
      Alert.alert("Erreur", "Veuillez remplir le nom et le téléphone");
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

    try {
      setSending(true);
      clearError();
      
      // TODO: Call API to send OTP
      // await authService.sendOtp(phone);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to OTP verification
      router.push({
        pathname: '/auth/verify-otp',
        params: { phone, name, email }
      });
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'envoyer le code de vérification");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Créer un compte</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Nom complet *"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          editable={!sending}
        />

        <TextInput
          style={styles.input}
          placeholder="+224612345678 *"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!sending}
        />

        <TextInput
          style={styles.input}
          placeholder="Email (optionnel)"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!sending}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📱 Un code de vérification sera envoyé à ce numéro
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primary, sending && styles.primaryDisabled]}
          onPress={handleRegister}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Continuer</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/auth/login")}
          disabled={sending}
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
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  infoBox: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
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
