export type Card = { title: string; body?: string };
export type Section = { eyebrow?: string; title: string; body?: string[]; cards?: Card[]; quote?: string };
export type SitePage = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  image?: string;
  sections: Section[];
};

export const navigation = [
  ['Our Services', '/services'],
  ['How It Works', '/how-it-works'],
  ['Why China?', '/why-china'],
  ['Affordia Care', '/affordia-care'],
  ['Partner Network', '/partner-network'],
  ['About Us', '/about-us'],
  ['Contact', '/contact'],
] as const;

export const serviceCards: Card[] = [
  { title: 'Medical Case Review', body: 'Tell us what you need and let us understand your situation.' },
  { title: 'Hospital & Clinic Selection', body: 'We help identify suitable healthcare providers and relevant specialist departments.' },
  { title: 'Medical Coordination', body: 'We help coordinate communication, documentation, appointments and practical arrangements with healthcare providers.' },
  { title: 'Travel & Visa Assistance', body: 'We help you prepare for your journey while you remain in control of your own travel and visa applications.' },
  { title: 'Airport Pickup', body: 'Arrive knowing that your transportation has already been arranged.' },
  { title: 'Accommodation Assistance', body: 'We help identify suitable accommodation according to your hospital location, length of stay and budget.' },
  { title: 'Interpreter Service', body: 'Professional communication assistance can be arranged when language support is required.' },
  { title: 'Local Support', body: 'Have a local point of contact for practical assistance during your stay.' },
];

