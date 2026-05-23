import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Camera, User as UserIcon, Mail, Calendar, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { usersApi } from '../api/users';
import { ridesApi } from '../api/rides';
import Button from '../components/ui/Button';
import './ProfilePage.css';

const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();
    const { t } = useSettings();
    const [publicUser, setPublicUser] = useState(null);
    const [myRides, setMyRides] = useState([]);
    const [loadingRides, setLoadingRides] = useState(false);
    const [loading, setLoading] = useState(!!id);

    const isOwnProfile = !id || (currentUser && currentUser.id === parseInt(id));

    useEffect(() => {
        if (id && !isOwnProfile) {
            const fetchUser = async () => {
                setLoading(true);
                try {
                    const data = await usersApi.getById(id);
                    setPublicUser(data);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    setPublicUser(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchUser();
        } else {
            setLoading(false);
            if (isOwnProfile) {
                fetchMyRides();
            }
        }
    }, [id, isOwnProfile]);

    const fetchMyRides = async () => {
        setLoadingRides(true);
        try {
            const data = await ridesApi.getMyRides();
            setMyRides(data || []);
        } catch (error) {
            console.error("Failed to fetch my rides:", error);
        } finally {
            setLoadingRides(false);
        }
    };

    const handleDeleteRide = async (rideId) => {
        if (window.confirm(t('profile.myRides.confirmDelete'))) {
            try {
                await ridesApi.delete(rideId);
                alert(t('profile.myRides.deleted'));
                setMyRides(myRides.filter(r => r.id !== rideId));
            } catch (error) {
                console.error("Failed to delete ride:", error);
                alert(t('profile.myRides.errorDelete'));
            }
        }
    };

    const displayUser = isOwnProfile ? currentUser : publicUser;

    if (loading) {
        return <div className="container mt-8 text-center">{t('chats.loading') || 'Загрузка...'}</div>;
    }

    if (!displayUser) {
        return <div className="container mt-8 text-center">Профиль не найден</div>;
    }

    const formatBirthDate = (dateStr) => {
        if (!dateStr) return '—';
        return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    };

    // Fallback data if user is missing some fields
    const userData = {
        firstName: displayUser.firstName || '...',
        lastName: displayUser.lastName || '...',
        phone: displayUser.phone || '...',
        email: displayUser.email || '—',
        birthDate: formatBirthDate(displayUser.birthDate),
        carBrand: displayUser.carBrand || '—',
        bio: displayUser.bio || '',
        avatarUrl: displayUser.avatarUrl || null,
        rating: displayUser.rating || 5.0,
        isVerified: displayUser.isVerified ?? true
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="profile-page container">
            <div className="profile-layout">
                <aside className="profile-sidebar">
                    <div className="profile-card user-card">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar">
                                {userData.avatarUrl ? (
                                    <img src={userData.avatarUrl} alt={userData.firstName} />
                                ) : (
                                    <span>{userData.firstName[0]}</span>
                                )}
                            </div>
                            {isOwnProfile && (
                                <button className="edit-avatar-btn">
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>

                        <h2 className="profile-name">{userData.firstName} {userData.lastName}</h2>

                        {userData.isVerified && (
                            <div className="verified-badge">
                                <Shield size={16} />
                                <span>{t('profile.verified')}</span>
                            </div>
                        )}

                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-value">{userData.rating}</span>
                                <span className="stat-label">{t('profile.stats.rating')}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">0</span>
                                <span className="stat-label">{t('profile.stats.rides')}</span>
                            </div>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <div className="sidebar-menu">
                            <Button variant="ghost" className="menu-btn logout-btn" onClick={handleLogout}>
                                <LogOut size={20} />
                                <span>{t('profile.logout')}</span>
                            </Button>
                        </div>
                    )}
                </aside>

                <main className="profile-content">
                    <div className="section-card">
                        <h3 className="section-title">{t('profile.personalInfo')}</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label><UserIcon size={14} /> {t('register.firstName')}</label>
                                <div className="info-value">{userData.firstName}</div>
                            </div>
                            <div className="info-item">
                                <label><UserIcon size={14} /> {t('register.lastName')}</label>
                                <div className="info-value">{userData.lastName}</div>
                            </div>
                            <div className="info-item">
                                <label><Calendar size={14} /> {t('register.birthDate')}</label>
                                <div className="info-value">{userData.birthDate}</div>
                            </div>
                            <div className="info-item">
                                <label><Mail size={14} /> {t('register.email')}</label>
                                <div className="info-value">{userData.email}</div>
                            </div>
                            <div className="info-item">
                                <label><Car size={14} /> {t('register.carBrand')}</label>
                                <div className="info-value">{userData.carBrand}</div>
                            </div>
                            {isOwnProfile && displayUser?.whatsapp && (
                                <div className="info-item">
                                    <label>WhatsApp</label>
                                    <div className="info-value">{displayUser.whatsapp}</div>
                                </div>
                            )}
                            {isOwnProfile && displayUser?.telegram && (
                                <div className="info-item">
                                    <label>Telegram</label>
                                    <div className="info-value">{displayUser.telegram}</div>
                                </div>
                            )}
                        </div>

                        {userData.bio && (
                            <div className="bio-section mt-6">
                                <label>{t('register.bio')}</label>
                                <p className="bio-text">{userData.bio}</p>
                            </div>
                        )}

                        {isOwnProfile && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-6"
                                onClick={() => navigate('/profile/edit')}
                            >
                                {t('profile.edit')}
                            </Button>
                        )}
                    </div>

                    {isOwnProfile && (
                        <div className="section-card">
                            <h3 className="section-title">{t('profile.trips')}</h3>
                            {loadingRides ? (
                                <div className="text-center p-4">{t('chats.loading') || 'Загрузка...'}</div>
                            ) : myRides.length === 0 ? (
                                <div className="empty-trips">
                                    <p>{t('profile.noTrips')}</p>
                                    <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/publish')}>
                                        {t('publish.button')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="my-rides-list">
                                    {myRides.map((ride) => (
                                        <div key={ride.id} className="my-ride-card" style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{ride.from} → {ride.to}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                                {ride.date} {ride.time} | {ride.price} {t('publish.labelPrice').includes('сом') ? 'с' : 's'}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/ride/${ride.id}/edit`)}>
                                                    {t('profile.myRides.edit')}
                                                </Button>
                                                <Button size="sm" variant="ghost" style={{ color: 'red' }} onClick={() => handleDeleteRide(ride.id)}>
                                                    {t('profile.myRides.delete')}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
