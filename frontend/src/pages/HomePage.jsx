import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, Calendar, User, MapPin, ArrowRight, Shield, Zap } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { t, language } = useSettings();
    const [searchParams, setSearchParams] = useState({
        from: '',
        to: '',
        date: '',
        seats: 1
    });

    const [popularRoutes, setPopularRoutes] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const data = await ridesApi.getPopular();
                setPopularRoutes(data);
            } catch (error) {
                console.error('Failed to fetch popular routes:', error);
                // Fallback to static if API is not ready
                setPopularRoutes([
                    { from: language === 'en' ? 'Moscow' : (language === 'tj' ? 'Маскав' : 'Москва'), to: language === 'en' ? 'Saint Petersburg' : (language === 'tj' ? 'Санкт-Петербург' : 'Санкт-Петербург'), price: `1200 ${language === 'en' ? 's' : 'с'}` },
                    { from: language === 'en' ? 'Kazan' : (language === 'tj' ? 'Қазон' : 'Казань'), to: language === 'en' ? 'Moscow' : (language === 'tj' ? 'Маскав' : 'Москва'), price: `1500 ${language === 'en' ? 's' : 'с'}` },
                    { from: language === 'en' ? 'Krasnodar' : (language === 'tj' ? 'Краснодар' : 'Краснодар'), to: language === 'en' ? 'Sochi' : (language === 'tj' ? 'Сочи' : 'Сочи'), price: `800 ${language === 'en' ? 's' : 'с'}` },
                    { from: language === 'en' ? 'Yekaterinburg' : (language === 'tj' ? 'Екатеринбург' : 'Екатеринбург'), to: language === 'en' ? 'Chelyabinsk' : (language === 'tj' ? 'Челябинск' : 'Челябинск'), price: `600 ${language === 'en' ? 's' : 'с'}` },
                ]);
            } finally {
                setLoadingPopular(false);
            }
        };

        fetchPopular();
    }, [language]);

    const handleSearch = (e) => {
        e.preventDefault();
        const queryString = new URLSearchParams(searchParams).toString();
        navigate(`/search?${queryString}`);
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container hero-container">
                    <h1 className="hero-title">
                        {t('hero.title')}
                    </h1>
                    <p className="hero-subtitle">{t('hero.subtitle')}</p>

                    <div className="search-widget-wrapper">
                        <form className="search-bar" onSubmit={handleSearch}>
                            <div className="search-field location-field">
                                <Circle className="field-icon search-icon-circle" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('hero.placeholderFrom')}
                                    value={searchParams.from}
                                    onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field-divider"></div>

                            <div className="search-field location-field">
                                <MapPin className="field-icon" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('hero.placeholderTo')}
                                    value={searchParams.to}
                                    onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field-divider"></div>

                            <div className="search-field date-field">
                                <Calendar className="field-icon" size={20} />
                                <input
                                    type="date"
                                    value={searchParams.date}
                                    onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                                    placeholder={t('hero.placeholderDate')}
                                    required
                                />
                            </div>

                            <div className="field-divider"></div>

                            <div className="search-field seats-field">
                                <User className="field-icon" size={20} />
                                <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={searchParams.seats}
                                    onChange={(e) => setSearchParams({ ...searchParams, seats: e.target.value })}
                                    placeholder={t('hero.placeholderSeats')}
                                />
                            </div>

                            <button type="submit" className="search-submit-btn">
                                {t('hero.searchBtn')}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Popular Routes Section */}
            <section className="section popular-section">
                <div className="container">
                    <h2 className="section-title">{t('popular.title')}</h2>
                    <div className="popular-grid">
                        {loadingPopular ? (
                            <div className="loading-state">...</div>
                        ) : (
                            popularRoutes.map((route, index) => (
                                <div key={index} className="route-card" onClick={() => navigate('/search')}>
                                    <div className="route-info">
                                        <span className="route-city">{route.from}</span>
                                        <ArrowRight size={16} className="route-arrow" />
                                        <span className="route-city">{route.to}</span>
                                    </div>
                                    <span className="route-price">{route.price}</span>
                                    <ArrowRight className="card-arrow-icon" size={20} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper bg-blue-light">
                                <span role="img" aria-label="save">💰</span>
                            </div>
                            <h3>{t('features.save.title')}</h3>
                            <p>{t('features.save.desc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper bg-orange-light">
                                <Shield className="text-primary" size={32} />
                            </div>
                            <h3>{t('features.safety.title')}</h3>
                            <p>{t('features.safety.desc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper bg-green-light">
                                <Zap className="text-secondary" size={32} />
                            </div>
                            <h3>{t('features.fast.title')}</h3>
                            <p>{t('features.fast.desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Driver CTA Section */}
            <section className="driver-cta-section">
                <div className="container">
                    <div className="driver-cta-content">
                        <h2>{t('cta.title')}</h2>
                        <p>{t('cta.text')}</p>
                        <Button variant="secondary" onClick={() => navigate('/publish')}>
                            {t('cta.button')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
