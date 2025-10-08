import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCsvResponse } from '../utils/csvExport.js';
import knex from '../utils/knex.js';

/**
 * @desc    Export users to CSV
 * @route   GET /api/export/users
 * @access  Private/Admin
 */
export const exportUsers = asyncHandler(async (req: Request, res: Response) => {
  const role = req.query.role as string;
  const is_active = req.query.is_active as string;

  let query = knex('users').select(
    'id',
    'name',
    'phone',
    'email',
    'role',
    'is_active',
    'created_at',
    'last_login_at'
  );

  if (role) query = query.where('role', role);
  if (is_active !== undefined) query = query.where('is_active', is_active === 'true');

  const users = await query.orderBy('created_at', 'desc');

  // Format dates
  const formattedUsers = users.map(user => ({
    ID: user.id,
    Nom: user.name || '',
    Téléphone: user.phone,
    Email: user.email || '',
    Rôle: user.role,
    Actif: user.is_active ? 'Oui' : 'Non',
    'Date création': new Date(user.created_at).toLocaleString('fr-FR'),
    'Dernière connexion': user.last_login_at ? new Date(user.last_login_at).toLocaleString('fr-FR') : 'Jamais',
  }));

  const filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
  sendCsvResponse(res, formattedUsers, filename);
});

/**
 * @desc    Export drivers to CSV
 * @route   GET /api/export/drivers
 * @access  Private/Admin
 */
export const exportDrivers = asyncHandler(async (req: Request, res: Response) => {
  const kyc_status = req.query.kyc_status as string;

  let query = knex('drivers')
    .join('users', 'drivers.user_id', 'users.id')
    .select(
      'drivers.id',
      'users.name',
      'users.phone',
      'drivers.license_number',
      'drivers.vehicle_model',
      'drivers.vehicle_plate',
      'drivers.kyc_status',
      'drivers.is_verified',
      'drivers.status',
      'drivers.created_at'
    );

  if (kyc_status) query = query.where('drivers.kyc_status', kyc_status);

  const drivers = await query.orderBy('drivers.created_at', 'desc');

  const formattedDrivers = drivers.map(driver => ({
    ID: driver.id,
    Nom: driver.name,
    Téléphone: driver.phone,
    'Numéro permis': driver.license_number || '',
    'Modèle véhicule': driver.vehicle_model || '',
    Plaque: driver.vehicle_plate || '',
    'Statut KYC': driver.kyc_status,
    Vérifié: driver.is_verified ? 'Oui' : 'Non',
    Statut: driver.status,
    'Date inscription': new Date(driver.created_at).toLocaleString('fr-FR'),
  }));

  const filename = `drivers_${new Date().toISOString().split('T')[0]}.csv`;
  sendCsvResponse(res, formattedDrivers, filename);
});

/**
 * @desc    Export trips to CSV
 * @route   GET /api/export/trips
 * @access  Private/Admin
 */
export const exportTrips = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string;
  const date_from = req.query.date_from as string;
  const date_to = req.query.date_to as string;

  let query = knex('trips')
    .leftJoin('users as passenger', 'trips.passenger_id', 'passenger.id')
    .leftJoin('users as driver', 'trips.driver_id', 'driver.id')
    .select(
      'trips.id',
      'passenger.name as passenger_name',
      'driver.name as driver_name',
      'trips.origin_text',
      'trips.dest_text',
      'trips.distance_m',
      'trips.price_estimated',
      'trips.price_final',
      'trips.status',
      'trips.payment_method',
      'trips.payment_status',
      'trips.created_at',
      'trips.ended_at'
    );

  if (status) query = query.where('trips.status', status);
  if (date_from) query = query.where('trips.created_at', '>=', date_from);
  if (date_to) query = query.where('trips.created_at', '<=', date_to);

  const trips = await query.orderBy('trips.created_at', 'desc');

  const formattedTrips = trips.map(trip => ({
    ID: trip.id,
    Passager: trip.passenger_name || 'N/A',
    Chauffeur: trip.driver_name || 'N/A',
    Départ: trip.origin_text,
    Arrivée: trip.dest_text,
    'Distance (km)': (trip.distance_m / 1000).toFixed(2),
    'Prix estimé (FG)': trip.price_estimated,
    'Prix final (FG)': trip.price_final || trip.price_estimated,
    Statut: trip.status,
    'Méthode paiement': trip.payment_method || 'N/A',
    'Statut paiement': trip.payment_status,
    'Date création': new Date(trip.created_at).toLocaleString('fr-FR'),
    'Date fin': trip.ended_at ? new Date(trip.ended_at).toLocaleString('fr-FR') : 'N/A',
  }));

  const filename = `trips_${new Date().toISOString().split('T')[0]}.csv`;
  sendCsvResponse(res, formattedTrips, filename);
});

