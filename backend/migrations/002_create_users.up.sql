-- создаём таблицу пользователей
CREATE TABLE IF NOT EXISTS users
(
    id         INTEGER DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
    first_name TEXT,
    last_name  TEXT,
    birth_date TIMESTAMP,
    car_brand  TEXT,
    email      TEXT,
    phone      TEXT NOT NULL
        CONSTRAINT users_pk
            PRIMARY KEY,
    bio        TEXT,
    avatar_url TEXT DEFAULT 'null'::TEXT
);

-- назначаем владельца таблицы
ALTER TABLE users
    OWNER TO postgres;
