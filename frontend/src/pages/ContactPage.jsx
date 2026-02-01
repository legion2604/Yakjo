import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './ContactPage.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-page container">
            <div className="contact-grid">
                <div className="contact-info">
                    <h1>Свяжитесь с нами</h1>
                    <p className="contact-subtitle">
                        У вас есть вопросы или предложения? Напишите нам, и мы с радостью ответим.
                    </p>

                    <div className="contact-list">
                        <div className="contact-item">
                            <div className="contact-icon">
                                <Mail size={24} />
                            </div>
                            <div className="contact-details">
                                <h3>Email</h3>
                                <p>support@yakjo.tj</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon">
                                <Phone size={24} />
                            </div>
                            <div className="contact-details">
                                <h3>Телефон</h3>
                                <p>+992 90 000 0000</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon">
                                <MapPin size={24} />
                            </div>
                            <div className="contact-details">
                                <h3>Офис</h3>
                                <p>г. Душанбе, пр. Рудаки 100</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-form-wrapper">
                    <form onSubmit={handleSubmit} className="contact-form">
                        <Input
                            label="Ваше имя"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <div className="form-group">
                            <label className="input-label">Сообщение</label>
                            <textarea
                                className="textarea-field"
                                rows="5"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <Button type="submit" size="lg" className="w-full">
                            Отправить
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
