'use client';
import type { CredentialTemplate } from '@/@types/templates';
import { useCustomTemplates } from './useCustomTemplates';

export function useCredentialTemplates() {
  const { customTemplates, saveTemplate, deleteTemplate } = useCustomTemplates();

  const builtIn: CredentialTemplate[] = [
    {
      id: 'impacta-certificate',
      title: 'Impacta Certificate',
      description: 'Certificate template for BAF Impacta Bootcamp.',
      vcType: 'ImpactaCertificateCredential',
      fields: [
        {
          key: 'holderName',
          label: 'Holder Name',
          type: 'text',
          required: true,
          placeholder: 'Full name',
        },
      ],
    },
    {
      id: 'escrow',
      title: 'Escrow',
      description: 'Programmable escrow credential linked to Trustless Work.',
      vcType: 'EscrowCredential',
      fields: [
        {
          key: 'subject',
          label: 'Subject DID',
          type: 'did',
          required: true,
          placeholder: 'Wallet (G...) – we derive DID',
        },
        { key: 'escrowId', label: 'Escrow ID', type: 'text', required: true },
        { key: 'role', label: 'Role', type: 'text', required: true, placeholder: 'payer | payee' },
        { key: 'asset', label: 'Asset', type: 'text', required: true, placeholder: 'USDC' },
        { key: 'amount', label: 'Amount', type: 'number', required: true },
        { key: 'project', label: 'Project', type: 'text', required: false },
        { key: 'issueDate', label: 'Issue Date', type: 'date', required: true },
        { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
      ],
    },
    {
      id: 'contributions',
      title: 'Contributions',
      description: 'Contributions count to a specific project.',
      vcType: 'ContributionsCredential',
      fields: [
        {
          key: 'subject',
          label: 'Subject DID',
          type: 'did',
          required: true,
          placeholder: 'Wallet (G...) – we derive DID',
        },
        { key: 'projectName', label: 'Project Name', type: 'text', required: true },
        { key: 'contributionsCount', label: 'Contributions Count', type: 'number', required: true },
        { key: 'lastContributionDate', label: 'Last Contribution', type: 'date' },
        { key: 'issueDate', label: 'Issue Date', type: 'date', required: true },
        { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
      ],
    },
    {
      id: 'membership',
      title: 'Membership',
      description: 'Membership or subscription credential.',
      vcType: 'MembershipCredential',
      fields: [
        {
          key: 'subject',
          label: 'Subject DID',
          type: 'did',
          required: true,
          placeholder: 'Wallet (G...) – we derive DID',
        },
        { key: 'organization', label: 'Organization', type: 'text', required: true },
        { key: 'level', label: 'Level', type: 'text', required: true, placeholder: 'Gold' },
        { key: 'issueDate', label: 'Start Date', type: 'date', required: true },
        { key: 'expirationDate', label: 'End Date', type: 'date' },
      ],
    },
    {
      id: 'employee_badge',
      title: 'Employee Badge',
      description: 'Employment credential for internal use.',
      vcType: 'EmployeeCredential',
      fields: [
        {
          key: 'subject',
          label: 'Subject DID',
          type: 'did',
          required: true,
          placeholder: 'Wallet (G...) – we derive DID',
        },
        { key: 'company', label: 'Company', type: 'text', required: true },
        { key: 'role', label: 'Role', type: 'text', required: true },
        { key: 'issueDate', label: 'Issue Date', type: 'date', required: true },
        { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
      ],
    },
    {
      id: 'course_certificate',
      title: 'Course Certificate',
      description: 'Credential for course completion.',
      vcType: 'CourseCertificateCredential',
      fields: [
        {
          key: 'subject',
          label: 'Subject DID',
          type: 'did',
          required: true,
          placeholder: 'Wallet (G...) – we derive DID',
        },
        { key: 'courseName', label: 'Course Name', type: 'text', required: true },
        { key: 'provider', label: 'Provider', type: 'text', required: true },
        { key: 'issueDate', label: 'Completion Date', type: 'date', required: true },
        { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
      ],
    },
  ];

  const templates: CredentialTemplate[] = [...builtIn, ...customTemplates];

  return { templates, saveTemplate, deleteTemplate };
}
