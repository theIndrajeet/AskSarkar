import { useTranslation } from 'react-i18next';
import { IndianRupee, AlertCircle, CheckCircle } from 'lucide-react';

const FeeDetails = ({ formData, updateFormData, onBack, onGenerate, isFormValid }) => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onGenerate();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-ink-dark mb-2">
          {t('form.feeDetails')}
        </h2>
        <div className="w-16 h-1 bg-sepia rounded-full" />
      </div>

      <div className="space-y-4">
        {/* BPL Category */}
        <div className="p-4 bg-accent-sage/10 border border-accent-sage/30 rounded-sm">
          <label className="vintage-label block mb-3">
            {t('form.bplCategory')}
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.belongToBPL}
              onChange={(e) => updateFormData({ 
                belongToBPL: e.target.checked,
                agreeToPayFee: e.target.checked ? false : formData.agreeToPayFee,
                depositedFee: false,
                paymentDetails: ''
              })}
              className="mr-3 text-sepia focus:ring-sepia"
            />
            <span className="text-ink">{t('form.belongToBPL')}</span>
          </label>

          {formData.belongToBPL && (
            <div className="mt-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bplProofProvided}
                  onChange={(e) => updateFormData({ bplProofProvided: e.target.checked })}
                  className="mr-3 text-sepia focus:ring-sepia"
                />
                <span className="text-ink">{t('form.bplProofProvided')}</span>
              </label>
              <p className="text-xs text-accent-sage mt-2 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t('form.bplNote')}
              </p>
            </div>
          )}
        </div>

        {/* Fee Payment - Only show if not BPL */}
        {!formData.belongToBPL && (
          <div className="space-y-4">
            {/* Fee Agreement */}
            <div>
              <label className="vintage-label block mb-3">
                {t('form.agreeToPayFee')} *
              </label>
              
              <div className="p-3 bg-parchment rounded-sm mb-3">
                <p className="text-sm text-ink/80 flex items-start">
                  <IndianRupee className="w-4 h-4 mr-1 mt-0.5 text-sepia" />
                  {t('form.feeNote')}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="agreeToPayFee"
                    value="yes"
                    checked={formData.agreeToPayFee === true}
                    onChange={() => updateFormData({ agreeToPayFee: true })}
                    className="mr-2 text-sepia focus:ring-sepia"
                  />
                  <span className="text-ink">{t('yes')}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="agreeToPayFee"
                    value="no"
                    checked={formData.agreeToPayFee === false}
                    onChange={() => updateFormData({ 
                      agreeToPayFee: false,
                      depositedFee: false,
                      paymentDetails: ''
                    })}
                    className="mr-2 text-sepia focus:ring-sepia"
                  />
                  <span className="text-ink">{t('no')}</span>
                </label>
              </div>
            </div>

            {/* Fee Deposit - Only show if agreed to pay */}
            {formData.agreeToPayFee && (
              <div>
                <label className="vintage-label block mb-3">
                  {t('form.depositedFee')}
                </label>
                
                <div className="flex items-center space-x-4 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="depositedFee"
                      value="yes"
                      checked={formData.depositedFee === true}
                      onChange={() => updateFormData({ depositedFee: true })}
                      className="mr-2 text-sepia focus:ring-sepia"
                    />
                    <span className="text-ink">{t('yes')}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="depositedFee"
                      value="no"
                      checked={formData.depositedFee === false}
                      onChange={() => updateFormData({ 
                        depositedFee: false,
                        paymentDetails: ''
                      })}
                      className="mr-2 text-sepia focus:ring-sepia"
                    />
                    <span className="text-ink">{t('no')}</span>
                  </label>
                </div>

                {/* Payment Details - Only show if deposited */}
                {formData.depositedFee && (
                  <div>
                    <label className="vintage-label block mb-2">
                      {t('form.paymentDetails')}
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDetails}
                      onChange={(e) => updateFormData({ paymentDetails: e.target.value })}
                      className="vintage-input"
                      placeholder={t('form.paymentPlaceholder')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form Validation Message */}
        {!isFormValid && (
          <div className="p-3 bg-accent-rust/10 border border-accent-rust/30 rounded-sm">
            <p className="text-sm text-accent-rust flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
              Please fill all required fields and either belong to BPL category or agree to pay the fee.
            </p>
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
          disabled={!isFormValid}
          className={`vintage-button ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('form.generatePDF')} →
        </button>
      </div>
    </form>
  );
};

export default FeeDetails; 