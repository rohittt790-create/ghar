import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'project_manager' | 'contractor' | 'owner'>('project_manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setError('');
    }
  }, [isOpen, initialMode]);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await register({ name, email, password, role });
      } else {
        await login({ email, password });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Create KAILASH BHAWAN Account' : 'KAILASH BHAWAN System Sign In'}
      subtitle="Role-based access control for construction managers and clients."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {isRegister && (
          <div>
            <Input
              label="Full Name"
              required
              placeholder="e.g. Alex Henderson"
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-sm rounded-lg border border-slate-300 py-2.5 px-3 bg-white"
              >
                <option value="project_manager">Project Manager</option>
                <option value="admin">Chief Administrator</option>
                <option value="contractor">Subcontractor</option>
                <option value="owner">Home Owner</option>
              </select>
            </div>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="admin@hometrack.com"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button variant="primary" type="submit" loading={loading} className="w-full">
          {isRegister ? 'Register Account' : 'Sign In'}
        </Button>



        <div className="text-center text-xs text-slate-500 pt-2">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-brand-600 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-brand-600 font-bold hover:underline"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
};
