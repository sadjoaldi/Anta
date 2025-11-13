import apiClient from './api.client';

export interface DriverProfileStatus {
  isComplete: boolean;
  missingDocuments: string[];
  kycStatus: 'pending' | 'approved' | 'rejected';
  hasAllDocuments: boolean;
}

class DriverProfileService {
  /**
   * Vérifier le statut du profil du chauffeur
   */
  async checkProfileStatus(userId: number): Promise<DriverProfileStatus> {
    try {
      // Récupérer le driver
      // Note: apiClient.get() retourne déjà response.data.data (le driver directement)
      const driver = await apiClient.get(`/drivers/user/${userId}`);
      
      // Vérifier que le driver existe
      if (!driver || !driver.id) {
        throw new Error('Driver not found');
      }

      // Parser les documents KYC
      let kycDocuments: any = {};
      if (driver.kyc_documents) {
        try {
          kycDocuments = typeof driver.kyc_documents === 'string'
            ? JSON.parse(driver.kyc_documents)
            : driver.kyc_documents;
        } catch (error) {
          console.error('Error parsing KYC documents:', error);
        }
      }

      // Vérifier les documents requis
      const requiredDocs = [
        'photo_profil',
        'photo_cni_recto',
        'photo_cni_verso',
        'photo_permis_recto',
        'photo_permis_verso',
        'photo_carte_grise',
        'photo_vehicule',
      ];

      const missingDocuments = requiredDocs.filter(doc => !kycDocuments[doc]);
      const hasAllDocuments = missingDocuments.length === 0;

      return {
        isComplete: hasAllDocuments && driver.kyc_status === 'approved',
        missingDocuments,
        kycStatus: driver.kyc_status || 'pending',
        hasAllDocuments,
      };
    } catch (error: any) {
      console.error('Error checking profile status:', error);
      throw error;
    }
  }

  /**
   * Vérifier si le profil nécessite une complétion
   */
  async needsProfileCompletion(userId: number): Promise<boolean> {
    try {
      const status = await this.checkProfileStatus(userId);
      return !status.hasAllDocuments || status.kycStatus === 'rejected';
    } catch (error: any) {
      // Si le driver n'existe pas encore (404), il faut créer le profil d'abord
      if (error.response?.status === 404) {
        return true;
      }
      // Pour d'autres erreurs, on considère aussi qu'il faut compléter
      return true;
    }
  }

  /**
   * Créer un profil driver pour l'utilisateur
   */
  async createDriverProfile(userId: number): Promise<any> {
    try {
      // Note: apiClient.post() retourne déjà les données (pas response.data)
      const driver = await apiClient.post('/drivers', {
        user_id: userId,
        status: 'offline',
        kyc_status: 'pending',
      });
      return driver;
    } catch (error: any) {
      console.error('Error creating driver profile:', error);
      throw error;
    }
  }
}

export default new DriverProfileService();
