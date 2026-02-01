import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserPlus, Calendar, Car, Mail, AlignLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './AuthPage.css'; // Reuse core auth styles

const RegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();
    const { t } = useSettings();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        carBrand: '',
        email: '',
        bio: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || '/';

    const handleRegister = async (e) => {
        e.preventDefault();
        // Required fields check
        if (!form.firstName.trim() || !form.lastName.trim() || !form.birthDate || !form.email.trim()) {
            setError(t('register.error'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register(form);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Ошибка сохранения данных. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card register-card-wide">
                <div className="auth-header">
                    <h1>{t('register.title')}</h1>
                    <p>{t('register.subtitle')}</p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-grid">
                        <Input
                            icon={User}
                            type="text"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            placeholder={t('register.firstName')}
                            required
                            autoFocus
                        />

                        <Input
                            icon={UserPlus}
                            type="text"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            placeholder={t('register.lastName')}
                            required
                        />

                        <Input
                            icon={Calendar}
                            type="date"
                            value={form.birthDate}
                            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                            placeholder={t('register.birthDate')}
                            required
                        />

                        <Input
                            icon={Mail}
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder={t('register.email')}
                            required
                        />

                        <Input
                            icon={Car}
                            type="text"
                            value={form.carBrand}
                            onChange={(e) => setForm({ ...form, carBrand: e.target.value })}
                            placeholder={t('register.carBrand')}
                        />

                        <div className="full-width-field">
                            <div className="textarea-wrapper">
                                <AlignLeft className="textarea-icon" size={20} />
                                <textarea
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                    placeholder={t('register.bio')}
                                    className="custom-textarea"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="error-text text-center mt-4">{error}</p>}

                    <Button type="submit" size="lg" className="w-full mt-8" isLoading={loading}>
                        {t('register.button')}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
