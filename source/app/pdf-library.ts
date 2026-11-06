import rawDocuments from './pdf-library.generated.json';

export type PdfBlock = { type: 'heading' | 'paragraph' | 'list'; text: string };
export type PdfDocument = {
  slug: string;
  title: string;
  category: string;
  sourceFile: string;
  summary: string;
  blocks: PdfBlock[];
};

export const pdfDocuments = rawDocuments as PdfDocument[];
export const pdfDocumentBySlug = new Map(pdfDocuments.map((document) => [document.slug, document]));

const document = (slug: string) => {
  const item = pdfDocumentBySlug.get(slug);
  if (!item) throw new Error(`Missing PDF content: ${slug}`);
  return item;
};

export const menuGroups = [
  {
    label: 'Healthcare',
    documents: [
      document('affordia-health'), document('our-services'), document('how-it-works'), document('why-china'),
      document('pricing'), document('payment-coverage-options'), document('aftercare-recovery'),
      document('frequently-asked-questions'), document('book-a-free-consultation'),
    ],
  },
  {
    label: 'Affordia Health',
    documents: [document('about-us'), document('affordia-care'), document('contact'), document('slogan')],
  },
  {
    label: 'Partner Network',
    documents: [
      document('partner-network'), document('become-a-partner'), document('referral-program'),
      document('healthcare-partners'), document('insurance-coverage-partners'),
    ],
  },
  {
    label: 'Information',
    documents: [
      document('terms-and-conditions'), document('data-protection-medical-privacy'),
      document('medical-responsibility-liability'), document('limitation-responsibility-medical-journey-outcomes'),
      document('cancellation-refund-policy'), document('client-feedback-complaints'),
    ],
  },
];
