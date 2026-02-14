import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Car, Phone, Smartphone, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './EditProfilePage.css';

const EditProfilePage = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth(); // login used to update user context
    const { t } = useSettings();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        carBrand: '',
        bio: '',
        whatsapp: '',
        telegram: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                birthDate: user.birthDate || '',
                email: user.email || '',
                carBrand: user.carBrand || '',
                bio: user.bio || '',
                whatsapp: user.whatsapp || '',
                telegram: user.telegram || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.firstName.trim().length < 2) {
            alert('Имя должно содержать минимум 2 символа');
            return;
        }

        if (formData.bio && formData.bio.length > 500) {
            alert('О себе: максимум 500 символов');
            return;
        }

        // WhatsApp: digits only
        const whatsappDigits = formData.whatsapp.replace(/\D/g, '');
        if (formData.whatsapp && whatsappDigits.length < 9) {
            alert('Введите корректный номер WhatsApp (минимум 9 цифр)');
            return;
        }

        // Telegram: remove @ if exists
        const telegramClean = formData.telegram.replace('@', '');

        setLoading(true);
        try {
            const submitData = {
                ...formData,
                whatsapp: whatsappDigits,
                telegram: telegramClean
            };
            const updatedUser = await authApi.updateProfile(submitData);
            navigate('/profile');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Ошибка при обновлении профиля: ' + (error.message || 'попробуйте позже'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-profile-page container">
            <div className="edit-card">
                <h1 className="page-title">{t('profile.edit')}</h1>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-section">
                        <h3>{t('profile.personalInfo')}</h3>
                        <div className="input-group">
                            <Input
                                icon={User}
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                label={t('register.firstName')}
                                required
                            />
                            <Input
                                icon={User}
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                label={t('register.lastName')}
                                required
                            />
                        </div>
                        <Input
                            type="date"
                            icon={Calendar}
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            label={t('register.birthDate')}
                        />
                        <Input
                            type="email"
                            icon={Mail}
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            label={t('register.email')}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Транспорт</h3>
                        <Input
                            icon={Car}
                            name="carBrand"
                            value={formData.carBrand}
                            onChange={handleChange}
                            label={t('register.carBrand')}
                            placeholder="Например: Toyota Camry, Белый"
                        />
                    </div>

                    <div className="form-section">
                        <h3>Контакты для связи</h3>
                        <Input
                            icon={Smartphone}
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            label="WhatsApp (номер телефона)"
                            placeholder="992900000000"
                        />
                        <Input
                            icon={MessageCircle}
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleChange}
                            label="Telegram (username)"
                            placeholder="username (без @)"
                        />
                    </div>

                    <div className="form-section">
                        <h3>О себе</h3>
                        <textarea
                            className="textarea-field"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Расскажите немного о себе, стаже вождения и т.д."
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => navigate('/profile')}>
                            Отмена
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Сохранить
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;
