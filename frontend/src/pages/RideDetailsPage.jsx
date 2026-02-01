import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Star, Car, ChevronRight, MessageCircle, CheckCircle, Users } from 'lucide-react';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import './RideDetailsPage.css';

const RideDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language } = useSettings();

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPhone, setShowPhone] = useState(false);

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
                    id: '1',
                    from: 'Москва',
                    fromAddress: 'Ул. Павла Корчагина, 14',
                    to: 'Кудрово',
                    toAddress: 'Ул. Пражская, 12, Ленинградская обл.',
                    departureTime: '2024-01-31T08:00:00',
                    arrivalTime: '2024-01-31T15:20:00',
                    duration: '7ч 20',
                    price: 2280,
                    driver: {
                        firstName: 'Тимур',
                        age: 28,
                        rating: 5.0,
                        reviewsCount: 1,
                        phone: '+7 900 123 4567',
                        avatarUrl: null
                    },
                    car: 'CHEVROLET MALIBU - Темно-серый',
                    features: [
                        { icon: <CheckCircle size={18} />, text: 'Вы можете быстро связаться с водителем и забронировать место' },
                        { icon: <Users size={18} />, text: 'Максимум двое сзади' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRideDetails();
    }, [id]);

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateLong = (isoString) => {
        return "Суббота, 31 января"; // Mock date formatting
    };

    const handleContactClick = () => {
        if (!user) {
            navigate('/auth');
            return;
        }
        setShowPhone(true);
    };

    if (loading) return <div className="container mt-8 text-center">{t('search.loading')}</div>;
    if (!ride) return <div className="container mt-8 text-center">{t('search.noRides')}</div>;

    return (
        <div className="ride-details-page container">
            <h1 className="page-title">{t('ride.details')}</h1>

            <div className="details-layout">
                {/* Left Column: Main Info */}
                <div className="main-content-col">

                    {/* Route Card (Grid Layout) */}
                    <div className="content-card route-card-detail">
                        <div className="timeline-grid">
                            {/* Start Row */}
                            <div className="t-cell t-time start">
                                <span>{formatTime(ride.departureTime)}</span>
                            </div>
                            <div className="t-cell t-visual">
                                <div className="t-node top"></div>
                                <div className="t-line"></div>
                            </div>
                            <div className="t-cell t-info start">
                                <div className="t-city">{ride.from}</div>
                            </div>

                            {/* Duration Row */}
                            <div className="t-cell t-time duration">
                                <span className="duration-text">{ride.duration}</span>
                            </div>
                            <div className="t-cell t-visual middle">
                                <div className="t-line"></div>
                            </div>
                            <div className="t-cell t-info middle"></div>

                            {/* End Row */}
                            <div className="t-cell t-time end">
                                <span>{formatTime(ride.arrivalTime)}</span>
                            </div>
                            <div className="t-cell t-visual">
                                <div className="t-node bottom"></div>
                            </div>
                            <div className="t-cell t-info end">
                                <div className="t-city">{ride.to}</div>
                            </div>
                        </div>
                    </div>

                    {/* Driver & Features Card (Merged) */}
                    <div className="content-card driver-features-card">
                        {/* Driver Row (Clickable) */}
                        <div className="driver-row hoverable-row" onClick={() => navigate('/profile/' + ride.driver.id)}>
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

                        {/* Options / Features */}
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

                    {/* Ask Question Button */}
                    <div className="ask-question-btn">
                        <Button variant="outline" className="w-full text-left justify-start" size="lg">
                            <MessageCircle className="mr-2 text-primary" size={20} />
                            <span>{t('ride.questions').replace('{name}', ride.driver.firstName)}</span>
                        </Button>
                    </div>

                </div>

                {/* Right Column: Sidebar */}
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

                        <div className="mini-driver-row">
                            <Car size={20} className="text-secondary" />
                            <div className="mini-driver-info">
                                <div className="driver-avatar-xs">
                                    {ride.driver.avatarUrl ? <img src={ride.driver.avatarUrl} alt="D" /> : ride.driver.firstName[0]}
                                </div>
                                <div className="mini-driver-text">
                                    <span className="name">{ride.driver.firstName}</span>
                                    <span className="rating"><Star size={10} fill="currentColor" /> {ride.driver.rating}</span>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-divider"></div>

                        <div className="price-row">
                            <span className="passengers-label">1 {t('ride.passengers')}</span>
                            <span className="total-price-lg">{ride.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} {language === 'ru' ? 'с' : (language === 'en' ? 's' : 'с')}</span>
                        </div>

                        {showPhone ? (
                            <a href={`tel:${ride.driver.phone}`} className="phone-reveal-button mt-4">
                                <Phone className="mr-2" size={20} />
                                {ride.driver.phone}
                            </a>
                        ) : (
                            <Button size="lg" className="w-full mt-6 flex items-center justify-center gap-2 pill-button" onClick={handleContactClick}>
                                <Phone size={20} />
                                {t('ride.contact')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideDetailsPage;
