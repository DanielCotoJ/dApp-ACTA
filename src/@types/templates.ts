export type TemplateField = {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'email' | 'did';
  required?: boolean;
  placeholder?: string;
};

export type CredentialTemplate = {
  id: string;
  title: string;
  description: string;
  vcType: string;
  fields: TemplateField[];
  iconSrc?: string;
};
