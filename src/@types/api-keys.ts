export type PublicApiKeyRecord = {
  id: string;
  name: string;
  role: 'standard';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type PublicApiKeyResponse = {
  message: string;
  api_key: string;
  api_key_record: PublicApiKeyRecord;
};



