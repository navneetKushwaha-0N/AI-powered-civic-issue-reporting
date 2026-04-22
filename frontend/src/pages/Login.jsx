import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-sky-500/25 blur-[120px] top-[-100px] left-[-100px] rounded-full"></div>
      <div className="absolute w-[400px] h-[400px] bg-teal-400/20 blur-[120px] bottom-[-100px] right-[-100px] rounded-full"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-semibold text-white">
            Welcome Back
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Sign in to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-teal-400 text-white hover:opacity-90 transition-all duration-300 rounded-xl"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;