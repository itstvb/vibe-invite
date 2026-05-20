import { listTemplates } from '@vibeinvite/templates';

export default function TemplatesPage() {
  const templates = listTemplates();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Template Marketplace</h1>
      <ul>
        {templates.map((template) => (
          <li key={template.componentKey}>
            {template.componentKey} — {template.templateType} — preview: {template.previewMode}
          </li>
        ))}
      </ul>
    </main>
  );
}
