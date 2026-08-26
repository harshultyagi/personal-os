ALTER TABLE daily_briefings DROP CONSTRAINT daily_briefings_user_id_briefing_date_key;
ALTER TABLE daily_briefings ADD COLUMN slot text NOT NULL DEFAULT 'morning';
ALTER TABLE daily_briefings ADD CONSTRAINT daily_briefings_user_date_slot_key UNIQUE (user_id, briefing_date, slot);