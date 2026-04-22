import { useState } from 'react';
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
  const [devOtp, setDevOtp] = useState(null); // ✅ 1. devOtp state add kiya
  const { register } = useAuth();
  const navigate = useNavigate();

  const isPhoneValid = /^[0-9]{10}$/.test(formData.phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    if (name === 'phone' && isPhoneVerified) {
      setIsPhoneVerified(false);
      setOtpVerifiedToken('');
      setDevOtp(null); // phone badla toh devOtp clear
    }
  };

  const handleSendOTP = async () => {
    if (!isPhoneValid) {
      setError('Enter valid 10 digit phone');
      return;
    }

    setSendingOTP(true);
    setError('');

    try {
      const res = await authAPI.sendOTP(formData.phone);
      if (res.data.otp) setDevOtp(res.data.otp); // ✅ 2. devOtp capture kiya
      setShowOTPModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP failed');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    const res = await authAPI.verifyOTP(formData.phone, otp);
    setOtpVerifiedToken(res.data.data.otpVerifiedToken);
    setIsPhoneVerified(true);
    setShowOTPModal(false);
    setDevOtp(null); // verified hone ke baad clear
  };

  const handleResendOTP = async () => {
    const res = await authAPI.sendOTP(formData.phone);
    if (res.data.otp) setDevOtp(res.data.otp); // ✅ resend pe bhi update
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPhoneVerified) {
      setError('Verify phone first');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register({ ...userData, otpVerifiedToken });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] relative overflow-hidden px-4">

      {/* glow */}
      <div className="absolute w-[500px] h-[500px] bg-sky-500/25 blur-[120px] top-[-100px] left-[-100px] rounded-full"></div>
      <div className="absolute w-[400px] h-[400px] bg-teal-400/20 blur-[120px] bottom-[-100px] right-[-100px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

        {/* heading */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-semibold text-white">
            Create Account
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>

          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
            disabled={!isPhoneVerified}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            disabled={!isPhoneVerified}
          />

          {/* phone */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Phone Number
            </label>

            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                disabled={isPhoneVerified}
                placeholder="10 digit number"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isPhoneVerified ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              />

              {isPhoneVerified ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">
                  ✓ Verified
                </span>
              ) : isPhoneValid && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOTP}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-sky-500 to-teal-400 text-white"
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
            placeholder="Min 6 chars"
            disabled={!isPhoneVerified}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Re-enter password"
            disabled={!isPhoneVerified}
          />

          <Button
            type="submit"
            disabled={loading || !isPhoneVerified}
            className="w-full bg-gradient-to-r from-sky-500 to-teal-400 text-white hover:opacity-90 transition rounded-xl"
          >
            {loading ? 'Creating...' : 'Register'}
          </Button>
        </form>

        {/* ✅ 3. devOtp prop pass kiya */}
        <OTPModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          phone={formData.phone}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          devOtp={devOtp}
        />
      </div>
    </div>
  );
};

export default Register;