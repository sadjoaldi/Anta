/**
 * OTP Service for phone verification
 * Supports SMS sending and dev bypass mode
 */

import knex from '../utils/knex.js';
import { ApiError } from '../utils/ApiError.js';

const OTP_LENGTH = 4;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

// DEV MODE: Bypass OTP (set to false in production)
const DEV_BYPASS_OTP = process.env.DEV_BYPASS_OTP === 'true';
const DEV_BYPASS_CODE = '1234';

interface OTPRecord {
  id: number;
  phone: string;
  code: string;
  purpose: string;
  attempts: number;
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
}

/**
 * Generate a random OTP code
 */
function generateOTPCode(): string {
  if (DEV_BYPASS_OTP) {
    return DEV_BYPASS_CODE;
  }
  
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Send OTP via SMS (or mock in dev)
 */
async function sendSMS(phone: string, code: string): Promise<void> {
  if (DEV_BYPASS_OTP) {
    console.log(`🔧 DEV MODE: OTP bypass enabled. Code: ${code} for ${phone}`);
    return;
  }

  // TODO: Integrate real SMS provider (Twilio, AfricasTalking, etc.)
  // Example with Twilio:
  // const twilioClient = twilio(accountSid, authToken);
  // await twilioClient.messages.create({
  //   body: `Votre code ANTA: ${code}`,
  //   from: '+1234567890',
  //   to: phone
  // });

  console.log(`📱 SMS sent to ${phone}: ${code}`);
  
  // For now, just log (replace with real SMS integration)
  // throw new Error('SMS provider not configured');
}

/**
 * Send OTP code to phone number
 */
export async function sendOTP(
  phone: string,
  purpose: 'registration' | 'login' | 'reset_password' = 'registration'
): Promise<{ success: boolean; expiresIn: number }> {
  try {
    // Validate phone format
    if (!phone.startsWith('+224') || phone.length < 12) {
      throw ApiError.badRequest('Invalid phone number format. Must be +224XXXXXXXXX');
    }

    // Check for existing active OTP (rate limiting)
    const existingOTP = await knex<OTPRecord>('otp_codes')
      .where({ phone, purpose })
      .whereNull('verified_at')
      .where('expires_at', '>', knex.fn.now())
      .orderBy('created_at', 'desc')
      .first();

    if (existingOTP) {
      const timeLeft = Math.ceil(
        (new Date(existingOTP.expires_at).getTime() - Date.now()) / 1000
      );
      
      if (timeLeft > 0) {
        throw ApiError.tooManyRequests(
          `An OTP was already sent. Please wait ${timeLeft} seconds before requesting a new one.`
        );
      }
    }

    // Generate new OTP
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP in database
    await knex('otp_codes').insert({
      phone,
      code,
      purpose,
      expires_at: expiresAt,
      attempts: 0,
    });

    // Send SMS
    await sendSMS(phone, code);

    return {
      success: true,
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Send OTP error:', error);
    throw ApiError.internal('Failed to send OTP');
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  phone: string,
  code: string,
  purpose: 'registration' | 'login' | 'reset_password' = 'registration'
): Promise<{ success: boolean }> {
  try {
    // Find active OTP
    const otpRecord = await knex<OTPRecord>('otp_codes')
      .where({ phone, purpose })
      .whereNull('verified_at')
      .where('expires_at', '>', knex.fn.now())
      .orderBy('created_at', 'desc')
      .first();

    if (!otpRecord) {
      throw ApiError.badRequest('Invalid or expired OTP code');
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      throw ApiError.badRequest('Maximum verification attempts exceeded. Please request a new code.');
    }

    // Verify code
    if (otpRecord.code !== code) {
      // Increment attempts
      await knex('otp_codes')
        .where({ id: otpRecord.id })
        .increment('attempts', 1);

      throw ApiError.unauthorized('Invalid OTP code');
    }

    // Mark as verified
    await knex('otp_codes')
      .where({ id: otpRecord.id })
      .update({ verified_at: knex.fn.now() });

    // Update user phone_verified if registration
    if (purpose === 'registration') {
      await knex('users')
        .where({ phone })
        .update({
          phone_verified: true,
          phone_verified_at: knex.fn.now(),
        });
    }

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Verify OTP error:', error);
    throw ApiError.internal('Failed to verify OTP');
  }
}

/**
 * Check if phone has verified OTP for purpose
 */
export async function hasVerifiedOTP(
  phone: string,
  purpose: 'registration' | 'login' | 'reset_password' = 'registration'
): Promise<boolean> {
  const verified = await knex('otp_codes')
    .where({ phone, purpose })
    .whereNotNull('verified_at')
    .orderBy('created_at', 'desc')
    .first();

  return !!verified;
}

/**
 * Clean up expired OTP codes (run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  const deleted = await knex('otp_codes')
    .where('expires_at', '<', knex.fn.now())
    .del();

  console.log(`🧹 Cleaned up ${deleted} expired OTP codes`);
  return deleted;
}

export default {
  sendOTP,
  verifyOTP,
  hasVerifiedOTP,
  cleanupExpiredOTPs,
};
