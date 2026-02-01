import React from 'react';
import { Star, Car, User, Users } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './RideCard.css';

const RideCard = ({ ride, onSelect }) => {
    const { t, language } = useSettings();
    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate duration (dummy calculation for demo if real data missing)
    const getDuration = () => {
        return "7 ч 20";
    };

    return (
        <div className="ride-card" onClick={() => onSelect(ride.id)}>
            {/* Top Section: Route & Price */}
            <div className="card-top">
                <div className="route-horizontal">
                    <div className="point">
                        <span className="time">{formatTime(ride.departureTime)}</span>
                        <div className="connector-node"></div>
                        <span className="city">{ride.from}</span>
                    </div>

                    <div className="route-duration">
                        <span className="duration-text">{getDuration()}</span>
                        <div className="duration-line"></div>
                    </div>

                    <div className="point">
                        <span className="time">{formatTime(ride.arrivalTime || new Date().toISOString())}</span>
                        <div className="connector-node"></div>
                        <span className="city">{ride.to}</span>
                    </div>
                </div>

                <div className="price-container">
                    <span className="price">{ride.price} {language === 'ru' ? 'с' : (language === 'en' ? 's' : 'с')}</span>
                </div>
            </div>

            {/* Bottom Section: Driver & Details */}
            <div className="card-bottom">
                <div className="driver-section">
                    <div className="icon-wrapper">
                        {/* Check car type or default to car */}
                        <Car size={20} className="text-secondary" />
                    </div>

                    <div className="driver-info-block">
                        <div className="driver-avatar-small">
                            {ride.driver.avatarUrl ? (
                                <img src={ride.driver.avatarUrl} alt={ride.driver.firstName} />
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${ride.driver.firstName}&background=random`} alt={ride.driver.firstName} />
                            )}
                        </div>
                        <span className="driver-name">{ride.driver.firstName}</span>
                        <div className="rating-badge">
                            <Star size={12} fill="currentColor" />
                            <span>{ride.driver.rating || '5,0'}</span>
                        </div>
                    </div>
                </div>

                <div className="options-section">
                    {ride.availableSeats > 0 && (
                        <div className="option-item">
                            <Users size={18} className="text-secondary" />
                            <span>{language === 'tj' ? 'Максимум ду нафар дар қафо' : (language === 'en' ? 'Max 2 passengers in the back' : 'Максимум двое сзади')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RideCard;
