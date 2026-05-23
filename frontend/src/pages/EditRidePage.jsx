import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './PublishPage.css'; // Reusing publish page styles

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

const EditRidePage = () => {
    const { id } = useParams();
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
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchRide = async () => {
            try {
                const data = await ridesApi.getById(id);
                // Parse dates
                const depDate = new Date(data.departureTime);
                const arrDate = new Date(data.arrivalTime);
                
                const fDate = !isNaN(depDate) ? depDate.toISOString().split('T')[0] : '';
                const fTime = !isNaN(depDate) ? depDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '';
                
                const aDate = !isNaN(arrDate) && arrDate.getFullYear() > 1970 ? arrDate.toISOString().split('T')[0] : '';
                const aTime = !isNaN(arrDate) && arrDate.getFullYear() > 1970 ? arrDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '';

                setFormData({
                    from: data.from || '',
                    to: data.to || '',
                    date: fDate,
                    time: fTime,
                    arrivalDate: aDate,
                    arrivalTime: aTime,
                    price: data.price || '',
                    seats: data.totalSeats || data.seats || 3,
                    description: data.description || ''
                });
            } catch (error) {
                console.error("Failed to fetch ride details:", error);
                alert("Ошибка загрузки поездки");
                navigate('/profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchRide();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedDate = new Date(`${formData.date}T${formData.time}`);
        // Removed past date validation for editing, as it might already be in the past

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

        setSubmitting(true);
        try {
            await ridesApi.update(id, payload);
            alert(t('profile.myRides.editTitle') + " - Успешно!");
            navigate('/profile');
        } catch (error) {
            console.error('Failed to update ride:', error);
            alert(t('publish.errorGeneric') + (error.message || t('publish.errorTryLater')));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container mt-8 text-center">{t('chats.loading')}</div>;

    return (
        <div className="publish-page container">
            <div className="publish-card">
                <div className="publish-header">
                    <h1>{t('profile.myRides.editTitle')}</h1>
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

                    <div className="form-actions" style={{display: 'flex', gap: '10px'}}>
                        <Button type="button" variant="ghost" onClick={() => navigate('/profile')} style={{flex: 1}}>
                            {t('ride.cancel')}
                        </Button>
                        <Button type="submit" size="lg" isLoading={submitting} style={{flex: 1}}>
                            {t('editProfile.save')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRidePage;
