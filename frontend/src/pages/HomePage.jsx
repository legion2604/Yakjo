import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Circle, Calendar, User, MapPin, ArrowRight, Shield, Zap, 
    ChevronDown, Star, MessageSquare, Car, Compass, Search 
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { t, language } = useSettings();
    
    // Состояния для поиска
    const [searchParams, setSearchParams] = useState({
        from: '',
        to: '',
        date: '',
        seats: 1
    });

    const [popularRoutes, setPopularRoutes] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(true);
    
    // Состояния для интерактивных элементов лендинга
    const [activeTab, setActiveTab] = useState('passenger');
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const data = await ridesApi.getPopular();
                setPopularRoutes(data);
            } catch (error) {
                console.error('Failed to fetch popular routes:', error);
                
                // Направления полностью переведены на таджикские города
                setPopularRoutes([
                    { 
                        from: language === 'en' ? 'Dushanbe' : (language === 'tj' ? 'Душанбе' : 'Душанбе'), 
                        to: language === 'en' ? 'Khujand' : (language === 'tj' ? 'Хуҷанд' : 'Худжанд'), 
                        price: `140 ${language === 'en' ? 'som' : (language === 'tj' ? 'с.' : 'с')}` 
                    },
                    { 
                        from: language === 'en' ? 'Khujand' : (language === 'tj' ? 'Хуҷанд' : 'Худжанд'), 
                        to: language === 'en' ? 'Panjakent' : (language === 'tj' ? 'Панҷакент' : 'Пенджикент'), 
                        price: `80 ${language === 'en' ? 'som' : (language === 'tj' ? 'с.' : 'с')}` 
                    },
                    { 
                        from: language === 'en' ? 'Dushanbe' : (language === 'tj' ? 'Душанбе' : 'Душанбе'), 
                        to: language === 'en' ? 'Bokhtar' : (language === 'tj' ? 'Бохтар' : 'Бохтар'), 
                        price: `40 ${language === 'en' ? 'som' : (language === 'tj' ? 'с.' : 'с')}` 
                    },
                    { 
                        from: language === 'en' ? 'Dushanbe' : (language === 'tj' ? 'Душанбе' : 'Душанбе'), 
                        to: language === 'en' ? 'Kulob' : (language === 'tj' ? 'Кӯлоб' : 'Куляб'), 
                        price: `70 ${language === 'en' ? 'som' : (language === 'tj' ? 'с.' : 'с')}` 
                    },
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

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Локальные данные для динамических блоков лендинга (с поддержкой TJ/RU)
    const steps = {
        passenger: [
            { icon: <Search size={24} />, title: language === 'tj' ? 'Ҷустуҷӯи сафар' : 'Найдите поездку', desc: language === 'tj' ? 'Шаҳри равоншавӣ, таъинот ва санаро ворид кунед.' : 'Укажите города отправления, прибытия и дату.' },
            { icon: <User size={24} />, title: language === 'tj' ? 'Интихоби ронанда' : 'Выбирите водителя', desc: language === 'tj' ? 'Профил ва баррасиҳои ронандагонро муқоиса кунед.' : 'Посмотрите профиль, рейтинг и отзывы о водителе.' },
            { icon: <Zap size={24} />, title: language === 'tj' ? 'Бонд кардани ҷой' : 'Забронируйте место', desc: language === 'tj' ? 'Ҷойро банд кунед ва бо ронанда тамос гиред.' : 'Подтвердите бронь и свяжитесь для уточнения деталей.' }
        ],
        driver: [
            { icon: <Car size={24} />, title: language === 'tj' ? 'Сафарро ҷойгир кунед' : 'Опубликуйте поездку', desc: language === 'tj' ? 'Маршрут, сана ва нархи як ҷойро нишон диҳед.' : 'Укажите маршрут, дату и стоимость одного места.' },
            { icon: <MessageSquare size={24} />, title: language === 'tj' ? 'Тасдиқи мусофирон' : 'Принимайте заявки', desc: language === 'tj' ? 'Мусофирон бо шумо тамос мегиранд ё ҷойро банд мекунанд.' : 'Пассажиры забронируют места и свяжутся с вами.' },
            { icon: <Compass size={24} />, title: language === 'tj' ? 'Якҷоя равед' : 'Выезжайте в путь', desc: language === 'tj' ? 'Сафар кунед ва хароҷоти сӯзишвориро кам кунед.' : 'Делите расходы на бензин и путешествуйте с компанией.' }
        ]
    };

    const faqs = [
        { q: language === 'tj' ? 'Чӣ тавр сафарро банд кунам?' : 'Как забронировать поездку?', a: language === 'tj' ? 'Маршрути дилхоҳро дар ҷустуҷӯ пайдо кунед, ронандаи мувофиқро интихоб кунед ва тугмаи "Банд кардан"-ро пахш кунед.' : 'Найдите нужный маршрут через поиск, выберите подходящего водителя и нажмите кнопку бронирования.' },
        { q: language === 'tj' ? 'Оё ин бехатар аст?' : 'Безопасно ли это?', a: language === 'tj' ? 'Мо профилҳои ронандагонро месанҷем, инчунин системаи баррасиҳо ва рейтингҳо ба шумо дар интихоби ҳамсафари боэътимод кӯмак мекунад.' : 'Мы проверяем профили водителей, а система отзывов и рейтингов помогает выбрать надежных попутчиков.' },
        { q: language === 'tj' ? 'Чӣ тавр ман метавонам пули сафарро пардохт кунам?' : 'Как оплачивается поездка?', a: language === 'tj' ? 'Пардохт одатан мустақиман ба ронанда ҳангоми сафар (бо пули нақд ё интиқоли ҳамёнҳо) анҷом дода мешавад.' : 'Оплата обычно производится напрямую водителю во время поездки наличными или переводом на кошелек.' }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container hero-container">
                    <h1 className="hero-title">{t('hero.title')}</h1>
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
                            <div className="loading-state-spinner"><div className="spinner"></div></div>
                        ) : (
                            popularRoutes.map((route, index) => (
                                <div key={index} className="route-card" onClick={() => navigate(`/search?from=${route.from}&to=${route.to}`)}>
                                    <div className="route-main-content">
                                        <div className="route-info">
                                            <span className="route-city">{route.from}</span>
                                            <ArrowRight size={16} className="route-arrow" />
                                            <span className="route-city">{route.to}</span>
                                        </div>
                                        <span className="route-price">{route.price}</span>
                                    </div>
                                    <div className="card-arrow-wrapper">
                                        <ArrowRight className="card-arrow-icon" size={20} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* NEW: How It Works Section */}
            <section className="section how-it-works">
                <div className="container">
                    <h2 className="section-title">{language === 'tj' ? 'Ин чӣ тавр кор мекунад?' : 'Как это работает?'}</h2>
                    
                    <div className="tab-buttons">
                        <button 
                            className={`tab-btn ${activeTab === 'passenger' ? 'active' : ''}`}
                            onClick={() => setActiveTab('passenger')}
                        >
                            {language === 'tj' ? 'Барои мусофирон' : 'Пассажиру'}
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'driver' ? 'active' : ''}`}
                            onClick={() => setActiveTab('driver')}
                        >
                            {language === 'tj' ? 'Барои ронандагон' : 'Водителю'}
                        </button>
                    </div>

                    <div className="steps-grid">
                        {steps[activeTab].map((step, idx) => (
                            <div key={idx} className="step-card">
                                <div className="step-number">{idx + 1}</div>
                                <div className="step-icon-box">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper bg-blue-light">
                                <span role="img" aria-label="save" style={{ fontSize: '2rem' }}>💰</span>
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

            {/* NEW: Testimonials Section */}
            <section className="section testimonials-section">
                <div className="container">
                    <h2 className="section-title">{language === 'tj' ? 'Ҳамсафарони мо чӣ мегӯянд' : 'Что говорят наши попутчики'}</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="stars"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                            <p className="review-text">"Аз Хуҷанд ба Душанбе хеле тез ва арзон омадам. Ронанда бисёр хушмуомила буд!"</p>
                            <div className="user-info">
                                <div className="user-avatar">А</div>
                                <div>
                                    <h4>Алишер Р.</h4>
                                    <span>{language === 'tj' ? 'Мусофир' : 'Пассажир'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="stars"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                            <p className="review-text">"Пулҳои бензинро пурра мепӯшонад. Ҳамсафарони хуб пайдо кардам, акнун танҳо ҳамин тавр сафар мекунам."</p>
                            <div className="user-info">
                                <div className="user-avatar driver-av">Ф</div>
                                <div>
                                    <h4>Фарҳод С.</h4>
                                    <span>{language === 'tj' ? 'Ронанда' : 'Водитель'}</span>
                                </div>
                            </div>
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

            {/* NEW: FAQ Section */}
            <section className="section faq-section">
                <div className="container max-w-md">
                    <h2 className="section-title">{language === 'tj' ? 'Саволҳои зуд-зуд додашаванда' : 'Частые вопросы'}</h2>
                    <div className="faq-list">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`} onClick={() => toggleFaq(idx)}>
                                <div className="faq-question">
                                    <h3>{faq.q}</h3>
                                    <ChevronDown size={20} className="faq-chevron" />
                                </div>
                                <div className="faq-answer">
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;