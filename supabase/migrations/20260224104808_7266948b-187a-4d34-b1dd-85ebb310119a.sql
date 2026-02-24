
-- Add new values to course_domain enum
ALTER TYPE course_domain ADD VALUE IF NOT EXISTS 'public_policy';
ALTER TYPE course_domain ADD VALUE IF NOT EXISTS 'interdisciplinary';
ALTER TYPE course_domain ADD VALUE IF NOT EXISTS 'information_systems';
ALTER TYPE course_domain ADD VALUE IF NOT EXISTS 'language';
ALTER TYPE course_domain ADD VALUE IF NOT EXISTS 'communication';
ALTER TYPE course_domain ADD VALUE IF NOT EXISTS 'entrepreneurship';
