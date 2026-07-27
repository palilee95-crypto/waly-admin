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
      login({ email: values.email, password: values.password });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please check details or try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#001f15] via-[#002d1e] to-[#00150e] text-white select-none px-4">
      {/* Ambient background glowing mesh orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6bfe9c]/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#006d37]/25 blur-[130px] pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-[440px] p-7 sm:p-9 rounded-[2.5rem] bg-white/95 dark:bg-[#002518]/90 backdrop-blur-3xl border border-white/20 dark:border-[#004d30] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col items-center transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center w-full">
          <div className="py-1 px-2 mb-2 flex items-center justify-center w-full overflow-hidden">
            <img 
              src="/risev-logo.png" 
              alt="RISEV Logo" 
              className="h-20 sm:h-24 object-contain filter drop-shadow-sm" 
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#85af9b] max-w-[320px] font-medium leading-relaxed mb-0">
            {mode === 'login' 
              ? 'Enter your credentials to access the central intelligence & operations dashboard.' 
              : 'Join the Sales Agent network and start managing merchant onboarding.'}
          </p>
        </div>

        {/* Mode Switcher Segmented Control */}
        <div className="w-full p-1.5 mb-6 rounded-2xl bg-slate-100 dark:bg-[#00170f] border border-slate-200 dark:border-[#004d30] grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none ${
              mode === 'login'
                ? 'bg-[#006d37] text-white shadow-md'
                : 'bg-transparent text-slate-500 dark:text-[#85af9b] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Sign In
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none ${
              mode === 'register'
                ? 'bg-[#006d37] text-white shadow-md'
                : 'bg-transparent text-slate-500 dark:text-[#85af9b] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            Register Agent
          </button>
        </div>

        {/* Alert Banners */}
        {errorMsg && (
          <div className="w-full bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-bold mb-4 flex items-start gap-2 shadow-sm">
            <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 mt-0.5">error</span>
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="w-full bg-[#6bfe9c]/15 border border-[#6bfe9c]/30 text-[#006d37] dark:text-[#6bfe9c] px-4 py-3 rounded-2xl text-xs font-bold mb-4 flex items-start gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c] text-[18px] shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        {mode === 'login' ? (
          <Form
            name="login-form"
            layout="vertical"
            onFinish={onFinishLogin}
            requiredMark={false}
            className="w-full flex flex-col gap-1 text-left"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
              className="mb-4"
            >
              <Input 
                prefix={<span className="material-symbols-outlined text-slate-400 dark:text-[#85af9b] text-[18px] mr-2">mail</span>} 
                placeholder="Email Address" 
                className="h-12 rounded-2xl bg-white dark:bg-[#00170f] border-slate-200 dark:border-[#004d30] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85af9b] text-sm font-bold transition-all shadow-sm"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
              className="mb-2"
            >
              <Input.Password 
                prefix={<span className="material-symbols-outlined text-slate-400 dark:text-[#85af9b] text-[18px] mr-2">lock</span>} 
                placeholder="Password" 
                className="h-12 rounded-2xl bg-white dark:bg-[#00170f] border-slate-200 dark:border-[#004d30] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85af9b] text-sm font-bold transition-all shadow-sm"
              />
            </Form.Item>

            <Form.Item className="mt-5 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full h-12 bg-[#006d37] hover:bg-[#004d27] text-white rounded-2xl font-black text-sm border-none flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                {!isLoading && <span className="material-symbols-outlined text-[18px]">login</span>}
                Sign In to Dashboard
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form
            name="register-form"
            layout="vertical"
            onFinish={onFinishRegister}
            requiredMark={false}
            className="w-full flex flex-col gap-1 text-left"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
              className="mb-3.5"
            >
              <Input 
                prefix={<span className="material-symbols-outlined text-slate-400 dark:text-[#85af9b] text-[18px] mr-2">person</span>} 
                placeholder="Full Name" 
                className="h-12 rounded-2xl bg-white dark:bg-[#00170f] border-slate-200 dark:border-[#004d30] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85af9b] text-sm font-bold transition-all shadow-sm"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
              className="mb-3.5"
            >
              <Input 
                prefix={<span className="material-symbols-outlined text-slate-400 dark:text-[#85af9b] text-[18px] mr-2">mail</span>} 
                placeholder="Email Address" 
                className="h-12 rounded-2xl bg-white dark:bg-[#00170f] border-slate-200 dark:border-[#004d30] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85af9b] text-sm font-bold transition-all shadow-sm"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please set your password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
              className="mb-3.5"
            >
              <Input.Password 
                prefix={<span className="material-symbols-outlined text-slate-400 dark:text-[#85af9b] text-[18px] mr-2">lock</span>} 
                placeholder="Password (Min 8 chars)" 
                className="h-12 rounded-2xl bg-white dark:bg-[#00170f] border-slate-200 dark:border-[#004d30] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85af9b] text-sm font-bold transition-all shadow-sm"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: 'Please confirm your password' }]}
              className="mb-2"
            >
              <Input.Password 
                prefix={<span className="material-symbols-outlined text-slate-400 dark:text-[#85af9b] text-[18px] mr-2">lock_reset</span>} 
                placeholder="Confirm Password" 
                className="h-12 rounded-2xl bg-white dark:bg-[#00170f] border-slate-200 dark:border-[#004d30] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85af9b] text-sm font-bold transition-all shadow-sm"
              />
            </Form.Item>

            <Form.Item className="mt-5 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isRegistering || isLoading}
                className="w-full h-12 bg-[#006d37] hover:bg-[#004d27] text-white rounded-2xl font-black text-sm border-none flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                {!(isRegistering || isLoading) && <span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
                Create Agent Account
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Security Badge Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 w-full flex items-center justify-center gap-2 text-slate-400 dark:text-[#85af9b] text-xs font-bold">
          <span className="material-symbols-outlined text-[16px] text-[#006d37] dark:text-[#6bfe9c]">verified_user</span>
          <span>Protected by RISEV Security</span>
        </div>
      </div>
    </div>
  );
};
