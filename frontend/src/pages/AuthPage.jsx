import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './AuthPage.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { sendOtp } = useAuth();
    const { t } = useSettings();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [phone, setPhone] = useState(location.state?.phone || '');

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

            // Mock notification for dev
            if (window.location.hostname === 'localhost') {
                console.log(`Код подтверждения: 123456`);
            }

            // Navigate immediately
            navigate('/verify-otp', { state: { phone, from } });
        } catch (err) {
            setLoading(false); // Only set loading false if we stayed on the page
            if (err.message && err.message.includes('429')) {
                setError('Слишком много попыток. Пожалуйста, подождите 5 минут.');
            } else {
                setError(t('auth.errorSend'));
            }
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>{t('auth.login')}</h1>
                    <p>{t('auth.phoneSubtitle')}</p>
                </div>

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
                        <span>{t('auth.getOtp')}</span> <ArrowRight size={20} className="ml-2" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;
