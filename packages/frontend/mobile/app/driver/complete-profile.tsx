import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../src/services/api.client";
import driverProfileService from "../../src/services/driverProfile.service";
import colors from "../../src/theme/colors";

interface DocumentState {
  uri: string | null;
  uploaded: boolean;
}

interface Documents {
  photo_profil: DocumentState;
  photo_cni_recto: DocumentState;
  photo_cni_verso: DocumentState;
  photo_permis_recto: DocumentState;
  photo_permis_verso: DocumentState;
  photo_carte_grise: DocumentState;
  photo_vehicule: DocumentState;
}

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [documents, setDocuments] = useState<Documents>({
    photo_profil: { uri: null, uploaded: false },
    photo_cni_recto: { uri: null, uploaded: false },
    photo_cni_verso: { uri: null, uploaded: false },
    photo_permis_recto: { uri: null, uploaded: false },
    photo_permis_verso: { uri: null, uploaded: false },
    photo_carte_grise: { uri: null, uploaded: false },
    photo_vehicule: { uri: null, uploaded: false },
  });

  const documentLabels: Record<keyof Documents, string> = {
    photo_profil: "Photo de Profil",
    photo_cni_recto: "CNI (Recto)",
    photo_cni_verso: "CNI (Verso)",
    photo_permis_recto: "Permis (Recto)",
    photo_permis_verso: "Permis (Verso)",
    photo_carte_grise: "Carte Grise",
    photo_vehicule: "Photo du Véhicule",
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Nous avons besoin de la permission d'accéder à votre caméra pour prendre des photos."
      );
      return false;
    }
    return true;
  };

  const pickImage = async (
    docType: keyof Documents,
    useCamera: boolean = false
  ) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result;

      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setDocuments((prev) => ({
          ...prev,
          [docType]: { uri: result.assets[0].uri, uploaded: false },
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  const showImagePickerOptions = (docType: keyof Documents) => {
    Alert.alert(documentLabels[docType], "Choisissez une source", [
      {
        text: "Prendre une photo",
        onPress: () => pickImage(docType, true),
      },
      {
        text: "Galerie",
        onPress: () => pickImage(docType, false),
      },
      {
        text: "Annuler",
        style: "cancel",
      },
    ]);
  };

  const uploadDocuments = async () => {
    // Vérifier qu'au moins un document est sélectionné
    const hasDocuments = Object.values(documents).some(
      (doc) => doc.uri !== null
    );
    if (!hasDocuments) {
      Alert.alert(
        "Aucun document",
        "Veuillez sélectionner au moins un document"
      );
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Récupérer l'ID du driver depuis le profil utilisateur
      // Note: apiClient.get() retourne déjà les données (pas response.data)
      const profile = await apiClient.get("/auth/me");
      const userId = profile.user?.id || profile.id;

      // Récupérer ou créer le driver associé
      let driverId;
      try {
        const driver = await apiClient.get(`/drivers/user/${userId}`);
        driverId = driver.id;
      } catch (error: any) {
        // Si le driver n'existe pas (404), le créer
        if (error.code === 'NOT_FOUND' || error.statusCode === 404) {
          const newDriver = await driverProfileService.createDriverProfile(userId);
          driverId = newDriver.id;
        } else {
          throw error;
        }
      }

      if (!driverId) {
        throw new Error('Unable to get or create driver profile');
      }

      // Créer le FormData
      const formData = new FormData();

      let docCount = 0;
      for (const [key, doc] of Object.entries(documents)) {
        if (doc.uri) {
          const filename = doc.uri.split("/").pop() || "photo.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";

          formData.append(key, {
            uri: doc.uri,
            type,
            name: `${key}_${Date.now()}.${match?.[1] || "jpg"}`,
          } as any);
          docCount++;
        }
      }

      setUploadProgress(30);

      // Upload - Utiliser axios directement pour multipart/form-data
      const axios = require('axios').default;
      const { API_BASE_URL } = require('../../src/services/api.config');
      
      // Récupérer le token d'authentification
      const storageService = require('../../src/services/storage.service').default;
      const token = await storageService.getAccessToken();
      
      // API_BASE_URL inclut déjà /api, donc on n'ajoute que /drivers/...
      const uploadUrl = `${API_BASE_URL}/drivers/${driverId}/documents/upload`;
      
      const response = await axios.post(
        uploadUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      setUploadProgress(100);
      
      // La réponse devrait être { success: true, data: { kyc_complete: ... } }
      const uploadResult = response.data.data || response.data;
      const { kyc_complete } = uploadResult;

      Alert.alert(
        "Succès !",
        kyc_complete
          ? "Tous vos documents ont été envoyés avec succès. Votre compte sera validé sous peu."
          : `${docCount} document(s) envoyé(s). Complétez les documents manquants pour validation.`,
        [
          {
            text: "OK",
            onPress: () => {
              if (kyc_complete) {
                // Rediriger vers le profil pour voir le statut "En attente"
                router.replace("/(tabs)/profile");
              }
            },
          },
        ]
      );

      // Marquer les documents uploadés
      setDocuments((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          if (updated[key as keyof Documents].uri) {
            updated[key as keyof Documents].uploaded = true;
          }
        }
        return updated;
      });
    } catch (error: any) {
      console.error("Erreur upload:", error);
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Impossible d'envoyer les documents"
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const allDocumentsSelected = Object.values(documents).every(
    (doc) => doc.uri !== null
  );
  const anyDocumentSelected = Object.values(documents).some(
    (doc) => doc.uri !== null
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#333"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compléter mon profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Pour devenir chauffeur, vous devez fournir les documents suivants.
            Tous les documents sont obligatoires.
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {Object.values(documents).filter((d) => d.uri !== null).length} / 7
            documents
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (Object.values(documents).filter((d) => d.uri !== null)
                      .length /
                      7) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        {(Object.keys(documents) as Array<keyof Documents>).map((docType) => (
          <TouchableOpacity
            key={docType}
            style={[
              styles.documentCard,
              documents[docType].uri && styles.documentCardSelected,
              documents[docType].uploaded && styles.documentCardUploaded,
            ]}
            onPress={() =>
              !documents[docType].uploaded && showImagePickerOptions(docType)
            }
            disabled={documents[docType].uploaded}
          >
            <View style={styles.documentLeft}>
              <View style={styles.iconContainer}>
                {documents[docType].uri ? (
                  documents[docType].uploaded ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.success}
                    />
                  ) : (
                    <Ionicons
                      name="image"
                      size={24}
                      color={colors.primary}
                    />
                  )
                ) : (
                  <Ionicons
                    name="camera"
                    size={24}
                    color="#999"
                  />
                )}
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentLabel}>
                  {documentLabels[docType]}
                </Text>
                <Text style={styles.documentStatus}>
                  {documents[docType].uploaded
                    ? "Envoyé ✓"
                    : documents[docType].uri
                    ? "Prêt à envoyer"
                    : "Aucune photo"}
                </Text>
              </View>
            </View>

            {documents[docType].uri && !documents[docType].uploaded && (
              <Image
                source={{ uri: documents[docType].uri! }}
                style={styles.thumbnail}
              />
            )}

            {!documents[docType].uploaded && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#999"
              />
            )}
          </TouchableOpacity>
        ))}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.uploadProgressContainer}>
            <Text style={styles.uploadProgressText}>
              Envoi en cours... {uploadProgress}%
            </Text>
            <View style={styles.uploadProgressBar}>
              <View
                style={[
                  styles.uploadProgressFill,
                  { width: `${uploadProgress}%` },
                ]}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!anyDocumentSelected || loading) && styles.uploadButtonDisabled,
          ]}
          onPress={uploadDocuments}
          disabled={!anyDocumentSelected || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {allDocumentsSelected
                  ? "Envoyer tous les documents"
                  : "Envoyer les documents sélectionnés"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  documentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F5F9FF",
  },
  documentCardUploaded: {
    borderColor: colors.success,
    backgroundColor: "#F0F9F4",
  },
  documentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  documentStatus: {
    fontSize: 13,
    color: "#999",
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  uploadProgressContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  uploadProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  uploadProgressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  uploadProgressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  uploadButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#999",
    opacity: 0.5,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
