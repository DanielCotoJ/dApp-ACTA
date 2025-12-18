'use client';

import { useCredentialTemplates } from '../hooks/useCredentialTemplates';
import { useIssueCredential } from '../hooks/useIssueCredential';
import DynamicIssueForm from './DynamicIssueForm';
import TemplateSelector from './TemplateSelector';

export default function IssueBuilder() {
  const { templates } = useCredentialTemplates();
  const { state, apiKey, setApiKey, selectTemplate, setFieldValue, buildPreview, issue } =
    useIssueCredential();

  return (
    <div className="space-y-6">
      <TemplateSelector
        templates={templates}
        selectedId={state.template?.id || null}
        onSelect={selectTemplate}
      />

      <DynamicIssueForm
        template={state.template}
        values={state.values}
        vcId={state.vcId}
        issuing={state.issuing}
        preview={state.preview}
        error={state.error}
        apiKey={apiKey}
        onSetApiKey={setApiKey}
        onSetField={setFieldValue}
        onBuildPreview={buildPreview}
        onSubmit={async () => {
          await issue();
        }}
      />
    </div>
  );
}
