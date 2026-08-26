CREATE TABLE google_tokens (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expiry_date bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own google_tokens"
  ON google_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own google_tokens"
  ON google_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own google_tokens"
  ON google_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own google_tokens"
  ON google_tokens FOR DELETE
  USING (auth.uid() = user_id);