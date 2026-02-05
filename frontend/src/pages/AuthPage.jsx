import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './AuthPage.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { sendOtp, verifyOtp } = useAuth();
    const { t } = useSettings();

    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // Get redirect path
    const from = location.state?.from?.pathname || '/profile';

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (phone.length < 9) {
            setError(t('auth.errorPhone'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            await sendOtp(phone);
            setStep(2);
            // Mock notification
            alert(`Код подтверждения: 1234`);
        } catch (err) {
            setError(t('auth.errorSend'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 4) {
            setError(t('auth.errorOtp'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await verifyOtp(phone, otp);

            if (data.isNewUser) {
                navigate('/register', { state: { from, phone: data.phone || phone }, replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(t('auth.errorVerify'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card">
                <div className="auth-header">
                    {step === 2 && (
                        <button className="back-link-btn" onClick={() => setStep(1)}>
                            <ArrowLeft size={20} /> {t('auth.back')}
                        </button>
                    )}
                    <h1>{step === 1 ? t('auth.login') : t('auth.confirm')}</h1>
                    <p>
                        {step === 1
                            ? t('auth.phoneSubtitle')
                            : t('auth.otpSubtitle').replace('{phone}', phone)}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <Input
                            icon={Phone}
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t('auth.phonePlaceholder')}
                            required
                            autoFocus
                            error={error}
                        />

                        <Button type="submit" size="lg" className="w-full mt-4" isLoading={loading}>
                            {t('auth.getOtp')} <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <Input
                            icon={Lock}
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder={t('auth.otpPlaceholder')}
                            required
                            autoFocus
                            maxLength={4}
                            error={error}
                        />

                        <Button type="submit" size="lg" className="w-full mt-4" isLoading={loading}>
                            {t('auth.enter')}
                        </Button>

                        <button
                            type="button"
                            className="resend-btn"
                            onClick={() => alert('Код отправлен повторно: 1234')}
                        >
                            {t('auth.resend')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
