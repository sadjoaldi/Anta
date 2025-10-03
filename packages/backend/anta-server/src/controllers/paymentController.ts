import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Payment from '../models/Payment.js';
import { PaymentStatus } from '../models/types.js';

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private/Admin
 */
export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const payments = await Payment.findAll(undefined, limit, offset);
  const total = await Payment.count();

  res.json(ApiResponse.paginated(payments, page, limit, total));
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw ApiError.notFound('Payment');
  }

  res.json(ApiResponse.success(payment));
});

/**
 * @desc    Get payments by trip
 * @route   GET /api/payments/trip/:tripId
 * @access  Private
 */
export const getPaymentsByTrip = asyncHandler(async (req: Request, res: Response) => {
  const tripId = parseInt(req.params.tripId);

  const payments = await Payment.getByTrip(tripId);

  res.json(ApiResponse.success(payments));
});

/**
 * @desc    Get payments by status
 * @route   GET /api/payments/status/:status
 * @access  Private/Admin
 */
export const getPaymentsByStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = req.params.status as PaymentStatus;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const payments = await Payment.getByStatus(status, limit, offset);
  const total = await Payment.count({ status });

  res.json(ApiResponse.paginated(payments, page, limit, total));
});

/**
 * @desc    Get total revenue
 * @route   GET /api/payments/revenue/total
 * @access  Private/Admin
 */
export const getTotalRevenue = asyncHandler(async (_req: Request, res: Response) => {
  const revenue = await Payment.getTotalRevenue();

  res.json(ApiResponse.success({ revenue }));
});

/**
 * @desc    Get revenue by date range
 * @route   GET /api/payments/revenue/range
 * @access  Private/Admin
 */
export const getRevenueByDateRange = asyncHandler(async (req: Request, res: Response) => {
  const startDate = new Date(req.query.startDate as string);
  const endDate = new Date(req.query.endDate as string);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw ApiError.badRequest('Invalid date format');
  }

  const revenue = await Payment.getRevenueByDateRange(startDate, endDate);

  res.json(ApiResponse.success({ revenue, startDate, endDate }));
});

/**
 * @desc    Create new payment
 * @route   POST /api/payments
 * @access  Private
 */
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { trip_id, amount, currency, method, provider_ref, status } = req.body;

  const paymentId = await Payment.create({
    trip_id,
    amount,
    currency: currency || 'EUR',
    method,
    provider_ref,
    status: status || 'pending'
  });

  const payment = await Payment.findById(paymentId);
  res.status(201).json(ApiResponse.success(payment));
});

/**
 * @desc    Update payment
 * @route   PUT /api/payments/:id
 * @access  Private
 */
export const updatePayment = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw ApiError.notFound('Payment');
  }

  await Payment.updateById(paymentId, req.body);
  const updatedPayment = await Payment.findById(paymentId);

  res.json(ApiResponse.success(updatedPayment));
});

/**
 * @desc    Update payment status
 * @route   PATCH /api/payments/:id/status
 * @access  Private
 */
export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  const { status, provider_ref } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw ApiError.notFound('Payment');
  }

  await Payment.updateStatus(paymentId, status, provider_ref);
  const updatedPayment = await Payment.findById(paymentId);

  res.json(ApiResponse.success(updatedPayment));
});

/**
 * @desc    Delete payment
 * @route   DELETE /api/payments/:id
 * @access  Private/Admin
 */
export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw ApiError.notFound('Payment');
  }

  await Payment.deleteById(paymentId);
  res.json(ApiResponse.success({ message: 'Payment deleted successfully' }));
});
