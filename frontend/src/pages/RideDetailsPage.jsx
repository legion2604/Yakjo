import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Star, Car, ChevronRight, MessageCircle, CheckCircle, Users, Smartphone, Send, FileText } from 'lucide-react';
import { ridesApi } from '../api/rides';
import { usersApi } from '../api/users';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import './RideDetailsPage.css';

const RatingModal = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { t } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="rating-modal-overlay" onClick={onClose}>
            <div className="rating-modal" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-4">{t('ride.rateDriver')}</h3>
                <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star-btn ${rating >= star ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                        </button>
                    ))}
                </div>
                <textarea
                    className="textarea-field mb-4 w-full"
                    placeholder={t('ride.writeReview')}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                />
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={onClose}>{t('ride.cancel')}</Button>
                    <Button onClick={() => onSubmit(rating, comment)} disabled={rating === 0}>
                        {t('ride.submit')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const RideDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language } = useSettings();

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);

    useEffect(() => {
        const fetchRideDetails = async () => {
            setLoading(true);
            try {
                const data = await ridesApi.getById(id);
                setRide(data);
            } catch (error) {
                console.error('Failed to fetch ride details:', error);
                // Fallback mock data
                setRide({
                    id: 1,
                    from: 'Душанбе',
                    fromAddress: 'Автовокзал Чорбог',
                    to: 'Худжанд',
                    toAddress: 'Панчшанбе',
                    departureTime: '2026-05-24T08:00:00',
                    arrivalTime: '2026-05-24T12:30:00',
                    duration: '4ч 30м',
                    price: 140,
                    description: 'Еду аккуратно, машина чистая, кондиционер работает. Выезжаем вовремя. Багажник свободный, есть место для сумок.',
                    driver: {
                        id: 1,
                        firstName: 'Фарход',
                        age: 32,
                        rating: 4.9,
                        reviewsCount: 12,
                        phone: '+992 90 123 4567',
                        whatsapp: '992901234567',
                        telegram: 'farhod_travel',
                        avatarUrl: null
                    },
                    car: 'Toyota Camry (Белый)',
                    features: [
                        { icon: <CheckCircle size={18} />, text: 'Вы можете быстро связаться с водителем' },
                        { icon: <Users size={18} />, text: 'Максимум два человека на заднем сиденье' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRideDetails();
    }, [id]);

    const handleShowContacts = async () => {
        if (!user) {
            navigate('/auth');
            return;
        }

        try {
            const data = await ridesApi.getContacts(id);
            setContacts(data);
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            setContacts({
                phone: ride.driver.phone || '+992900000000',
                whatsapp: ride.driver.whatsapp || '992900000000',
                telegram: ride.driver.telegram || 'username'
            });
        }
    };

    const handleRateDriver = async (rating, comment) => {
        try {
            await usersApi.rate(ride.driver.id, rating, comment);
            setShowRatingModal(false);
            alert('Спасибо за оценку!');
        } catch (error) {
            console.error(error);
            setShowRatingModal(false);
            alert('Спасибо за оценку! (Demo)');
        }
    };

    const handleStartChat = () => {
        if (!user) {
            navigate('/auth');
            return;
        }
        if (ride?.driver?.id) {
            navigate(`/chats/${ride.driver.id}`);
        }
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateLong = (isoString) => {
        return new Date(isoString).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    if (loading) return <div className="container mt-8 text-center">{t('search.loading')}</div>;
    if (!ride) return <div className="container mt-8 text-center">{t('search.noRides')}</div>;

    return (
        <div className="ride-details-page container">
            <h1 className="page-title">{t('ride.details')}</h1>

            <div className="details-layout">
                {/* Левая колонка: Основной контент */}
                <div className="main-content-col">

                    {/* Карточка маршрута и описания */}
                    <div className="content-card route-card-detail">
                        <div className="timeline-grid">
                            <div className="t-cell t-time start">
                                <span>{formatTime(ride.departureTime)}</span>
                            </div>
                            <div className="t-cell t-visual">
                                <div className="t-node top"></div>
                                <div className="t-line"></div>
                            </div>
                            <div className="t-cell t-info start">
                                <div className="t-city">{ride.from}</div>
                                {ride.fromAddress && <div className="t-address">{ride.fromAddress}</div>}
                            </div>

                            <div className="t-cell t-time duration">
                                <span className="duration-text">{ride.duration}</span>
                            </div>
                            <div className="t-cell t-visual middle">
                                <div className="t-line"></div>
                            </div>
                            <div className="t-cell t-info middle"></div>

                            <div className="t-cell t-time end">
                                <span>{formatTime(ride.arrivalTime)}</span>
                            </div>
                            <div className="t-cell t-visual">
                                <div className="t-node bottom"></div>
                            </div>
                            <div className="t-cell t-info end">
                                <div className="t-city">{ride.to}</div>
                                {ride.toAddress && <div className="t-address">{ride.toAddress}</div>}
                            </div>
                        </div>

                        {ride.description && (
                            <div className="ride-description-block">
                                <div className="description-header">
                                    <FileText size={16} className="description-icon" />
                                    <span>{language === 'ru' ? 'Комментарий водителя:' : 'Driver\'s comment:'}</span>
                                </div>
                                <p className="description-text-content">{ride.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Карточка водителя */}
                    <div className="content-card driver-features-card">
                        <div className="driver-row hoverable-row" onClick={() => navigate('/profile/' + (ride.driver.id || '1'))}>
                            <div className="driver-main-info">
                                <div className="driver-avatar-md">
                                    {ride.driver.avatarUrl ? <img src={ride.driver.avatarUrl} alt={ride.driver.firstName} /> : <span>{ride.driver.firstName[0]}</span>}
                                </div>
                                <div className="driver-text-info">
                                    <div className="driver-name-lg">{ride.driver.firstName}</div>
                                    <div className="driver-rating-row">
                                        <Star size={14} fill="currentColor" className="text-secondary" />
                                        <span className="rating-val">{ride.driver.rating}/5</span>
                                        <span className="review-count"> - {ride.driver.reviewsCount} {t('ride.reviews')}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-secondary" />
                        </div>

                        <div className="card-divider"></div>

                        <div className="features-list">
                            {ride.features && ride.features.map((feature, idx) => (
                                <div key={idx} className="feature-row">
                                    <div className="feature-icon">{feature.icon}</div>
                                    <span className="feature-text">{feature.text}</span>
                                </div>
                            ))}
                            <div className="feature-row">
                                <div className="feature-icon"><Car size={18} /></div>
                                <span className="feature-text">{ride.car}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Button variant="ghost" className="w-full" onClick={() => setShowRatingModal(true)}>
                            <Star size={18} className="mr-2" />
                            {t('ride.rateDriver')}
                        </Button>
                    </div>

                </div>

                {/* Правая колонка: Сайдбар */}
                <div className="sidebar-col">
                    <div className="summary-card">
                        <h2 className="summary-date">{formatDateLong(ride.departureTime)}</h2>

                        <div className="mini-timeline">
                            <div className="mini-point">
                                <div className="mini-time">{formatTime(ride.departureTime)}</div>
                                <div className="mini-visual top"></div>
                                <div className="mini-city">{ride.from}</div>
                            </div>
                            <div className="mini-duration">{ride.duration}</div>
                            <div className="mini-point">
                                <div className="mini-time">{formatTime(ride.arrivalTime)}</div>
                                <div className="mini-visual bottom"></div>
                                <div className="mini-city">{ride.to}</div>
                            </div>
                        </div>

                        <div className="sidebar-divider"></div>

                        <div className="price-row">
                            <span className="passengers-label">1 {t('ride.passengers')}</span>
                            <span className="total-price-lg">{ride.price.toLocaleString('ru-RU')} {language === 'ru' ? 'с' : 's'}</span>
                        </div>

                        {/* ФИКС: Кнопка "Связаться" теперь использует те же стили выравнивания, что и кнопки после клика */}
                        {!contacts ? (
                            <button className="contact-btn btn-phone full-width mt-6 initial-contact-btn" onClick={handleShowContacts}>
                                <Phone size={18} />
                                {t('ride.contact')}
                            </button>
                        ) : (
                            <div className="contact-buttons-grid">
                                <a href={`tel:${contacts.phone}`} className="contact-btn btn-phone full-width">
                                    <Phone size={18} />
                                    {t('ride.call')}
                                </a>

                                {contacts.whatsapp && (
                                    <a
                                        href={`https://wa.me/${contacts.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-btn btn-whatsapp"
                                    >
                                        <Smartphone size={18} />
                                        WhatsApp
                                    </a>
                                )}

                                {contacts.telegram && (
                                    <a
                                        href={`https://t.me/${contacts.telegram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-btn btn-telegram"
                                    >
                                        <Send size={18} />
                                        Telegram
                                    </a>
                                )}

                                <button className="contact-btn btn-chat full-width" onClick={handleStartChat}>
                                    <MessageCircle size={18} />
                                    {t('ride.writeChat')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRateDriver}
            />
        </div>
    );
};

export default RideDetailsPage;