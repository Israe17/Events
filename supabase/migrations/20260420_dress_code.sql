-- Dress code: host writes a textual brief and adds Pinterest pins / boards;
-- any event member can like (vote) a pin.

-- 1. Optional dress-code description on events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS dress_code_description text;

-- 2. Pinterest pins added by the host (pin | board | profile URL)
CREATE TABLE IF NOT EXISTS event_dress_code_pins (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  pinterest_url      text NOT NULL,
  pin_type           text NOT NULL CHECK (pin_type IN ('pin','board','profile')),
  note               text,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS event_dress_code_pins_event_url_idx
  ON event_dress_code_pins (event_id, pinterest_url);

CREATE INDEX IF NOT EXISTS event_dress_code_pins_event_idx
  ON event_dress_code_pins (event_id);

-- 3. Votes (one per pin per user)
CREATE TABLE IF NOT EXISTS event_dress_code_votes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  pin_id     uuid NOT NULL REFERENCES event_dress_code_pins(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pin_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_dress_code_votes_pin_idx
  ON event_dress_code_votes (pin_id);

-- 4. Ranking view
CREATE OR REPLACE VIEW v_event_dress_code_ranking AS
SELECT
  p.id,
  p.event_id,
  p.pinterest_url,
  p.pin_type,
  p.note,
  p.created_by_user_id,
  p.created_at,
  p.updated_at,
  COALESCE(v.vote_count, 0)::int AS vote_count
FROM event_dress_code_pins p
LEFT JOIN (
  SELECT pin_id, COUNT(*) AS vote_count
  FROM event_dress_code_votes
  GROUP BY pin_id
) v ON v.pin_id = p.id;

-- 5. Row level security
ALTER TABLE event_dress_code_pins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_dress_code_votes ENABLE ROW LEVEL SECURITY;

-- Pins: any member of the event can SELECT.
CREATE POLICY "dress_pins_select_members"
  ON event_dress_code_pins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_users eu
      WHERE eu.event_id = event_dress_code_pins.event_id
        AND eu.user_id = auth.uid()
    )
  );

-- Pins: only host or admin can INSERT/UPDATE/DELETE.
CREATE POLICY "dress_pins_write_host"
  ON event_dress_code_pins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM event_users eu
      WHERE eu.event_id = event_dress_code_pins.event_id
        AND eu.user_id = auth.uid()
        AND eu.role IN ('host','admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_users eu
      WHERE eu.event_id = event_dress_code_pins.event_id
        AND eu.user_id = auth.uid()
        AND eu.role IN ('host','admin')
    )
  );

-- Votes: any member sees votes in their events.
CREATE POLICY "dress_votes_select_members"
  ON event_dress_code_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_users eu
      WHERE eu.event_id = event_dress_code_votes.event_id
        AND eu.user_id = auth.uid()
    )
  );

-- Votes: user can only insert/delete their own vote, and must be event member.
CREATE POLICY "dress_votes_write_self"
  ON event_dress_code_votes FOR ALL
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM event_users eu
      WHERE eu.event_id = event_dress_code_votes.event_id
        AND eu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM event_users eu
      WHERE eu.event_id = event_dress_code_votes.event_id
        AND eu.user_id = auth.uid()
    )
  );
