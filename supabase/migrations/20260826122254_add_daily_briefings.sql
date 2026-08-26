CREATE TABLE daily_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  briefing_date date NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, briefing_date)
);

ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefings"
  ON daily_briefings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own briefings"
  ON daily_briefings FOR INSERT
  WITH CHECK (auth.uid() = user_id);