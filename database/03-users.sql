-- Passwords are all: "password123"
-- Hash generated with bcrypt rounds=10

INSERT INTO users (username, email, password, role) VALUES
    (
        'admin',
        'admin@rack.local',
        '$2a$12$iK6i6o3PxwMSXMhXKmwBqu7IKPCkW6cEFN.tZDyqoh7dkwj5Bhd3u',
        'admin'
    ),
    (
        'operator',
        'operator@rack.local',
        '$2a$12$iK6i6o3PxwMSXMhXKmwBqu7IKPCkW6cEFN.tZDyqoh7dkwj5Bhd3u',
        'operator'
    ),
    (
        'viewer',
        'viewer@rack.local',
        '$2a$12$iK6i6o3PxwMSXMhXKmwBqu7IKPCkW6cEFN.tZDyqoh7dkwj5Bhd3u',
        'viewer'
    );