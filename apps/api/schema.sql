create table if not exists scans (
  id text primary key,
  mode text not null,
  status text not null,
  created_at text not null,
  updated_at text not null,
  upload_token_hash text not null,
  return_url text not null,
  payload_json text not null
);

create index if not exists scans_created_at_idx on scans (created_at desc);
create index if not exists scans_status_idx on scans (status);
