import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './PublishPage.css';

const CITIES = [
    'Душанбе',
    'Худжанд',
    'Бохтар',
    'Куляб',
    'Истаравшан',
    'Вахдат',
    'Турсунзаде',
    'Исфара',
    'Пенджикент',
    'Хорог'
];

const PublishPage = () => {
    const navigate = useNavigate();
    const { t } = useSettings();
    const [formData, setFormData] = useState({
        from: '',
        to: '',
        date: '',
        time: '',
        arrivalDate: '',
        arrivalTime: '',
        price: '',
        seats: 3,
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Past date
        const selectedDate = new Date(`${formData.date}T${formData.time}`);
        if (selectedDate < new Date()) {
            alert(t('publish.errorPast'));
            return;
        }

        let arrivalSelectedDate = null;
        if (formData.arrivalDate && formData.arrivalTime) {
            arrivalSelectedDate = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);
            if (arrivalSelectedDate < selectedDate) {
                alert(t('publish.errorArrival'));
                return;
            }
        }

        const payload = {
            from: formData.from,
            to: formData.to,
            departureTime: selectedDate.toISOString(),
            arrivalTime: arrivalSelectedDate ? arrivalSelectedDate.toISOString() : new Date(0).toISOString(),
            price: Number(formData.price),
            totalSeats: Number(formData.seats),
            description: formData.description
        };

        setLoading(true);
        try {
            await ridesApi.create(payload);
            alert(t('publish.success'));
            navigate('/');
        } catch (error) {
            console.error('Failed to publish ride:', error);

            if (error.message && error.message.includes('409')) {
                alert(t('publish.errorDuplicate'));
            } else if (error.message && error.message.includes('403')) {
                alert(t('publish.errorLimit'));
            } else {
                alert(t('publish.errorGeneric') + (error.message || t('publish.errorTryLater')));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="publish-page container">
            <div className="publish-card">
                <div className="publish-header">
                    <h1>{t('publish.title')}</h1>
                    <p>{t('publish.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="publish-form">
                    <div className="form-section">
                        <h3>{t('publish.route')}</h3>
                        <div className="input-group">
                            <Input
                                type="select"
                                options={CITIES}
                                icon={MapPin}
                                name="from"
                                value={formData.from}
                                onChange={handleChange}
                                placeholder={t('publish.placeholderFrom') || 'Выберите город отправления'}
                                label={t('publish.labelFrom')}
                                required
                            />
                            <Input
                                type="select"
                                options={CITIES}
                                icon={MapPin}
                                name="to"
                                value={formData.to}
                                onChange={handleChange}
                                placeholder={t('publish.placeholderTo') || 'Выберите город назначения'}
                                label={t('publish.labelTo')}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>{t('publish.dateTime')}</h3>
                        <div className="input-row">
                            <Input
                                type="date"
                                icon={Calendar}
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                label="Дата отправления"
                                required
                            />
                            <Input
                                type="time"
                                icon={Clock}
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                label="Время отправления"
                                required
                            />
                        </div>
                        <div className="input-row mt-4">
                            <Input
                                type="date"
                                icon={Calendar}
                                name="arrivalDate"
                                value={formData.arrivalDate}
                                onChange={handleChange}
                                label="Дата прибытия (необязательно)"
                            />
                            <Input
                                type="time"
                                icon={Clock}
                                name="arrivalTime"
                                value={formData.arrivalTime}
                                onChange={handleChange}
                                label="Время прибытия (необязательно)"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>{t('publish.details')}</h3>
                        <div className="input-row">
                            <Input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder={t('publish.pricePlaceholder')}
                                label={t('publish.labelPrice')}
                                min="0"
                                required
                            />
                            <Input
                                type="number"
                                name="seats"
                                value={formData.seats}
                                onChange={handleChange}
                                label={t('publish.labelSeats')}
                                min="1"
                                max="8"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>{t('publish.comment')}</h3>
                        <textarea
                            className="textarea-field"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={t('publish.commentPlaceholder')}
                            rows="4"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                            {t('publish.button')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublishPage;
