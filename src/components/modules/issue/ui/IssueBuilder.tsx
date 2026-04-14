'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCredentialTemplates } from '../hooks/useCredentialTemplates';
import { useIssueCredential } from '../hooks/useIssueCredential';
import DynamicIssueForm from './DynamicIssueForm';
import TemplateSelector from './TemplateSelector';
import CustomTemplateBuilder from './CustomTemplateBuilder';

export default function IssueBuilder() {
  const { templates, saveTemplate, deleteTemplate } = useCredentialTemplates();
  const {
    state,
    apiKey,
    setApiKey,
    selectTemplate,
    setFieldValue,
    setOwner,
    buildPreview,
    issue,
    issuanceCode,
    setIssuanceCode,
    issuanceCodeValid,
  } = useIssueCredential();

  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="space-y-6">
      {showBuilder ? (
        <CustomTemplateBuilder
          onSave={(draft) => {
            const tpl = saveTemplate(draft);
            toast.success(`Template "${tpl.title}" saved`);
            setShowBuilder(false);
            selectTemplate(tpl);
            return tpl;
          }}
          onCancel={() => setShowBuilder(false)}
        />
      ) : (
        <>
          <TemplateSelector
            templates={templates.filter((t) => t.id !== 'impacta-certificate')}
            selectedId={state.template?.id || null}
            onSelect={selectTemplate}
            onCreateCustom={() => setShowBuilder(true)}
            onDeleteCustom={(id) => {
              deleteTemplate(id);
              if (state.template?.id === id) {
                selectTemplate(templates.find((t) => !t.id.startsWith('custom-'))!);
              }
              toast.success('Custom template deleted');
            }}
          />

          <DynamicIssueForm
            template={state.template}
            values={state.values}
            vcId={state.vcId}
            owner={state.owner}
            onSetOwner={setOwner}
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
            issuanceCode={issuanceCode}
            onSetIssuanceCode={setIssuanceCode}
            issuanceCodeValid={issuanceCodeValid}
          />
        </>
      )}
    </div>
  );
}
