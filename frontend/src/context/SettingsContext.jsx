import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // --- Language State ---
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app-language') || 'ru';
    });

    // --- Theme State ---
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('app-language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
        // Apply theme class to body/html
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // --- Translations ---
    const translations = {
        ru: {
            nav: { search: 'Найти', publish: 'Опубликовать', about: 'О нас', contact: 'Контакты', login: 'Войти', register: 'Регистрация', profile: 'Профиль', logout: 'Выйти', chats: 'Чаты' },
            hero: { title: 'Путешествуйте с комфортом и выгодой', subtitle: 'Более 1 миллиона маршрутов по всей стране', searchBtn: 'Найти поездку', placeholderFrom: 'Откуда', placeholderTo: 'Куда', placeholderDate: 'Сегодня', placeholderSeats: '1' },
            features: {
                save: { title: 'Экономьте на поездках', desc: 'Никаких скрытых комиссий. Оплата наличными или картой водителю.' },
                safety: { title: 'Безопасность', desc: 'Мы проверяем каждого водителя. Система рейтингов помогает выбрать лучших.' },
                fast: { title: 'Быстро и удобно', desc: 'Бронирование за 2 минуты. Мгновенное подтверждение поездки.' }
            },
            cta: { title: 'Вы водитель?', text: 'Опубликуйте поездку и сэкономьте на бензине. Это бесплатно и занимает пару минут.', button: 'Опубликовать поездку' },
            popular: { title: 'Популярные направления' },
            ride: {
                details: 'Детали поездки',
                route: 'Маршрут',
                driver: 'Водитель',
                car: 'Автомобиль',
                questions: 'Есть вопросы? {name} ответит!',
                passengers: 'пассажир',
                total: 'Итого',
                contact: 'Связаться',
                priceForOne: 'Цена за 1 место',
                freeSeats: 'Свободно мест',
                verified: 'Подтвержденный профиль',
                reviews: 'отзыв',
                age: 'лет',
                comment: 'Комментарий водителя',
                back: 'Назад',
                rateDriver: 'Оценить водителя',
                writeReview: 'Напишите отзыв...',
                cancel: 'Отмена',
                submit: 'Отправить',
                call: 'Позвонить',
                writeChat: 'Написать в чат'
            },
            search: {
                title: 'Доступные поездки',
                filters: 'Фильтры',
                sortBy: 'Сортировка',
                price: 'Цена',
                noRides: 'Поездок не найдено',
                tryAgain: 'Попробуйте изменить параметры поиска',
                loading: 'Загрузка поездок...',
                cheap: 'Самые дешевые',
                early: 'Самые ранние',
                seats: 'Мест',
                expensive: 'Сначала дорогие',
                loadMore: 'Загрузить еще'
            },
            chats: {
                title: 'Мои чаты',
                loading: 'Загрузка...',
                empty: 'У вас пока нет чатов',
                unknown: 'Неизвестный',
                noMessages: 'Нет сообщений',
                partner: 'Собеседник',
                typeMessage: 'Написать сообщение...'
            },
            auth: {
                login: 'Вход на Yakjo',
                confirm: 'Подтверждение',
                phonePlaceholder: 'Номер телефона (+992...)',
                otpPlaceholder: 'Код из SMS (123456)',
                getOtp: 'Получить код',
                enter: 'Войти',
                resend: 'Отправить код повторно',
                phoneSubtitle: 'Введите номер телефона для входа или регистрации',
                otpSubtitle: 'Мы отправили код на номер {phone}',
                back: 'Назад',
                errorPhone: 'Введите корректный номер',
                errorOtp: 'Код должен содержать 6 цифр',
                errorVerify: 'Неверный код подтверждения',
                errorSend: 'Ошибка отправки SMS. Попробуйте снова.'
            },
            register: {
                title: 'Завершение регистрации',
                subtitle: 'Пожалуйста, введите ваше имя и фамилию',
                firstName: 'Имя',
                lastName: 'Фамилия',
                birthDate: 'Дата рождения',
                carBrand: 'Марка автомобиля',
                email: 'Электронная почта',
                bio: 'О себе (по желанию)',
                button: 'Завершить',
                error: 'Пожалуйста, заполните обязательные поля'
            },
            profile: {
                title: 'Профиль',
                personalInfo: 'Личные данные',
                trips: 'Мои поездки',
                noTrips: 'У вас пока нет активных поездок.',
                edit: 'Редактировать',
                logout: 'Выйти',
                verified: 'Подтвержденный профиль',
                stats: { rating: 'Рейтинг', rides: 'Поездок' },
                myRides: {
                    edit: 'Изменить',
                    delete: 'Удалить',
                    confirmDelete: 'Вы уверены, что хотите удалить эту поездку?',
                    deleted: 'Поездка удалена',
                    errorDelete: 'Ошибка при удалении',
                    editTitle: 'Изменение поездки'
                }
            },
            publish: {
                title: 'Предложить поездку',
                subtitle: 'Заполните детали, чтобы найти попутчиков',
                route: 'Маршрут',
                dateTime: 'Время и Дата',
                details: 'Детали',
                comment: 'Комментарий',
                placeholderFrom: 'Откуда (Город, улица)',
                placeholderTo: 'Куда (Город, улица)',
                labelFrom: 'Откуда',
                labelTo: 'Куда',
                labelDate: 'Дата выезда',
                labelTime: 'Время',
                labelPrice: 'Цена (сом)',
                labelSeats: 'Количество мест',
                pricePlaceholder: 'Цена за место',
                commentPlaceholder: 'Укажите детали: место встречи, размер багажа...',
                success: 'Поездка успешно опубликована!',
                button: 'Опубликовать поездку',
                errorPast: 'Нельзя создать поездку в прошлом времени',
                errorArrival: 'Время прибытия не может быть раньше времени отправления',
                errorDuplicate: 'У вас уже есть поездка в это время. Выберите другое время или удалите старую поездку.',
                errorLimit: 'Превышен лимит активных поездок (макс. 3) или ваш аккаунт ограничен.',
                errorGeneric: 'Ошибка при публикации: ',
                errorTryLater: 'попробуйте позже'
            },
            editProfile: {
                errorName: 'Имя должно содержать минимум 2 символа',
                errorBio: 'О себе: максимум 500 символов',
                errorWhatsapp: 'Введите корректный номер WhatsApp (минимум 9 цифр)',
                errorUpdate: 'Ошибка при обновлении профиля: ',
                transport: 'Транспорт',
                contacts: 'Контакты для связи',
                about: 'О себе',
                cancel: 'Отмена',
                save: 'Сохранить',
                placeholderCar: 'Например: Toyota Camry, Белый',
                placeholderBio: 'Расскажите немного о себе, стаже вождения и т.д.'
            }
        },
        en: {
            nav: { search: 'Search', publish: 'Publish', about: 'About', contact: 'Contact', login: 'Login', register: 'Sign Up', profile: 'Profile', logout: 'Logout', chats: 'Chats' },
            hero: { title: 'Travel with comfort and value', subtitle: 'Over 1 million routes across the country', searchBtn: 'Find a ride', placeholderFrom: 'From', placeholderTo: 'To', placeholderDate: 'Today', placeholderSeats: '1' },
            features: {
                save: { title: 'Save on travel', desc: 'No hidden fees. Pay cash or card to the driver.' },
                safety: { title: 'Safety', desc: 'We verify every driver. Rating system helps you choose the best.' },
                fast: { title: 'Fast and convenient', desc: 'Booking in 2 minutes. Instant confirmation of the trip.' }
            },
            cta: { title: 'Are you a driver?', text: 'Publish a ride and save on gas. It is free and takes a couple of minutes.', button: 'Publish a ride' },
            popular: { title: 'Popular Destinations' },
            ride: {
                details: 'Ride Details',
                route: 'Route',
                driver: 'Driver',
                car: 'Car',
                questions: 'Have questions? {name} will answer!',
                passengers: 'passenger',
                total: 'Total',
                contact: 'Contact',
                priceForOne: 'Price per seat',
                freeSeats: 'Seats left',
                verified: 'Verified profile',
                reviews: 'review',
                age: 'years',
                comment: 'Driver comment',
                back: 'Back',
                rateDriver: 'Rate Driver',
                writeReview: 'Write a review...',
                cancel: 'Cancel',
                submit: 'Submit',
                call: 'Call',
                writeChat: 'Message in chat'
            },
            search: {
                title: 'Available rides',
                filters: 'Filters',
                sortBy: 'Sort by',
                price: 'Price',
                noRides: 'No rides found',
                tryAgain: 'Try changing search parameters',
                loading: 'Loading rides...',
                cheap: 'Cheapest',
                early: 'Earliest',
                seats: 'Seats',
                expensive: 'Most expensive',
                loadMore: 'Load more'
            },
            chats: {
                title: 'My Chats',
                loading: 'Loading...',
                empty: 'You have no chats yet',
                unknown: 'Unknown',
                noMessages: 'No messages',
                partner: 'Partner',
                typeMessage: 'Type a message...'
            },
            auth: {
                login: 'Login to Yakjo',
                confirm: 'Confirmation',
                phonePlaceholder: 'Phone number (+992...)',
                otpPlaceholder: 'SMS Code (123456)',
                getOtp: 'Get Code',
                enter: 'Login',
                resend: 'Resend code',
                phoneSubtitle: 'Enter phone number to login or register',
                otpSubtitle: 'We sent a code to {phone}',
                back: 'Back',
                errorPhone: 'Enter a valid number',
                errorOtp: 'Code must contain 6 digits',
                errorVerify: 'Invalid confirmation code',
                errorSend: 'SMS send error. Try again.'
            },
            register: {
                title: 'Complete Registration',
                subtitle: 'Please enter your first and last name',
                firstName: 'First Name',
                lastName: 'Last Name',
                birthDate: 'Birth Date',
                carBrand: 'Car Brand',
                email: 'Email',
                bio: 'About me (optional)',
                button: 'Complete',
                error: 'Please fill in required fields'
            },
            profile: {
                title: 'Profile',
                personalInfo: 'Personal Info',
                trips: 'My Trips',
                noTrips: 'You have no active trips yet.',
                edit: 'Edit',
                logout: 'Logout',
                verified: 'Verified Profile',
                stats: { rating: 'Rating', rides: 'Rides' },
                myRides: {
                    edit: 'Edit',
                    delete: 'Delete',
                    confirmDelete: 'Are you sure you want to delete this ride?',
                    deleted: 'Ride deleted',
                    errorDelete: 'Failed to delete ride',
                    editTitle: 'Edit Ride'
                }
            },
            publish: {
                title: 'Offer a Ride',
                subtitle: 'Fill in the details to find passengers',
                route: 'Route',
                dateTime: 'Time and Date',
                details: 'Details',
                comment: 'Comment',
                placeholderFrom: 'From (City, street)',
                placeholderTo: 'To (City, street)',
                labelFrom: 'From',
                labelTo: 'To',
                labelDate: 'Departure Date',
                labelTime: 'Time',
                labelPrice: 'Price (som)',
                labelSeats: 'Number of Seats',
                pricePlaceholder: 'Price per seat',
                commentPlaceholder: 'Enter details: meeting point, luggage size...',
                success: 'Ride published successfully!',
                button: 'Publish Ride',
                errorPast: 'Cannot create a ride in the past',
                errorArrival: 'Arrival time cannot be earlier than departure time',
                errorDuplicate: 'You already have a ride at this time. Choose another time or delete the old ride.',
                errorLimit: 'Active rides limit exceeded (max 3) or your account is restricted.',
                errorGeneric: 'Publish error: ',
                errorTryLater: 'try again later'
            },
            editProfile: {
                errorName: 'Name must contain at least 2 characters',
                errorBio: 'About me: maximum 500 characters',
                errorWhatsapp: 'Enter a valid WhatsApp number (min 9 digits)',
                errorUpdate: 'Profile update error: ',
                transport: 'Transport',
                contacts: 'Contact Info',
                about: 'About me',
                cancel: 'Cancel',
                save: 'Save',
                placeholderCar: 'Example: Toyota Camry, White',
                placeholderBio: 'Tell a bit about yourself, driving experience, etc.'
            }
        },
        tj: {
            nav: { search: 'Ҷустуҷӯ', publish: 'Эълон кардан', about: 'Дар бораи мо', contact: 'Тамос', login: 'Воридшавӣ', register: 'Бақайдгирӣ', profile: 'Профил', logout: 'Баромад', chats: 'Чатҳо' },
            hero: { title: 'Сафар бо роҳат ва арзон', subtitle: 'Зиёда аз 1 миллион хатсайр дар саросари кишвар', searchBtn: 'Ҷустуҷӯи сафар', placeholderFrom: 'Аз куҷо', placeholderTo: 'Ба куҷо', placeholderDate: 'Имрӯз', placeholderSeats: '1' },
            features: {
                save: { title: 'Дар сафар сарфа кунед', desc: 'Ҳеҷ гуна пардохтҳои пинҳонӣ. Пардохт бо нақд ё корт ба ронанда.' },
                safety: { title: 'Бехатарӣ', desc: 'Мо ҳар як ронандаро месанҷем. Системаи рейтинг ба шумо кӯмак мекунад, ки беҳтаринро интихоб кунед.' },
                fast: { title: 'Тез ва қулай', desc: 'Бронкунӣ дар 2 дақиқа. Тасдиқи фаврии сафар.' }
            },
            cta: { title: 'Шумо ронанда ҳастед?', text: 'Сафарро нашр кунед ва сӯзишвориро сарфа кунед. Ин ройгон аст ва якчанд дақиқа мегирад.', button: 'Нашри сафар' },
            popular: { title: 'Самтҳои машҳур' },
            ride: {
                details: 'Тафсилоти сафар',
                route: 'Масир',
                driver: 'Ронанда',
                car: 'Мошин',
                questions: 'Савол доред? {name} ҷавоб медиҳад!',
                passengers: 'мусофир',
                total: 'Ҷамъ',
                contact: 'Тамос',
                priceForOne: 'Нарх барои 1 ҷой',
                freeSeats: 'Ҷойҳои холӣ',
                verified: 'Профили тасдиқшуда',
                reviews: 'тафсир',
                age: 'сола',
                comment: 'Шарҳи ронанда',
                back: 'Ба ақиб',
                rateDriver: 'Ронандаро баҳо диҳед',
                writeReview: 'Тафсир нависед...',
                cancel: 'Бекор кардан',
                submit: 'Фиристодан',
                call: 'Занг задан',
                writeChat: 'Дар чат нависед'
            },
            search: {
                title: 'Сафарҳои дастрас',
                filters: 'Филтрҳо',
                sortBy: 'Тартиб додан',
                price: 'Нарх',
                noRides: 'Сафарҳо ёфт нашуданд',
                tryAgain: 'Параметрҳои ҷустуҷӯро иваз кунед',
                loading: 'Ҷустуҷӯи сафарҳо...',
                cheap: 'Арзонтарин',
                early: 'Аввалин',
                seats: 'Ҷойҳо',
                expensive: 'Аввал қиматҳо',
                loadMore: 'Боркунии бештар'
            },
            chats: {
                title: 'Чатҳои ман',
                loading: 'Боргирӣ...',
                empty: 'Шумо то ҳол чат надоред',
                unknown: 'Номаълум',
                noMessages: 'Паём нест',
                partner: 'Ҳамсӯҳбат',
                typeMessage: 'Паём нависед...'
            },
            auth: {
                login: 'Воридшавӣ ба Yakjo',
                confirm: 'Тасдиқкунӣ',
                phonePlaceholder: 'Рақами телефон (+992...)',
                otpPlaceholder: 'Рамзи SMS (123456)',
                getOtp: 'Гирифтани рамз',
                enter: 'Воридшавӣ',
                resend: 'Рамзро аз нав фиристед',
                phoneSubtitle: 'Рақами телефонро барои воридшавӣ ё бақайдгирӣ ворид кунед',
                otpSubtitle: 'Мо рамзро ба рақами {phone} фиристодем',
                back: 'Ба ақиб',
                errorPhone: 'Рақами дурустро ворид кунед',
                errorOtp: 'Рамз бояд 6 рақам дошта бошад',
                errorVerify: 'Рамзи тасдиқ нодуруст аст',
                errorSend: 'Хатогӣ дар фиристодани SMS. Дубора кӯшиш кунед.'
            },
            register: {
                title: 'Анҷоми бақайдгирӣ',
                subtitle: 'Лутфан ном ва насаби худро ворид кунед',
                firstName: 'Ном',
                lastName: 'Насаб',
                birthDate: 'Таърихи таваллуд',
                carBrand: 'Тамғаи мошин',
                email: 'Почтаи электронӣ',
                bio: 'Дар бораи худ (ихтиёрӣ)',
                button: 'Анҷом додан',
                error: 'Лутфан ҷойҳои ҳатмиро пур кунед'
            },
            profile: {
                title: 'Профил',
                personalInfo: 'Маълумоти шахсӣ',
                trips: 'Сафарҳои ман',
                noTrips: 'Шумо то ҳол сафари фаъол надоред.',
                edit: 'Ислоҳ кардан',
                logout: 'Баромад',
                verified: 'Профили тасдиқшуда',
                stats: { rating: 'Рейтинг', rides: 'Сафарҳо' },
                myRides: {
                    edit: 'Тағйир додан',
                    delete: 'Нест кардан',
                    confirmDelete: 'Оё шумо мутмаин ҳастед, ки ин сафарро нест кардан мехоҳед?',
                    deleted: 'Сафар нест карда шуд',
                    errorDelete: 'Хатогӣ ҳангоми нест кардан',
                    editTitle: 'Таҳрири сафар'
                }
            },
            publish: {
                title: 'Пешниҳоди сафар',
                subtitle: 'Тафсилотро пур кунед, то мусофиронро пайдо кунед',
                route: 'Масир',
                dateTime: 'Вақт ва Сана',
                details: 'Тафсилот',
                comment: 'Шарҳ',
                placeholderFrom: 'Аз куҷо (Шаҳр, кӯча)',
                placeholderTo: 'Ба куҷо (Шаҳр, кӯча)',
                labelFrom: 'Аз куҷо',
                labelTo: 'Ба куҷо',
                labelDate: 'Санаи сафар',
                labelTime: 'Вақт',
                labelPrice: 'Нарх (сом)',
                labelSeats: 'Миқдори ҷойҳо',
                pricePlaceholder: 'Нарх барои як ҷой',
                commentPlaceholder: 'Тафсилотро ворид кунед: ҷои вохӯрӣ, ҳаҷми бағоҷ...',
                success: 'Сафар бомуваффақият нашр шуд!',
                button: 'Нашри сафар',
                errorPast: 'Шумо наметавонед сафарро дар гузашта эҷод кунед',
                errorArrival: 'Вақти расидан наметавонад аз вақти рафтан пештар бошад',
                errorDuplicate: 'Шумо аллакай дар ин вақт сафар доред. Вақти дигарро интихоб кунед ё сафари кӯҳнаро нест кунед.',
                errorLimit: 'Ҳадди сафарҳои фаъол зиёд шудааст (ҳадди аксар 3) ё ҳисоби шумо маҳдуд аст.',
                errorGeneric: 'Хатогӣ ҳангоми нашр: ',
                errorTryLater: 'баъдтар дубора кӯшиш кунед'
            },
            editProfile: {
                errorName: 'Ном бояд на камтар аз 2 ҳарф дошта бошад',
                errorBio: 'Дар бораи ман: ҳадди аксар 500 ҳарф',
                errorWhatsapp: 'Рақами дурусти WhatsApp ворид кунед (на камтар аз 9 рақам)',
                errorUpdate: 'Хатогӣ ҳангоми навсозии профил: ',
                transport: 'Нақлиёт',
                contacts: 'Маълумот барои тамос',
                about: 'Дар бораи ман',
                cancel: 'Бекор кардан',
                save: 'Захира кардан',
                placeholderCar: 'Мисол: Toyota Camry, Сафед',
                placeholderBio: 'Дар бораи худ, таҷрибаи ронандагӣ ва ғайра нақл кунед'
            }
        }
    };

    const t = (path) => {
        const keys = path.split('.');
        let current = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
        return current;
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        language,
        setLanguage,
        theme,
        toggleTheme,
        t
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
