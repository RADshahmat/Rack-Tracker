-- Passwords are all: "password123"
-- Hash generated with bcrypt rounds=10

INSERT INTO users (username, email, password, role) VALUES
    (
        'admin',
        'admin@rack.local',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'admin'
    ),
    (
        'operator',
        'operator@rack.local',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'operator'
    ),
    (
        'viewer',
        'viewer@rack.local',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'viewer'
    );