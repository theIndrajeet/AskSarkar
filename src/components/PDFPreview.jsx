import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Printer, FileText, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import pioDatabase from '../data/pioDatabase.json';

const PDFPreview = ({ formData, onBack, onNewApplication }) => {
  const { t, i18n } = useTranslation();
  const [pdfUrl, setPdfUrl] = useState('');

  // Get PIO details
  const getPIODetails = () => {
    const stateData = pioDatabase[formData.state] || pioDatabase.default;
    const deptData = stateData.departments?.[formData.departmentType] || 
                     stateData.departments?.default || 
                     pioDatabase.default.departments.default;
    
    // Ensure we always have valid PIO details
    return {
      pioName: deptData?.pioName || 'Public Information Officer',
      designation: deptData?.designation || `${formData.departmentType} Department`,
      address: deptData?.address || 'Department Address'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pioDetails = getPIODetails();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = 20;

    // Helper function to add text with word wrap
    const addText = (text, x, y, maxWidth, fontSize = 12, fontStyle = 'normal') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('APPLICATION UNDER RIGHT TO INFORMATION ACT, 2005', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Form Number
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('(FORM-A)', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // To Section
    doc.setFont('helvetica', 'bold');
    doc.text('To,', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    yPos = addText(pioDetails.pioName, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos = addText(pioDetails.designation, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos = addText(pioDetails.address, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 10;

    // Subject
    doc.setFont('helvetica', 'bold');
    doc.text('Subject: ', margin, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addText(`Request for information under RTI Act, 2005 - Reg.`, margin + 20, yPos, pageWidth - margin - 20);
    yPos += 10;

    // Salutation
    doc.text('Respected Sir/Madam,', margin, yPos);
    yPos += 10;

    // Personal Details Section
    doc.setFont('helvetica', 'bold');
    doc.text('1. Applicant Details:', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    yPos = addText(`Name: ${formData.applicantName || 'To be filled'}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos = addText(`Father's/Husband's Name: ${formData.fatherHusbandName || 'To be filled'}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos = addText(`Address: ${formData.address || 'To be filled'}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    if (formData.identityParticulars) {
      yPos = addText(`Identity Particulars: ${formData.identityParticulars}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    }
    yPos += 10;

    // Information Sought Section
    doc.setFont('helvetica', 'bold');
    doc.text('2. Information Sought:', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    yPos = addText(`Subject Matter: ${formData.subjectMatter || 'Information request as per RTI Act 2005'}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    
    if (formData.fromDate && formData.toDate) {
      yPos = addText(`Period: From ${formatDate(formData.fromDate)} to ${formatDate(formData.toDate)}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    }
    
    yPos += 5;
    doc.text('Specific details of information required:', margin + 5, yPos);
    yPos += 7;
    yPos = addText(formData.query || 'Information details to be filled', margin + 5, yPos, pageWidth - 2 * margin - 10);
    yPos += 10;

    // Delivery Method
    doc.setFont('helvetica', 'bold');
    doc.text('3. Mode of Delivery:', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    const deliveryMethod = formData.deliveryMethod === 'byPost' 
      ? `By Post (${t(`form.${formData.postType}`)})`
      : 'In Person';
    yPos = addText(`Information to be ${deliveryMethod}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    
    const deliveryAddress = formData.sameAsPermAddress ? formData.address : formData.deliveryAddress;
    yPos = addText(`Delivery Address: ${deliveryAddress}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
    yPos += 10;

    // Fee Details
    doc.setFont('helvetica', 'bold');
    doc.text('4. Fee Details:', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    if (formData.belongToBPL) {
      yPos = addText('Applicant belongs to Below Poverty Line (BPL) category.', margin + 5, yPos, pageWidth - 2 * margin - 5);
      if (formData.bplProofProvided) {
        yPos = addText('BPL proof has been furnished.', margin + 5, yPos, pageWidth - 2 * margin - 5);
      }
      yPos = addText('No fee is payable as per Section 7(5) of RTI Act, 2005.', margin + 5, yPos, pageWidth - 2 * margin - 5);
    } else {
      yPos = addText('Application fee of Rs. 10/- ', margin + 5, yPos, pageWidth - 2 * margin - 5);
      if (formData.depositedFee && formData.paymentDetails) {
        yPos = addText(`Payment Details: ${formData.paymentDetails}`, margin + 5, yPos, pageWidth - 2 * margin - 5);
      }
    }
    yPos += 10;

    // Declaration
    yPos = addText('I am a citizen of India and filing this request under the Right to Information Act, 2005.', margin, yPos, pageWidth - 2 * margin);
    yPos += 15;

    // Signature Section
    doc.text(`Place: _________________`, margin, yPos);
    doc.text(`Date: ${formatDate(new Date().toISOString())}`, pageWidth - margin - 50, yPos);
    yPos += 20;

    doc.text('Yours sincerely,', pageWidth - margin - 50, yPos);
    yPos += 20;

    doc.text(`(${formData.applicantName || 'Applicant Name'})`, pageWidth - margin - 50, yPos);
    yPos += 7;
    doc.setFontSize(10);
    yPos = addText(formData.address || 'Address', pageWidth - margin - 80, yPos, 80, 10);

    // Convert to blob and create URL
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);

    return doc;
  };

  useEffect(() => {
    generatePDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [formData]);

  const handleDownload = () => {
    const doc = generatePDF();
    const applicantName = formData.applicantName || 'Applicant';
    doc.save(`RTI_Application_${applicantName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => {
    const doc = generatePDF();
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-parchment/50 to-cream">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sepia hover:text-sepia-dark transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Form</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-sepia text-cream rounded-sm hover:bg-sepia-dark transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('form.download')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-parchment text-sepia border border-sepia/30 rounded-sm hover:bg-sepia/10 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t('form.print')}</span>
            </button>
            <button
              onClick={onNewApplication}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-sage text-cream rounded-sm hover:bg-accent-sage/80 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{t('form.newApplication')}</span>
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="vintage-card p-0 overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[800px]"
              title="RTI Application Preview"
            />
          ) : (
            <div className="w-full h-[800px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Generating PDF preview...</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 vintage-card bg-accent-sage/10 border-accent-sage/30">
          <h3 className="text-lg font-serif font-bold text-ink-dark mb-3">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-ink/80">
            <li>Download or print your RTI application</li>
            <li>Attach the application fee (₹10) as Indian Postal Order or Demand Draft (if not BPL)</li>
            <li>Send the application by post or submit in person to the PIO address mentioned</li>
            <li>Keep a copy of the application and postal receipt for your records</li>
            <li>You should receive a response within 30 days</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview; 