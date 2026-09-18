
-- Create a public storage bucket to host OAuth discovery metadata files
-- These files must be accessible without any authentication headers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'oauth-metadata',
  'oauth-metadata',
  true,
  65536,
  ARRAY['application/json', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 65536,
  allowed_mime_types = ARRAY['application/json', 'text/plain'];

-- RLS: allow public read (no auth required)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'oauth_metadata_public_read'
  ) THEN
    EXECUTE 'CREATE POLICY oauth_metadata_public_read ON storage.objects FOR SELECT USING (bucket_id = ''oauth-metadata'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'oauth_metadata_service_insert'
  ) THEN
    EXECUTE 'CREATE POLICY oauth_metadata_service_insert ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''oauth-metadata'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'oauth_metadata_service_update'
  ) THEN
    EXECUTE 'CREATE POLICY oauth_metadata_service_update ON storage.objects FOR UPDATE USING (bucket_id = ''oauth-metadata'')';
  END IF;
END$$;
