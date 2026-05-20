'use client';

import { validateTemplateConfig } from '@vibeinvite/config/validate-template-config';
import { getTemplate } from '@vibeinvite/templates';
import type { InvitationConfig } from '@vibeinvite/types';
import { useMemo, useState } from 'react';

export default function EditorPage({ params }: { params: { templateId: string } }) {
  // In the real flow, fetch the Firestore template record by params.templateId and use its componentKey.
  const templateRecord = useMemo(() => ({ id: params.templateId, componentKey: 'envelope' }), [params.templateId]);
  const template = getTemplate(templateRecord.componentKey);
  const [config, setConfig] = useState<InvitationConfig>(() => template?.defaultConfig ?? { rsvpEnabled: true });

  if (!template) {
    return <main>Template not found.</main>;
  }

  const TemplateComponent = template.component;
  const validation = validateTemplateConfig(template.configSchema, config);

  return (
    <main style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(18rem, 24rem) 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #ead8d0', padding: '1rem' }}>
        <h1>Editor</h1>
        <p>ConfigPanel will render controls from TemplateConfigSchema here.</p>
        <button
          type="button"
          onClick={() => setConfig((prev) => ({ ...prev, recipientName: 'Alex' }))}
        >
          Demo update
        </button>
        {!validation.valid && (
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(validation.issues, null, 2)}</pre>
        )}
      </aside>
      <section>
        {template.previewMode === 'iframe' ? (
          <iframe title="Invitation preview" src={`/i/preview/${templateRecord.id}`} style={{ height: '100%', width: '100%' }} />
        ) : (
          <TemplateComponent config={config} isPreview renderMode="editor" />
        )}
      </section>
    </main>
  );
}
