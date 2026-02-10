-- создаём таблицу для OTP по телефону
CREATE TABLE IF NOT EXISTS phone_otps
(
    phone      TEXT NOT NULL
        CONSTRAINT phone_otps_pk
            PRIMARY KEY,
    code_hash  TEXT,
    expires_at TIMESTAMP,
    attempts   INTEGER DEFAULT 0
);

-- назначаем владельца таблицы
ALTER TABLE phone_otps
    OWNER TO postgres;
