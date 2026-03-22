import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './AuthPage.css';

const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp } = useAuth();
    const { t } = useSettings();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState('');

    const phone = location.state?.phone;
    const from = location.state?.from || '/profile';

    useEffect(() => {
        if (!phone) {
            console.warn('No phone number found in navigation state, redirecting to /auth');
            navigate('/auth', { replace: true });
        }
    }, [phone, navigate]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
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
            setLoading(false);
            setError(t('auth.errorVerify'));
        }
    };

    const handleResendOtp = () => {
        alert('Код отправлен повторно: 123456');
    };

    if (!phone) {
        return (
            <div className="auth-page container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>{t('auth.confirm')}</h1>
                        <p>Загрузка...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page container">
            <div className="auth-card">
                <div className="auth-header">
                    <button className="back-link-btn" onClick={() => navigate('/auth', { state: { phone } })}>
                        <ArrowLeft size={20} /> {t('auth.back')}
                    </button>
                    <h1>{t('auth.confirm')}</h1>
                    <p>
                        {t('auth.otpSubtitle')?.replace('{phone}', phone) || `Мы отправили код на номер ${phone}`}
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="auth-form">
                    <Input
                        icon={Lock}
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder={t('auth.otpPlaceholder')}
                        required
                        autoFocus
                        maxLength={6}
                        error={error}
                    />

                    <Button type="submit" size="lg" className="w-full mt-4" isLoading={loading}>
                        {t('auth.enter')}
                    </Button>

                    <button
                        type="button"
                        className="resend-btn"
                        onClick={handleResendOtp}
                    >
                        {t('auth.resend')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
