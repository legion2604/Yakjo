import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Circle, Calendar, User } from 'lucide-react';
import { ridesApi } from '../api/rides';
import RideCard from '../components/RideCard';
import Button from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';
import './SearchPage.css';
import './HomePage.css';

// Fallback Mock Data for UI stability if API fails
const MOCK_RIDES = [
    {
        id: '1',
        from: 'Душанбе',
        to: 'Худжанд',
        departureTime: '2024-02-21T08:00:00',
        arrivalTime: '2024-02-21T12:30:00',
        price: 120,
        availableSeats: 3,
        description: 'Еду аккуратно, машина чистая.',
        driver: { firstName: 'Фарход', rating: 4.8, avatarUrl: null, phone: '+992 90 123 4567' },
        car: 'Toyota Camry'
    },
    {
        id: '2',
        from: 'Душанбе',
        to: 'Худжанд',
        departureTime: '2024-02-21T09:30:00',
        arrivalTime: '2024-02-21T14:00:00',
        price: 100,
        availableSeats: 2,
        description: 'Комфортная поездка, есть кондиционер.',
        driver: { firstName: 'Алишер', rating: 4.5, avatarUrl: null, phone: '+992 90 987 6543' },
        car: 'Opel Astra'
    }
];

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useSettings();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
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
                // Fetch from real backend
                const params = {
                    from: searchParams.get('from'),
                    to: searchParams.get('to'),
                    date: searchParams.get('date'),
                    seats: searchParams.get('seats')
                };
                const data = await ridesApi.search(params);
                setRides(data);
            } catch (error) {
                console.error('Search failed:', error);
                // Fallback for demo
                const from = searchParams.get('from');
                const to = searchParams.get('to');
                const filtered = MOCK_RIDES.filter(ride => {
                    if (from && !ride.from.toLowerCase().includes(from.toLowerCase())) return false;
                    if (to && !ride.to.toLowerCase().includes(to.toLowerCase())) return false;
                    return true;
                });
                setRides(filtered.length > 0 ? filtered : (from || to ? [] : MOCK_RIDES));
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
            <div className="search-header-container">
                <form className="search-bar compact-search-bar" onSubmit={handleSearchUpdate}>
                    <div className="search-field location-field">
                        <Circle className="field-icon search-icon-circle" size={18} />
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
                        <Circle className="field-icon search-icon-circle" size={18} />
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
                        <Calendar className="field-icon" size={18} />
                        <input
                            type="date"
                            value={formState.date}
                            onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                            placeholder={t('hero.placeholderDate')}
                        />
                    </div>

                    <div className="field-divider"></div>

                    <div className="search-field seats-field">
                        <User className="field-icon" size={18} />
                        <input
                            type="number"
                            min="1"
                            max="8"
                            value={formState.seats}
                            onChange={(e) => setFormState({ ...formState, seats: e.target.value })}
                            placeholder={t('hero.placeholderSeats')}
                        />
                    </div>

                    <button type="submit" className="search-submit-btn">
                        {t('hero.searchBtn')}
                    </button>
                </form>
            </div>

            <div className="search-layout">
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <h3>{t('search.sortBy')}</h3>
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
                            <option value="price_desc">Сначала дорогие</option>
                        </select>
                    </div>

                    <div className="filters-header mt-4">
                        <h3>{t('search.price')}</h3>
                    </div>
                    <div className="filter-group">
                        <input type="range" min="0" max="500" className="w-full" />
                    </div>
                </aside>

                <main className="results-list">
                    <h2 className="results-title">
                        {searchParams.get('date') ? `${t('search.title')} - ${new Date(searchParams.get('date')).toLocaleDateString()}` : t('search.title')}
                    </h2>

                    {loading && rides.length === 0 ? (
                        <div className="loading-state">{t('search.loading')}</div>
                    ) : (
                        <>
                            {rides.map(ride => (
                                <RideCard
                                    key={ride.id}
                                    ride={ride}
                                    onSelect={handleSelectRide}
                                />
                            ))}

                            {rides.length > 0 && rides.length % 10 === 0 && (
                                <div className="flex justify-center mt-6">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            const nextPage = (parseInt(searchParams.get('page') || '1')) + 1;
                                            setSearchParams({ ...formState, page: nextPage });
                                        }}
                                    >
                                        Загрузить еще
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
