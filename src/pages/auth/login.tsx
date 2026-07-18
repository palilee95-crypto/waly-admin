import React, { useState } from 'react';
import { useLogin } from '@refinedev/core';
import { Form, Input, Button } from 'antd';
import { pb } from '../../lib/pocketbase';

export const LoginPage: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const onFinishLogin = (values: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    login(values, {
      onError: (error: any) => {
        setErrorMsg(error?.message || 'Login failed. Please check your credentials.');
      }
    });
  };

  const onFinishRegister = async (values: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (values.password !== values.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setIsRegistering(true);
    try {
      await pb.collection('sales_agents').create({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        passwordConfirm: values.confirmPassword,
      });
      setSuccessMsg('Account created successfully! Logging you in...');
      // Auto-login
      login({ email: values.email, password: values.password });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please check details or try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-cover bg-center select-none" style={{ background: 'linear-gradient(135deg, #f7f9fc 0%, #eef2f7 50%, #e6eaf1 100%)' }}>
      <div className="glass-panel p-10 rounded-[2rem] w-full max-w-md shadow-2xl flex flex-col items-center">
        {/* Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
          <span className="font-headline text-3xl text-white font-black">W</span>
        </div>
        
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
          {mode === 'login' ? 'WALY Admin' : 'Agent Registration'}
        </h2>
        <p className="font-body text-body-sm text-on-surface-variant mb-8 text-center">
          {mode === 'login' 
            ? 'Enter credentials to access the intelligence hub' 
            : 'Join the WALY Sales Agent program and earn commissions'}
        </p>

        {errorMsg && (
          <div className="w-full bg-red-100 text-red-600 px-4 py-3 rounded-xl text-body-sm font-semibold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="w-full bg-green-100 text-green-600 px-4 py-3 rounded-xl text-body-sm font-semibold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {successMsg}
          </div>
        )}

        {mode === 'login' ? (
          <Form
            name="login-form"
            layout="vertical"
            onFinish={onFinishLogin}
            requiredMark={false}
            className="w-full"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input 
                prefix={<span className="material-symbols-outlined text-outline text-[20px] mr-2">mail</span>} 
                placeholder="Email Address" 
                className="h-12 rounded-xl bg-white/40 border-none hover:bg-white/60 focus:bg-white/60 text-body-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password 
                prefix={<span className="material-symbols-outlined text-outline text-[20px] mr-2">lock</span>} 
                placeholder="Password" 
                className="h-12 rounded-xl bg-white/40 border-none hover:bg-white/60 focus:bg-white/60 text-body-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </Form.Item>

            <Form.Item className="mt-8 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary-container text-white rounded-xl font-bold text-title-md border-none flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="w-full text-center mt-4">
              <span className="text-on-surface-variant text-body-sm">Become a sales representative? </span>
              <button 
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Register as Agent
              </button>
            </div>
          </Form>
        ) : (
          <Form
            name="register-form"
            layout="vertical"
            onFinish={onFinishRegister}
            requiredMark={false}
            className="w-full"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your Full Name' }]}
            >
              <Input 
                prefix={<span className="material-symbols-outlined text-outline text-[20px] mr-2">person</span>} 
                placeholder="Full Name" 
                className="h-12 rounded-xl bg-white/40 border-none hover:bg-white/60 focus:bg-white/60 text-body-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input 
                prefix={<span className="material-symbols-outlined text-outline text-[20px] mr-2">mail</span>} 
                placeholder="Email Address" 
                className="h-12 rounded-xl bg-white/40 border-none hover:bg-white/60 focus:bg-white/60 text-body-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please set your password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password 
                prefix={<span className="material-symbols-outlined text-outline text-[20px] mr-2">lock</span>} 
                placeholder="Password (Min 8 chars)" 
                className="h-12 rounded-xl bg-white/40 border-none hover:bg-white/60 focus:bg-white/60 text-body-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: 'Please confirm your password' }]}
            >
              <Input.Password 
                prefix={<span className="material-symbols-outlined text-outline text-[20px] mr-2">lock_reset</span>} 
                placeholder="Confirm Password" 
                className="h-12 rounded-xl bg-white/40 border-none hover:bg-white/60 focus:bg-white/60 text-body-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </Form.Item>

            <Form.Item className="mt-8 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isRegistering || isLoading}
                className="w-full h-12 bg-primary hover:bg-primary-container text-white rounded-xl font-bold text-title-md border-none flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Register Account
              </Button>
            </Form.Item>

            <div className="w-full text-center mt-4">
              <span className="text-on-surface-variant text-body-sm">Already have an agent account? </span>
              <button 
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};
