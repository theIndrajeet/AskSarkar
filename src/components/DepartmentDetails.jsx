import { useTranslation } from 'react-i18next';
import { Building2, MapPin } from 'lucide-react';
import pioDatabase from '../data/pioDatabase.json';

const DepartmentDetails = ({ formData, updateFormData, onNext, onBack }) => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.state && formData.departmentType) {
      onNext();
    }
  };

  // Get PIO details based on state and department
  const getPIODetails = () => {
    const stateData = pioDatabase[formData.state] || pioDatabase.default;
    const deptData = stateData.departments?.[formData.departmentType] || stateData.departments?.default;
    return deptData;
  };

  const pioDetails = formData.state && formData.departmentType ? getPIODetails() : null;

  // Get available states from translation keys
  const states = Object.keys(t('states', { returnObjects: true })).map(key => ({
    code: key,
    name: t(`states.${key}`)
  }));

  // Get available departments from translation keys
  const departments = Object.keys(t('departments', { returnObjects: true })).map(key => ({
    code: key,
    name: t(`departments.${key}`)
  }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-ink-dark mb-2">
          {t('form.departmentDetails')}
        </h2>
        <div className="w-16 h-1 bg-sepia rounded-full" />
      </div>

      <div className="space-y-4">
        {/* State Selection */}
        <div>
          <label className="vintage-label block mb-2">
            {t('form.state')} *
          </label>
          <select
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value, departmentType: '' })}
            className="vintage-input"
            required
          >
            <option value="">{t('form.selectState')}</option>
            {states.map(state => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department Type */}
        <div>
          <label className="vintage-label block mb-2">
            {t('form.departmentType')} *
          </label>
          <select
            value={formData.departmentType}
            onChange={(e) => updateFormData({ departmentType: e.target.value })}
            className="vintage-input"
            required
          >
            <option value="">{t('form.selectDepartment')}</option>
            {departments.map(dept => (
              <option key={dept.code} value={dept.code}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Department Name (Optional) */}
        <div>
          <label className="vintage-label block mb-2">
            {t('form.specificDepartment')}
            <span className="ml-2 text-xs text-ink/60 font-normal">({t('optional')})</span>
          </label>
          <input
            type="text"
            value={formData.specificDepartment}
            onChange={(e) => updateFormData({ specificDepartment: e.target.value })}
            className="vintage-input"
            placeholder="e.g., Delhi Police, Lajpat Nagar Thana"
          />
        </div>

        {/* Auto-filled PIO Details Preview */}
        {pioDetails && (
          <div className="mt-6 p-4 bg-accent-sage/10 border border-accent-sage/30 rounded-sm">
            <div className="flex items-center mb-3">
              <MapPin className="w-4 h-4 text-accent-sage mr-2" />
              <span className="text-sm font-medium text-ink-dark">
                Public Information Officer Details
              </span>
            </div>
            <div className="text-sm text-ink/80 space-y-1">
              <p><span className="font-medium">Name:</span> {pioDetails.pioName}</p>
              <p><span className="font-medium">Designation:</span> {pioDetails.designation}</p>
              <p><span className="font-medium">Address:</span> {pioDetails.address}</p>
              {pioDetails.note && (
                <p className="text-xs text-accent-rust mt-2 italic">{pioDetails.note}</p>
              )}
            </div>
          </div>
        )}
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

export default DepartmentDetails; 