CREATE TABLE IF NOT EXISTS maps (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    blob_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    width INTEGER,
    height INTEGER
);

CREATE INDEX IF NOT EXISTS maps_created_at_idx ON maps (created_at DESC);