/**
 * @desc    Export payments to CSV
 * @route   GET /api/export/payments
 * @access  Private/Admin
 */
export const exportPayments = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string;
  const method = req.query.method as string;
  const date_from = req.query.date_from as string;
  const date_to = req.query.date_to as string;

  let query = knex('payments')
    .join('trips', 'payments.trip_id', 'trips.id')
    .leftJoin('users as passenger', 'trips.passenger_id', 'passenger.id')
    .select(
      'payments.id',
      'payments.trip_id',
      'passenger.name as passenger_name',
      'trips.origin_text',
      'trips.dest_text',
      'payments.amount',
      'payments.currency',
      'payments.method',
      'payments.status',
      'payments.provider_ref',
      'payments.created_at'
    );

  if (status) query = query.where('payments.status', status);
  if (method) query = query.where('payments.method', method);
  if (date_from) query = query.where('payments.created_at', '>=', date_from);
  if (date_to) query = query.where('payments.created_at', '<=', date_to);

  const payments = await query.orderBy('payments.created_at', 'desc');

  const formattedPayments = payments.map(payment => ({
    'ID Paiement': payment.id,
    'ID Course': payment.trip_id,
    Passager: payment.passenger_name || 'N/A',
    Départ: payment.origin_text,
    Arrivée: payment.dest_text,
    'Montant (FG)': payment.amount,
    Devise: payment.currency,
    Méthode: payment.method,
    Statut: payment.status,
    'Référence provider': payment.provider_ref || 'N/A',
    Date: new Date(payment.created_at).toLocaleString('fr-FR'),
  }));

  const filename = `payments_${new Date().toISOString().split('T')[0]}.csv`;
  sendCsvResponse(res, formattedPayments, filename);
});

/**
 * @desc    Export promotions to CSV
 * @route   GET /api/export/promotions
 * @access  Private/Admin
 */
export const exportPromotions = asyncHandler(async (req: Request, res: Response) => {
  const promotions = await knex('promotions')
    .select('*')
    .orderBy('created_at', 'desc');

  const formattedPromotions = promotions.map(promo => ({
    ID: promo.id,
    Code: promo.code,
    Description: promo.description || '',
    Type: promo.type === 'percentage' ? 'Pourcentage' : 'Montant fixe',
    Valeur: promo.value,
    'Montant min course': promo.min_trip_amount || 'N/A',
    'Réduction max': promo.max_discount || 'N/A',
    "Limite d'utilisations": promo.usage_limit || 'Illimité',
    'Nombre utilisations': promo.usage_count,
    'Limite par user': promo.usage_per_user || 'Illimité',
    Actif: promo.is_active ? 'Oui' : 'Non',
    'Valide du': promo.valid_from ? new Date(promo.valid_from).toLocaleString('fr-FR') : 'N/A',
    "Valide jusqu'au": promo.valid_until ? new Date(promo.valid_until).toLocaleString('fr-FR') : 'N/A',
    'Date création': new Date(promo.created_at).toLocaleString('fr-FR'),
  }));

  const filename = `promotions_${new Date().toISOString().split('T')[0]}.csv`;
  sendCsvResponse(res, formattedPromotions, filename);
});
