import { useTranslation } from 'react-i18next';
import { FileQuestion, Calendar, FileText } from 'lucide-react';

const InformationSought = ({ formData, updateFormData, onNext, onBack }) => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.subjectMatter && formData.query) {
      onNext();
    }
  };

  const insertTemplate = (template) => {
    const currentQuery = formData.query || '';
    const newQuery = currentQuery ? `${currentQuery} ${template} ` : `${template} `;
    updateFormData({ query: newQuery });
  };

  const templates = [
    t('form.template1'),
    t('form.template2'),
    t('form.template3'),
    t('form.template4'),
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-ink-dark mb-2">
          {t('form.informationSought')}
        </h2>
        <div className="w-16 h-1 bg-sepia rounded-full" />
      </div>

      <div className="space-y-4">
        {/* Subject Matter */}
        <div>
          <label className="vintage-label block mb-2">
            {t('form.subjectMatter')} *
          </label>
          <input
            type="text"
            value={formData.subjectMatter}
            onChange={(e) => updateFormData({ subjectMatter: e.target.value })}
            className="vintage-input"
            placeholder={t('form.subjectPlaceholder')}
            required
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="vintage-label block mb-2">
              {t('form.fromDate')}
            </label>
            <input
              type="date"
              value={formData.fromDate}
              onChange={(e) => updateFormData({ fromDate: e.target.value })}
              max={formData.toDate || new Date().toISOString().split('T')[0]}
              className="vintage-input"
            />
          </div>
          <div>
            <label className="vintage-label block mb-2">
              {t('form.toDate')}
            </label>
            <input
              type="date"
              value={formData.toDate}
              onChange={(e) => updateFormData({ toDate: e.target.value })}
              min={formData.fromDate}
              max={new Date().toISOString().split('T')[0]}
              className="vintage-input"
            />
          </div>
        </div>

        {/* Query Templates */}
        <div>
          <label className="vintage-label block mb-2">
            {t('form.queryTemplates')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => insertTemplate(template)}
                className="p-2 text-xs text-left bg-parchment hover:bg-sepia/10 
                          border border-sepia/20 rounded-sm transition-colors"
              >
                <FileText className="w-3 h-3 inline mr-1 text-sepia" />
                {template}...
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Query */}
        <div>
          <label className="vintage-label block mb-2">
            {t('form.query')} *
          </label>
          <textarea
            value={formData.query}
            onChange={(e) => updateFormData({ query: e.target.value })}
            className="vintage-input min-h-[150px] resize-none"
            placeholder={t('form.queryPlaceholder')}
            rows="6"
            required
          />
          <p className="text-xs text-ink/60 mt-1">
            {formData.query.length} / 500 characters
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-sepia hover:text-sepia-dark transition-colors"
        >
          ← Previous
        </button>
        <button
          type="submit"
          className="vintage-button"
        >
          Next Step →
        </button>
      </div>
    </form>
  );
};

export default InformationSought; 