export const pages: Record<string, SitePage> = {
  services: {
    slug: 'services',
    eyebrow: 'Our Services',
    title: 'Your Journey. Your Choice.',
    intro: 'Every medical journey is different. Affordia Health gives you the flexibility to choose only the services you need.',
    image: '/images/tablet-consultation.webp',
    sections: [
      {
        title: 'Choose Only What You Need',
        body: [
          'Some clients only need help finding the right hospital. Others need assistance with appointments, travel, accommodation, interpretation and local support. Some prefer us to coordinate the entire journey.',
          'Start with one service or choose a complete medical journey. Add additional services whenever you need them.',
        ],
        cards: serviceCards,
      },
      {
        eyebrow: 'Complete Medical Journey',
        title: 'One journey. One point of coordination.',
        body: ['Support from preparation to return. The exact journey is built around your needs.'],
        quote: 'Start with one service. Add what you need. Build your medical journey around you.',
      },
      {
        title: 'Additional Services',
        cards: [
          { title: 'Second Medical Opinion' },
          { title: 'Online Consultation with Chinese Specialists' },
          { title: 'Traditional Chinese Medicine Consultation' },
          { title: 'Follow-Up Coordination' },
          { title: 'Medical Document Assistance' },
          { title: 'Rehabilitation Coordination' },
          { title: 'Family & Companion Assistance' },
          { title: 'Veterinary Medical Services' },
        ],
      },
    ],
  },
  'how-it-works': {
    slug: 'how-it-works',
    eyebrow: 'How It Works',
    title: 'Your Medical Journey, Step by Step',
    intro: 'Affordia Health makes the process easier by helping you research, organise and coordinate your medical journey in China while keeping you in control of your decisions and expenses.',
    image: '/images/hospital-welcome.webp',
    sections: [
      {
        title: 'Start With a Free Consultation',
        body: ['Your journey begins with a free initial consultation. There is no obligation to continue after the initial consultation.'],
        cards: [
          { title: '1. Start With a Free Consultation', body: 'Tell us what you are looking for, your preferred timeframe, your approximate budget, and any other requirements that may be important to you.' },
          { title: '2. Tell Us What You Need', body: 'If you would like to explore your options further, we collect the information necessary to understand your request.' },
          { title: '3. We Search for Suitable Options', body: 'We research suitable healthcare options in China based on your individual requirements.' },
          { title: '4. You Review Your Options', body: 'Where multiple suitable possibilities are available, we aim to help you understand the available options before you decide how to proceed.' },
          { title: '5. Choose Only the Services You Need', body: 'You do not have to purchase a complete medical travel package.' },
          { title: '6. Clear Service Agreement and Fees', body: 'You know what you are purchasing before we proceed.' },
          { title: '7. Hospital and Treatment Coordination', body: 'If you decide to proceed with a healthcare provider, we can help establish communication and coordinate the next steps.' },
          { title: '8. You Pay for Your Healthcare Directly', body: 'Wherever practicable, hospital and treatment costs are paid directly by the client to the healthcare provider.' },
          { title: '9. Visa and Travel Preparation', body: 'You remain the visa applicant and submit your own application.' },
          { title: '10. Preparing for Your Arrival in China', body: 'You should know what happens when you arrive before you board your flight.' },
          { title: '11. Arrival and Airport Pickup', body: 'Having local support from the beginning can make that transition significantly easier.' },
          { title: '12. Your Healthcare in China', body: 'Doctors provide healthcare. We help make the journey around it work.' },
          { title: '13. Local Support During Your Stay', body: 'You are travelling independently - but you do not have to navigate China alone.' },
          { title: '14. Return Home and Follow-Up', body: 'Your journey does not necessarily end when you leave China.' },
        ],
      },
    ],
  },
  'why-china': {
    slug: 'why-china',
    eyebrow: 'Why China?',
    title: 'A Different Perspective on Global Healthcare',
    intro: 'China combines one of the world’s largest healthcare systems with major tertiary hospitals, highly specialised medical departments, extensive clinical experience and rapidly developing medical technology.',
    image: '/images/hospital-welcome.webp',
    sections: [
      {
        title: 'For international patients looking for another healthcare option, China deserves serious consideration.',
        body: ['Not simply because healthcare can be more affordable - but because affordability can exist alongside scale, technology, expertise and access.'],
        cards: [
          { title: 'A Healthcare System Built at Extraordinary Scale', body: 'China provides healthcare for a population of more than one billion people.' },
          { title: 'Grade 3A Hospitals', body: 'For hospital-based treatment, Affordia Health primarily focuses on China’s Grade 3A (Tier 3A / 三甲) hospitals.' },
          { title: 'Advanced Medical Technology', body: 'Leading Chinese hospitals increasingly operate sophisticated diagnostic, surgical, imaging and treatment infrastructure.' },
          { title: 'Experience Through Scale', body: 'Medical technology matters. But technology alone does not treat patients. People do.' },
          { title: 'Potentially Faster Access', body: 'We check availability for the individual client.' },
          { title: 'International Patients Can Access Public Hospitals', body: 'This creates another option beyond expensive international private hospitals.' },
        ],
        quote: 'Advanced infrastructure + experienced medical teams + large clinical volumes.',
      },
      {
        title: 'Affordable Healthcare Without Building the Journey Around Price Alone',
        body: [
          'Affordability is important to us. It is part of our name.',
          'Affordable should mean better access to appropriate healthcare - not simply finding the lowest price.',
        ],
      },
    ],
  },
  'affordia-care': {
    slug: 'affordia-care',
    eyebrow: 'Affordia Care',
    title: 'Global Online Prevention & Long-Term Health Support',
    intro: 'You Don’t Have to Travel to China to Access Affordia Care.',
    image: '/images/tablet-consultation.webp',
    sections: [
      {
        title: 'Affordia Care comes to you online.',
        body: [
          'Affordia Care is a global online service for people who want to take a longer-term approach to their health.',
          'You can participate from your own country.',
        ],
        cards: [
          { title: 'Prevent health problems where possible' },
          { title: 'Understand potential health risks' },
          { title: 'Explore appropriate non-surgical options' },
          { title: 'Improve your lifestyle' },
          { title: 'Explore Traditional Chinese Medicine where appropriate' },
          { title: 'Improve your long-term health strategy after treatment or surgery' },
        ],
      },
      {
        title: 'Our Philosophy',
        body: ['We do not believe health begins with surgery. We do not believe it ends after surgery. And we do not believe healthy living can be purchased in a single product.'],
        quote: 'Think Beyond Today’s Problem.',
      },
      {
        title: 'Affordia Care Is Not Emergency Medicine',
        body: ['Urgent or potentially life-threatening symptoms require immediate assessment through appropriate local emergency or healthcare services. Do not delay urgent medical care while waiting for an Affordia Care consultation.'],
      },
    ],
  },
  'partner-network': {
    slug: 'partner-network',
    eyebrow: 'Partner Network',
    title: 'Build With Affordia Health',
    intro: 'Bring the clients. Build the relationship. We provide the China infrastructure.',
    image: '/images/airport-arrival.webp',
    sections: [
      {
        title: 'Choose the partnership model that fits your business.',
        cards: [
          { title: 'Referral Partner', body: 'Make an Introduction. One introduction can be enough to start.' },
          { title: 'Independent Partner', body: 'Build Your Own Client Base. Your clients. Your relationships. Our China infrastructure.' },
          { title: 'Business Partner', body: 'Connect Your Existing Business. Keep your business. Keep your brand. Expand what you can offer.' },
          { title: 'Country Partner', body: 'Develop a Market. Everyone focuses on what they do best.' },
        ],
      },
      {
        title: 'More Ways to Work With Affordia Health',
        cards: [
          { title: 'Healthcare Partners' },
          { title: 'Insurance & Coverage Partners' },
          { title: 'Become a Partner' },
          { title: 'Referral Program' },
        ],
      },
    ],
  },
  'about-us': {
    slug: 'about-us',
    eyebrow: 'About Us',
    title: 'Healthcare in China, Made More Accessible',
    intro: 'Affordia Health helps international clients access affordable, high-quality healthcare in China with greater choice, faster access, and professional support throughout their medical journey.',
    image: '/images/tablet-consultation.webp',
    sections: [
      {
        title: 'We Start With You',
        body: [
          'Every medical journey is different.',
          'Our goal is not simply to find a hospital. Our goal is to help create a medical journey that combines appropriate healthcare access with the practical support an international client needs while travelling in China.',
        ],
      },
      {
        title: 'Independent by Design',
        body: ['We are not tied to a predetermined hospital network, and we do not automatically direct every client to the same institutions.'],
        cards: [
          { title: 'Quality Matters', body: 'For hospital-based treatment, our focus is on China’s Grade 3A (Tier 3A / 三甲) hospitals.' },
          { title: 'Affordable Does Not Mean Lower Standards', body: 'Affordability matters. Quality matters more. The right solution requires both.' },
          { title: 'More Than Hospital Access', body: 'Travelling abroad for healthcare involves much more than arranging an appointment.' },
          { title: 'Local Support in China', body: 'One of the foundations of Affordia Health is our local presence.' },
        ],
      },
      {
        title: 'Our Mission',
        quote: 'To make high-quality healthcare in China more accessible to international clients through independent access, transparent choice, professional coordination and reliable local support.',
      },
    ],
  },
  pricing: {
    slug: 'pricing',
    eyebrow: 'Pricing',
    title: 'Built Around Your Needs. Not Around a Fixed Package.',
    intro: 'We first understand what you need. Then we build and price the services around your journey.',
    sections: [
      {
        title: 'Our Approach to Pricing',
        body: ['Find an appropriate and affordable solution first. Price our services second.'],
        cards: [
          { title: 'Tell Us Your Budget', body: 'Your budget is part of the solution - not something we ignore.' },
          { title: 'Know the Range Before You Decide', body: 'Understand the possibilities first. Decide second.' },
          { title: 'Modular Pricing', body: 'Start With What You Need. Add Services When You Need Them.' },
          { title: 'Pay As You Go', body: 'You remain in control as the journey develops.' },
          { title: 'No Charge for Services We Cannot Provide', body: 'Clear expectations. Clear services. Clear fees.' },
          { title: 'Healthcare Costs Stay Separate', body: 'You pay the hospital or healthcare provider directly for healthcare.' },
        ],
      },
      { title: 'Price Should Follow the Solution', quote: 'Need → Options → Budget → Agreed Services → Price' },
    ],
  },
  faq: {
    slug: 'faq',
    eyebrow: 'Frequently Asked Questions',
    title: 'The relationship starts with a conversation, not an invoice.',
    intro: 'Start with one service. Add only what you need.',
    sections: [
      {
        title: 'Frequently Asked Questions',
        cards: [
          { title: 'Do I have to pay for everything in advance?', body: 'No. Affordia Health operates primarily on a pay-as-you-go service model.' },
          { title: 'Is the initial consultation free?', body: 'Yes. Your initial consultation with Affordia Health is free and does not obligate you to purchase any service.' },
          { title: 'Do I have to purchase a complete medical travel package?', body: 'No. You choose the services you need.' },
          { title: 'Who pays the hospital?', body: 'Wherever practicable, you pay the hospital or healthcare provider directly.' },
          { title: 'Are you a hospital or medical provider?', body: 'No. Affordia Health is an independent service and coordination company.' },
          { title: 'Can I choose the hospital myself?', body: 'Yes. You remain in control of your medical journey.' },
          { title: 'Will someone help me when I arrive in China?', body: 'If local assistance is included in the services you select, yes.' },
          { title: 'Do I need to speak Chinese?', body: 'Not necessarily. Interpretation and communication assistance can be included in your Affordia Health services.' },
        ],
      },
    ],
  },
  contact: {
    slug: 'contact',
    eyebrow: 'Contact',
    title: 'Get in Touch With Affordia Health',
    intro: 'Whether you are exploring healthcare options, looking for a particular service, considering a partnership or simply want to understand what may be possible, the first step is a conversation.',
    image: '/images/airport-arrival.webp',
    sections: [
      {
        title: 'For Healthcare Clients',
        body: ['You do not need to send your complete medical documentation in your first message. Start with basic information. We can then arrange a free initial consultation.'],
      },
      {
        title: 'For Partners',
        body: ['When contacting us about a partnership, please briefly explain who you are, where you operate, what you provide, and how you would like to cooperate.'],
      },
      {
        title: 'Medical Emergencies',
        body: ['Affordia Health is not an emergency medical service. If you or another person requires urgent medical assistance, contact the appropriate local emergency service or healthcare provider immediately.'],
      },
    ],
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions', eyebrow: 'Terms & Conditions', title: 'Clear Roles. Clear Responsibilities.',
    intro: 'These Terms & Conditions govern the use of Affordia Health services, websites and related service arrangements.',
    sections: [{ title: 'Affordia Health Services', body: ['Affordia Health is a service and coordination company. Medical diagnosis, treatment recommendations and clinical decisions remain exclusively with the relevant healthcare professionals.'] }],
  },
  'data-protection-medical-privacy': {
    slug: 'data-protection-medical-privacy', eyebrow: 'Data Protection & Medical Privacy', title: 'Your Medical Data Remains Your Choice.',
    intro: 'We should only have access to the information we actually need to provide the services you choose.',
    sections: [{ title: 'Your Medical Records Are Not Required to Start', body: ['You do not need to send us your complete medical documentation simply to request a consultation. For many clients, the first step is only a conversation.'] }],
  },
  'cancellation-refund-policy': {
    slug: 'cancellation-refund-policy', eyebrow: 'Cancellation & Refund Policy', title: 'You Pay for the Services We Actually Provide.',
    intro: 'Affordia Health operates primarily on a pay-as-you-go service model.',
    sections: [{ title: 'Clear expectations. Clear services. Clear fees.', body: ['If we cannot provide a service, we do not charge you for providing that service.'] }],
  },
  'medical-responsibility-liability': {
    slug: 'medical-responsibility-liability', eyebrow: 'Medical Responsibility & Liability', title: 'Clear Roles. Clear Responsibilities.',
    intro: 'Affordia Health is designed to help clients access, organise and navigate healthcare and related services.',
    sections: [{ title: 'Our role is assistance and coordination.', body: ['Affordia Health is not a healthcare provider, hospital, medical clinic, insurer or travel agency.'] }],
  },
};
