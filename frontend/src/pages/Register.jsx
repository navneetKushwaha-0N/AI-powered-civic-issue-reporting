import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import OTPModal from '../components/OTPModal';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpVerifiedToken, setOtpVerifiedToken] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Check if phone is 10 digits
  const isPhoneValid = /^[0-9]{10}$/.test(formData.phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    // Reset phone verification if phone number changes
    if (name === 'phone' && isPhoneVerified) {
      setIsPhoneVerified(false);
      setOtpVerifiedToken('');
    }
  };

  const handleSendOTP = async () => {
    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOTP(true);
    setError('');

    try {
      const response = await authAPI.sendOTP(formData.phone);
      console.log('OTP sent:', response.data); // Shows OTP in dev mode
      setShowOTPModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    const response = await authAPI.verifyOTP(formData.phone, otp);
    setOtpVerifiedToken(response.data.data.otpVerifiedToken);
    setIsPhoneVerified(true);
    setShowOTPModal(false);
  };

  const handleResendOTP = async () => {
    await authAPI.sendOTP(formData.phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate phone verification
    if (!isPhoneVerified) {
      setError('Please verify your phone number first');
      return;
    }

    // Validate phone number format
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register({ ...userData, otpVerifiedToken });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
            disabled={!isPhoneVerified}
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            disabled={!isPhoneVerified}
          />

          {/* Phone Number with OTP Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
                maxLength={10}
                disabled={isPhoneVerified}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  isPhoneVerified
                    ? 'border-green-500 bg-green-50 pr-24'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                } ${isPhoneVerified ? 'cursor-not-allowed' : ''}`}
              />
              
              {/* Verify Button or Verified Badge */}
              {isPhoneVerified ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Verified</span>
                </div>
              ) : isPhoneValid && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOTP}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingOTP ? 'Sending...' : 'Verify'}
                </button>
              )}
            </div>
          </div>

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Minimum 6 characters"
            disabled={!isPhoneVerified}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Re-enter your password"
            disabled={!isPhoneVerified}
          />

          <Button
            type="submit"
            disabled={loading || !isPhoneVerified}
            className="w-full"
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        {/* OTP Modal */}
        <OTPModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          phone={formData.phone}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
        />
      </div>
    </div>
  );
};

export default Register;
