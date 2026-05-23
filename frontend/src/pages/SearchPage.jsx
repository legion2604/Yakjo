import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Circle, Calendar, User, ArrowRight, Star } from 'lucide-react';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';
import './SearchPage.css';
import './HomePage.css';

const MOCK_RIDES = [
    {
        id: 1,
        from: 'Душанбе',
        to: 'Худжанд',
        departureTime: '2026-05-24T08:00:00',
        arrivalTime: '2026-05-24T12:30:00',
        price: 140,
        availableSeats: 3,
        description: 'Еду аккуратно, машина чистая, едем через Шахристан.',
        driver: { firstName: 'Фарход', rating: 4.9, avatarUrl: null, phone: '+992 90 123 4567' },
        car: 'Toyota Camry'
    },
    {
        id: 2,
        from: 'Душанбе',
        to: 'Куляб',
        departureTime: '2026-05-24T14:30:00',
        arrivalTime: '2026-05-24T17:00:00',
        price: 80,
        availableSeats: 2,
        description: 'Комфортная поездка, кондиционер работает.',
        driver: { firstName: 'Jamoliddin', rating: 4.8, avatarUrl: null, phone: '+992 90 987 6543' },
        car: 'Hyundai Sonata'
    }
];

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t, language } = useSettings();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formState, setFormState] = useState({
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        date: searchParams.get('date') || '',
        seats: searchParams.get('seats') || 1
    });

    useEffect(() => {
        const fetchRides = async () => {
            setLoading(true);
            try {
                const currentPage = parseInt(searchParams.get('page') || '1');
                const params = {
                    from: searchParams.get('from'),
                    to: searchParams.get('to'),
                    date: searchParams.get('date'),
                    seats: searchParams.get('seats'),
                    sort: searchParams.get('sort'),
                    page: currentPage,
                    limit: 10
                };
                const response = await ridesApi.search(params);
                const newRides = Array.isArray(response) ? response : (response?.data || []);

                if (currentPage === 1) {
                    setRides(newRides);
                } else {
                    setRides(prev => [...prev, ...newRides]);
                }
            } catch (error) {
                console.error('Search failed:', error);
                const currentPage = parseInt(searchParams.get('page') || '1');
                const from = searchParams.get('from');
                const to = searchParams.get('to');
                const filtered = MOCK_RIDES.filter(ride => {
                    if (from && !ride.from.toLowerCase().includes(from.toLowerCase())) return false;
                    if (to && !ride.to.toLowerCase().includes(to.toLowerCase())) return false;
                    return true;
                });
                const fallbackRides = filtered.length > 0 ? filtered : (from || to ? [] : MOCK_RIDES);

                if (currentPage === 1) {
                    setRides(fallbackRides);
                } else {
                    // Fail-safe
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, [searchParams]);

    const handleSearchUpdate = (e) => {
        e.preventDefault();
        setSearchParams(formState);
    };

    const handleSelectRide = (id) => {
        navigate(`/ride/${id}`);
    };

    return (
        <div className="search-page container">
            {/* Поисковая панель на всю ширину */}
            <div className="search-header-container">
                <form className="search-bar compact-search-bar" onSubmit={handleSearchUpdate}>
                    <div className="search-field location-field">
                        <Circle className="field-icon search-icon-circle" size={20} />
                        <input
                            type="text"
                            placeholder={t('hero.placeholderFrom')}
                            value={formState.from}
                            onChange={(e) => setFormState({ ...formState, from: e.target.value })}
                            required
                        />
                    </div>

                    <div className="field-divider"></div>

                    <div className="search-field location-field">
                        <Circle className="field-icon search-icon-circle" size={20} />
                        <input
                            type="text"
                            placeholder={t('hero.placeholderTo')}
                            value={formState.to}
                            onChange={(e) => setFormState({ ...formState, to: e.target.value })}
                            required
                        />
                    </div>

                    <div className="field-divider"></div>

                    <div className="search-field date-field">
                        <Calendar className="field-icon" size={20} />
                        <input
                            type="date"
                            value={formState.date}
                            onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                        />
                    </div>

                    <div className="field-divider"></div>

                    <div className="search-field seats-field">
                        <User className="field-icon" size={20} />
                        <input
                            type="number"
                            min="1"
                            max="8"
                            value={formState.seats}
                            onChange={(e) => setFormState({ ...formState, seats: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="search-submit-btn">
                        {t('hero.searchBtn')}
                    </button>
                </form>
            </div>

            <div className="search-layout">
                {/* Левый Сайдбар Сортировки */}
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <h3>{language === 'tj' ? 'Тартиб додан' : 'Сортировка'}</h3>
                    </div>
                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={formState.sort || 'price_asc'}
                            onChange={(e) => {
                                const newSort = e.target.value;
                                setFormState({ ...formState, sort: newSort });
                                setSearchParams({ ...formState, sort: newSort });
                            }}
                        >
                            <option value="price_asc">{t('search.cheap')}</option>
                            <option value="time_asc">{t('search.early')}</option>
                            <option value="price_desc">{t('search.expensive')}</option>
                        </select>
                    </div>
                </aside>

                {/* Основной список результатов */}
                <main className="results-list">
                    <h2 className="results-title">
                        {searchParams.get('date') ? `${t('search.title')} — ${new Date(searchParams.get('date')).toLocaleDateString()}` : t('search.title')}
                    </h2>

                    {loading && rides.length === 0 ? (
                        <div className="loading-state-spinner"><div className="spinner"></div></div>
                    ) : (
                        <>
                            <div className="rides-grid-container">
                                {rides.map(ride => (
                                    <div key={ride.id} className="ride-card" onClick={() => handleSelectRide(ride.id)}>
                                        
                                        {/* Левая сторона карточки */}
                                        <div className="ride-card-main">
                                            {/* Первая строка: Маршрут */}
                                            <div className="ride-timeline">
                                                <div className="time-block">
                                                    <span className="time">
                                                        {new Date(ride.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    <span className="city">{ride.from}</span>
                                                </div>
                                                <div className="route-line-indicator">
                                                    <div className="indicator-dot"></div>
                                                    <div className="indicator-line"></div>
                                                    <div className="indicator-dot filled"></div>
                                                </div>
                                                <div className="time-block">
                                                    <span className="time">
                                                        {new Date(ride.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    <span className="city">{ride.to}</span>
                                                </div>
                                            </div>

                                            {/* Вторая строка: Водитель и Машина */}
                                            <div className="ride-driver-car-info">
                                                <div className="driver-profile">
                                                    <div className="avatar-placeholder">{ride.driver.firstName[0]}</div>
                                                    <div>
                                                        <h4 className="driver-name">{ride.driver.firstName}</h4>
                                                        <div className="driver-rating">
                                                            <Star size={14} fill="currentColor" />
                                                            <span>{ride.driver.rating || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {ride.car && (
                                                    <div className="car-tag">
                                                        <span>{ride.car}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Правая сторона карточки */}
                                        <div className="ride-card-sidebar">
                                            <div className="price-details-box">
                                                <div className="price-tag">
                                                    {ride.price} {language === 'tj' ? 'с.' : 'сомони'}
                                                </div>
                                                <div className="seats-tag">
                                                    {language === 'tj' ? `Ҷои холи: ${ride.availableSeats}` : `Свободно: ${ride.availableSeats}`}
                                                </div>
                                            </div>
                                            <button className="book-btn-action">
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {rides.length > 0 && rides.length % 10 === 0 && (
                                <div className="flex justify-center mt-8">
                                    <Button
                                        variant="ghost"
                                        isLoading={loading}
                                        onClick={() => {
                                            const nextPage = (parseInt(searchParams.get('page') || '1')) + 1;
                                            setSearchParams({ ...formState, page: nextPage });
                                        }}
                                    >
                                        {t('search.loadMore')}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {!loading && rides.length === 0 && (
                        <div className="empty-state">
                            <h3>{t('search.noRides')}</h3>
                            <p>{t('search.tryAgain')}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchPage;