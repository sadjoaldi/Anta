import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../src/theme/colors';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = params.phone as string;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<TextInput[]>([]);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-validate when 4 digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      Alert.alert('Code incomplet', 'Veuillez saisir les 4 chiffres');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Call API to verify OTP
      // await authService.verifyOtp(phone, code);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation (accept any 4-digit code for now)
      Alert.alert('Vérification réussie', 'Votre numéro a été confirmé !', [
        {
          text: 'Continuer',
          onPress: () => router.push({
            pathname: '/auth/complete-profile',
            params: { phone }
          })
        }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Code invalide. Veuillez réessayer.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      
      // TODO: Call API to resend OTP
      // await authService.sendOtp(phone);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé par SMS');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de renvoyer le code');
    } finally {
      setLoading(false);
    }
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    // +224612345678 -> +224 XXX XX XX 78
    const last2 = phone.slice(-2);
    const prefix = phone.slice(0, 4);
    return `${prefix} XXX XX XX ${last2}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Un code à 4 chiffres a été envoyé au
          </Text>
          <Text style={styles.phone}>{maskPhone(phone)}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                loading && styles.otpInputDisabled
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              selectTextOnFocus
              autoFocus={index === 0}
              placeholder="0"
              placeholderTextColor="#ccc"
            />
          ))}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Vérification...</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend || loading}
            style={styles.resendButton}
          >
            <Text style={[
              styles.resendText,
              !canResend && styles.resendTextDisabled
            ]}>
              {canResend ? 'Renvoyer le code' : `Renvoyer dans ${resendTimer}s`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            style={styles.changeNumberButton}
          >
            <Text style={styles.changeNumberText}>Modifier le numéro</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a1a',
    backgroundColor: '#f9f9f9',
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    marginTop: 32,
    alignItems: 'center',
    gap: 16,
  },
  resendButton: {
    padding: 12,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  resendTextDisabled: {
    color: '#999',
  },
  changeNumberButton: {
    padding: 12,
  },
  changeNumberText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
});
