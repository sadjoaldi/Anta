/**
 * Driver Details Modal
 * Shows comprehensive driver information including reviews and sharing options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

interface DriverReview {
  id: number;
  passenger_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface DriverDetails {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  photo?: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_plate: string;
  vehicle_type: string;
  rating_avg: number;
  total_trips: number;
  total_reviews: number;
  badges: string[];
  recent_reviews: DriverReview[];
  member_since: string;
}

interface DriverDetailsModalProps {
  visible: boolean;
  driver: DriverDetails | null;
  tripInfo?: {
    origin: string;
    destination: string;
    estimatedPrice: number;
  };
  onClose: () => void;
  onSelectDriver?: () => void;
}

export default function DriverDetailsModal({
  visible,
  driver,
  tripInfo,
  onClose,
  onSelectDriver,
}: DriverDetailsModalProps) {
  if (!driver) return null;

  const handleShareToContact = async () => {
    const message = `🚗 Info Chauffeur ANTA - Sécurité\n\n` +
      `👤 Chauffeur: ${driver.name}\n` +
      `📞 Tél: ${driver.phone}\n` +
      `🚙 Véhicule: ${driver.vehicle_color} ${driver.vehicle_brand} ${driver.vehicle_model}\n` +
      `🔢 Plaque: ${driver.vehicle_plate}\n` +
      `⭐ Note: ${driver.rating_avg}/5 (${driver.total_trips} courses)\n\n` +
      (tripInfo ? `📍 Trajet:\nDe: ${tripInfo.origin}\nÀ: ${tripInfo.destination}\n💰 Prix: ${tripInfo.estimatedPrice.toLocaleString()} GNF\n\n` : '') +
      `Je partage ces infos par sécurité. Je te préviendrai quand j'arrive ! 🙏`;

    try {
      await Share.share({
        message,
        title: 'Info Chauffeur ANTA',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCallDriver = () => {
    Linking.openURL(`tel:${driver.phone}`);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-outline'}
            size={16}
            color="#FFC107"
          />
        ))}
      </View>
    );
  };

  const getBadgeIcon = (badge: string) => {
    const icons: { [key: string]: string } = {
      'top_driver': '🏆',
      'punctual': '⏰',
      'friendly': '😊',
      'clean_vehicle': '✨',
      'safe_driver': '🛡️',
      'experienced': '🎓',
    };
    return icons[badge] || '⭐';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
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
            <Text style={styles.headerTitle}>Détails du chauffeur</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Driver Profile */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {driver.photo ? (
                  <Image source={{ uri: driver.photo }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={48} color={colors.primary} />
                  </View>
                )}
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(driver.rating_avg)}
                  <Text style={styles.ratingText}>
                    {driver.rating_avg.toFixed(1)} ({driver.total_reviews} avis)
                  </Text>
                </View>
                <Text style={styles.memberSince}>
                  Membre depuis {formatDate(driver.member_since)}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="car-outline" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{driver.total_trips}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="star" size={24} color="#FFC107" />
                <Text style={styles.statValue}>{driver.rating_avg.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Note</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                <Text style={styles.statValue}>Vérifié</Text>
                <Text style={styles.statLabel}>Sécurité</Text>
              </View>
            </View>

            {/* Badges */}
            {driver.badges && driver.badges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏅 Badges</Text>
                <View style={styles.badgesContainer}>
                  {driver.badges.map((badge, index) => (
                    <View key={index} style={styles.badge}>
                      <Text style={styles.badgeIcon}>{getBadgeIcon(badge)}</Text>
                      <Text style={styles.badgeText}>
                        {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Vehicle Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗 Véhicule</Text>
              <View style={styles.vehicleCard}>
                <View style={styles.vehicleRow}>
                  <Ionicons name="car-sport" size={20} color={colors.primary} />
                  <Text style={styles.vehicleText}>
                    {driver.vehicle_color} {driver.vehicle_brand} {driver.vehicle_model}
                  </Text>
                </View>
                <View style={styles.vehicleRow}>
                  <Ionicons name="card-outline" size={20} color={colors.primary} />
                  <Text style={styles.vehicleText}>Plaque: {driver.vehicle_plate}</Text>
                </View>
                <View style={styles.vehicleRow}>
                  <Ionicons name="construct-outline" size={20} color={colors.primary} />
                  <Text style={styles.vehicleText}>Type: {driver.vehicle_type}</Text>
                </View>
              </View>
            </View>

            {/* Reviews */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💬 Derniers avis</Text>
              {driver.recent_reviews && driver.recent_reviews.length > 0 ? (
                driver.recent_reviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Ionicons name="person" size={16} color="#fff" />
                      </View>
                      <View style={styles.reviewInfo}>
                        <Text style={styles.reviewName}>{review.passenger_name}</Text>
                        {renderStars(review.rating)}
                      </View>
                      <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noReviews}>Aucun avis pour le moment</Text>
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareToContact}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={20} color={colors.primary} />
              <Text style={styles.shareButtonText}>Partager à un proche</Text>
            </TouchableOpacity>

            {onSelectDriver && (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={onSelectDriver}
                activeOpacity={0.8}
              >
                <Text style={styles.selectButtonText}>Choisir ce chauffeur</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  driverName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  memberSince: {
    fontSize: 13,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  vehicleCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noReviews: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
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
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
