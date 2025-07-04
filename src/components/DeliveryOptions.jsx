import { useTranslation } from 'react-i18next';
import { Mail, User, MapPin } from 'lucide-react';

const DeliveryOptions = ({ formData, updateFormData, onNext, onBack }) => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const handleSameAddressChange = (checked) => {
    updateFormData({ 
      sameAsPermAddress: checked,
      deliveryAddress: checked ? formData.address : formData.deliveryAddress
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-ink-dark mb-2">
          {t('form.deliveryOptions')}
        </h2>
        <div className="w-16 h-1 bg-sepia rounded-full" />
      </div>

      <div className="space-y-4">
        {/* Delivery Method */}
        <div>
          <label className="vintage-label block mb-3">
            {t('form.deliveryMethod')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 bg-parchment rounded-sm cursor-pointer hover:bg-sepia/10 transition-colors">
              <input
                type="radio"
                name="deliveryMethod"
                value="byPost"
                checked={formData.deliveryMethod === 'byPost'}
                onChange={(e) => updateFormData({ deliveryMethod: e.target.value })}
                className="mr-3 text-sepia focus:ring-sepia"
              />
              <Mail className="w-4 h-4 mr-2 text-sepia" />
              <span className="text-ink">{t('form.byPost')}</span>
            </label>
            <label className="flex items-center p-3 bg-parchment rounded-sm cursor-pointer hover:bg-sepia/10 transition-colors">
              <input
                type="radio"
                name="deliveryMethod"
                value="inPerson"
                checked={formData.deliveryMethod === 'inPerson'}
                onChange={(e) => updateFormData({ deliveryMethod: e.target.value })}
                className="mr-3 text-sepia focus:ring-sepia"
              />
              <User className="w-4 h-4 mr-2 text-sepia" />
              <span className="text-ink">{t('form.inPerson')}</span>
            </label>
          </div>
        </div>

        {/* Post Type - Only show if delivery method is by post */}
        {formData.deliveryMethod === 'byPost' && (
          <div>
            <label className="vintage-label block mb-2">
              {t('form.postType')}
            </label>
            <select
              value={formData.postType}
              onChange={(e) => updateFormData({ postType: e.target.value })}
              className="vintage-input"
            >
              <option value="ordinary">{t('form.ordinary')}</option>
              <option value="registered">{t('form.registered')}</option>
              <option value="speed">{t('form.speed')}</option>
            </select>
          </div>
        )}

        {/* Delivery Address */}
        <div>
          <label className="vintage-label block mb-2">
            {t('form.deliveryAddress')}
          </label>
          
          {/* Same as permanent address checkbox */}
          <label className="flex items-center mb-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sameAsPermAddress}
              onChange={(e) => handleSameAddressChange(e.target.checked)}
              className="mr-2 text-sepia focus:ring-sepia"
            />
            <span className="text-ink">{t('form.sameAsPermanent')}</span>
          </label>

          <textarea
            value={formData.sameAsPermAddress ? formData.address : formData.deliveryAddress}
            onChange={(e) => updateFormData({ deliveryAddress: e.target.value })}
            disabled={formData.sameAsPermAddress}
            className={`vintage-input min-h-[100px] resize-none ${
              formData.sameAsPermAddress ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            rows="4"
          />
        </div>

        {/* Additional Information */}
        <div className="mt-6 space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.previouslyProvided}
              onChange={(e) => updateFormData({ previouslyProvided: e.target.checked })}
              className="mr-3 text-sepia focus:ring-sepia"
            />
            <span className="text-sm text-ink">{t('form.previouslyProvided')}</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notMadeAvailable}
              onChange={(e) => updateFormData({ notMadeAvailable: e.target.checked })}
              className="mr-3 text-sepia focus:ring-sepia"
            />
            <span className="text-sm text-ink">{t('form.notMadeAvailable')}</span>
          </label>
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

export default DeliveryOptions; 