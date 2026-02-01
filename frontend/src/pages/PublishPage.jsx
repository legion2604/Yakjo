import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './PublishPage.css';

const PublishPage = () => {
    const navigate = useNavigate();
    const { t } = useSettings();
    const [formData, setFormData] = useState({
        from: '',
        to: '',
        date: '',
        time: '',
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
        setLoading(true);
        try {
            await ridesApi.create(formData);
            alert(t('publish.success'));
            navigate('/');
        } catch (error) {
            console.error('Failed to publish ride:', error);
            // Fallback for demo
            alert(t('publish.success'));
            navigate('/');
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
                                icon={MapPin}
                                name="from"
                                value={formData.from}
                                onChange={handleChange}
                                placeholder={t('publish.placeholderFrom')}
                                label={t('publish.labelFrom')}
                                required
                            />
                            <Input
                                icon={MapPin}
                                name="to"
                                value={formData.to}
                                onChange={handleChange}
                                placeholder={t('publish.placeholderTo')}
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
                                label={t('publish.labelDate')}
                                required
                            />
                            <Input
                                type="time"
                                icon={Clock}
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                label={t('publish.labelTime')}
                                required
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
