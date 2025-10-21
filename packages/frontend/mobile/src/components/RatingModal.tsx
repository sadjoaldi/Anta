/**
 * Rating Modal
 * Allows passengers to rate drivers after a ride
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import reviewsService from '../services/reviews.service';
import colors from '../theme/colors';

interface RatingModalProps {
  visible: boolean;
  rideId: number;
  reviewedId: number;
  reviewedName: string;
  reviewerType: 'passenger' | 'driver';
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const RATING_CATEGORIES = [
  { key: 'cleanliness', label: 'Propreté', icon: 'sparkles' },
  { key: 'punctuality', label: 'Ponctualité', icon: 'time' },
  { key: 'communication', label: 'Communication', icon: 'chatbubbles' },
  { key: 'safety', label: 'Sécurité', icon: 'shield-checkmark' },
];

const PREDEFINED_TAGS = [
  'Sympathique',
  'Ponctuel',
  'Conduite sûre',
  'Véhicule propre',
  'Trajet agréable',
  'Bonne musique',
  'Conversation intéressante',
  'Respectueux',
];

export default function RatingModal({
  visible,
  rideId,
  reviewedId,
  reviewedName,
  reviewerType,
  onClose,
  onSubmitSuccess,
}: RatingModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 0,
    punctuality: 0,
    communication: 0,
    safety: 0,
  });
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert('Note requise', 'Veuillez donner une note globale');
      return;
    }

    try {
      setSubmitting(true);

      await reviewsService.createReview({
        rideId,
        reviewedId,
        reviewerType,
        rating: overallRating,
        ratingCleanliness: categoryRatings.cleanliness || undefined,
        ratingPunctuality: categoryRatings.punctuality || undefined,
        ratingCommunication: categoryRatings.communication || undefined,
        ratingSafety: categoryRatings.safety || undefined,
        comment: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      Alert.alert('Merci !', 'Votre avis a été enregistré avec succès.');
      
      // Reset form
      setOverallRating(0);
      setCategoryRatings({
        cleanliness: 0,
        punctuality: 0,
        communication: 0,
        safety: 0,
      });
      setComment('');
      setSelectedTags([]);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      onClose();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de soumettre l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, onPress: (star: number) => void) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)} activeOpacity={0.7}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color="#FFC107"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSmallStars = (rating: number, onPress: (star: number) => void) => {
    return (
      <View style={styles.smallStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)} activeOpacity={0.7}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={20}
              color="#FFC107"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notez votre course</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Driver Info */}
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
              <Text style={styles.driverName}>{reviewedName}</Text>
              <Text style={styles.subtitle}>
                {reviewerType === 'passenger' ? 'Votre chauffeur' : 'Votre passager'}
              </Text>
            </View>

            {/* Overall Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Note globale *</Text>
              {renderStars(overallRating, setOverallRating)}
            </View>

            {/* Category Ratings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes détaillées (optionnel)</Text>
              {RATING_CATEGORIES.map((category) => (
                <View key={category.key} style={styles.categoryRow}>
                  <View style={styles.categoryLabel}>
                    <Ionicons name={category.icon as any} size={20} color={colors.primary} />
                    <Text style={styles.categoryText}>{category.label}</Text>
                  </View>
                  {renderSmallStars(
                    categoryRatings[category.key as keyof typeof categoryRatings],
                    (star) =>
                      setCategoryRatings({
                        ...categoryRatings,
                        [category.key]: star,
                      })
                  )}
                </View>
              ))}
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Points forts (optionnel)</Text>
              <View style={styles.tagsContainer}>
                {PREDEFINED_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      selectedTags.includes(tag) && styles.tagSelected,
                    ]}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.tagTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Commentaire (optionnel)</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Partagez votre expérience..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.charCount}>{comment.length}/500</Text>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Envoyer mon avis</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  driverInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  driverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  smallStars: {
    flexDirection: 'row',
    gap: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  commentInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1a1a1a',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
