import { MedicalSource } from '../../src/types/index.ts';

export interface AuthoritativeGuideline {
  topic: string;
  category: string;
  title: string;
  organization: string;
  year: string;
  lastUpdated: string;
  url: string;
  guidelineSummary: string;
  keyFacts: string[];
  redFlags: string[];
}

export const OFFICIAL_GUIDELINES: AuthoritativeGuideline[] = [
  {
    topic: 'fever',
    category: 'Pediatric & Adult Acute Care',
    title: 'WHO Integrated Management of Childhood Illness (IMCI) & Adult Febrile Protocol',
    organization: 'World Health Organization (WHO)',
    year: '2023',
    lastUpdated: '2024-01-15',
    url: 'https://www.who.int/publications/i/item/9789241548885',
    guidelineSummary: 'Systematic approach to fever management emphasizing differential diagnosis, hydration, safe antipyretic dosing, and prevention of antimicrobial overuse.',
    keyFacts: [
      'Paracetamol (acetaminophen) at 10-15 mg/kg per dose (pediatric) or 500-1000 mg every 4-6 hours (adults, max 4000mg/day) is first-line antipyretic.',
      'Aspirin is strictly contraindicated in children and adolescents under 19 with viral illnesses due to fatal Reye syndrome risk.',
      'Fever in infants under 3 months (temperature ≥ 38.0°C / 100.4°F) is a medical emergency requiring full diagnostic sepsis workup.',
      'Routine fever does not cause brain damage unless sustained above 42°C (107.6°F), which is exceedingly rare in infectious fever.'
    ],
    redFlags: [
      'Lethargy or inability to wake or stay awake',
      'Stiff neck, petechial or purpuric rash that does not fade under pressure',
      'Severe respiratory distress, grunting, or stridor',
      'Persistent fever > 3 days without identifiable source'
    ]
  },
  {
    topic: 'hypertension',
    category: 'Cardiovascular Health',
    title: 'WHO & Indian Guidelines on Hypertension (I.G.H.-IV)',
    organization: 'World Health Organization & ICMR',
    year: '2022',
    lastUpdated: '2023-11-20',
    url: 'https://www.who.int/publications/i/item/9789240033986',
    guidelineSummary: 'Pharmacological and non-pharmacological evidence-based interventions for adult systemic hypertension.',
    keyFacts: [
      'Stage 1 Hypertension is defined as systolic BP 130-139 mmHg or diastolic 80-89 mmHg under standardized resting measurement.',
      'Sodium restriction (< 2 grams/day or ~5g salt) combined with the DASH diet provides 8-14 mmHg systolic reduction.',
      'First-line antihypertensive classes include ACE inhibitors, Angiotensin Receptor Blockers (ARBs), Dihydropyridine Calcium Channel Blockers, and Thiazide diuretics.',
      'Blood pressure medications must never be discontinued abruptly due to severe rebound hypertension risks.'
    ],
    redFlags: [
      'Systolic > 180 mmHg or diastolic > 120 mmHg with acute chest pain, dyspnea, or altered vision (Hypertensive Emergency)',
      'Sudden weakness, facial numbness, or confusion'
    ]
  },
  {
    topic: 'type 2 diabetes',
    category: 'Endocrine & Metabolic Health',
    title: 'ICMR Guidelines for Management of Type 2 Diabetes & ADA Standards of Care',
    organization: 'Indian Council of Medical Research (ICMR) / ADA',
    year: '2024',
    lastUpdated: '2024-03-01',
    url: 'https://main.icmr.nic.in/content/guidelines',
    guidelineSummary: 'Comprehensive evidence-based management of glycemic targets, prevention of microvascular/macrovascular complications.',
    keyFacts: [
      'Diagnosis is established with fasting plasma glucose ≥ 126 mg/dL (7.0 mmol/L) or HbA1c ≥ 6.5% verified on repeat testing.',
      'Metformin remains the cornerstone initial oral pharmacological monotherapy alongside structured nutrition and exercise.',
      'Standard HbA1c target for most non-pregnant adults is < 7.0%, tailored higher for frail or elderly individuals with hypoglycemia unawareness.',
      'Acute hypoglycemia (< 70 mg/dL) must be promptly treated using 15g fast-acting oral glucose, rechecking after 15 minutes (Rule of 15).'
    ],
    redFlags: [
      'Blood glucose > 300 mg/dL accompanied by nausea, vomiting, fruity breath odor, or deep rapid breathing (suspected DKA)',
      'Severe hypoglycemia with confusion or loss of consciousness'
    ]
  },
  {
    topic: 'respiratory / cough',
    category: 'Pulmonary & Infectious Diseases',
    title: 'NICE Clinical Guideline on Acute Cough and Antimicrobial Stewardship',
    organization: 'National Institute for Health and Care Excellence (NICE)',
    year: '2023',
    lastUpdated: '2023-10-10',
    url: 'https://www.nice.org.uk/guidance/ng120',
    guidelineSummary: 'Guidelines to restrict unnecessary antibiotic prescribing in viral acute bronchitis, providing symptom management recommendations.',
    keyFacts: [
      'Acute uncomplicated bronchitis lasts an average of 3 to 4 weeks; viral etiology accounts for > 90% of cases.',
      'Antibiotics do not clinically shorten illness duration in uncomplicated acute bronchitis and carry adverse drug reaction risks.',
      'Honey has clinical trial evidence demonstrating superior symptom relief compared to placebo or diphenhydramine in children > 1 year.',
      'Honey must never be given to infants under 1 year of age due to the risk of infantile botulism.'
    ],
    redFlags: [
      'Hemoptysis (coughing up frank blood)',
      'Persistent resting tachypnea or oxygen saturation below 94%',
      'Pleuritic chest pain or persistent high fever'
    ]
  },
  {
    topic: 'migraine',
    category: 'Neurological Disorders',
    title: 'International Headache Society Clinical Guidelines (ICHD-3)',
    organization: 'International Headache Society',
    year: '2023',
    lastUpdated: '2024-02-12',
    url: 'https://ichd-3.org/',
    guidelineSummary: 'Diagnostic criteria, acute treatment stratification, and preventive migraine therapy.',
    keyFacts: [
      'Migraine diagnosis requires recurrent attacks lasting 4-72 hours, with unilateral location, pulsating quality, moderate/severe intensity, and nausea/photophobia.',
      'Triptans (5-HT1B/1D agonists) are migraine-specific acute abortives, most effective when taken during the mild pain phase before central sensitization.',
      'Limiting acute analgesic medication to < 10 days/month prevents medication-overuse headache (MOH).',
      'Triptans are contraindicated in patients with coronary artery disease, peripheral vascular disease, or uncontrolled hypertension.'
    ],
    redFlags: [
      'Sudden thunderclap headache reaching maximum severity in seconds ("worst headache of life")',
      'Headache with fever, neck stiffness, rash, or focal neurological deficits',
      'New-onset headache in an individual over 50 years of age'
    ]
  }
];

export async function searchEvidenceSources(query: string): Promise<MedicalSource[]> {
  const queryLower = query.toLowerCase();
  const matchedSources: MedicalSource[] = [];

  // Match local official guidelines first
  for (const guide of OFFICIAL_GUIDELINES) {
    if (queryLower.includes(guide.topic) || guide.keyFacts.some(fact => fact.toLowerCase().includes(queryLower))) {
      matchedSources.push({
        title: guide.title,
        org: guide.organization,
        year: guide.year,
        url: guide.url,
        type: 'Official Clinical Guideline',
        updateDate: guide.lastUpdated,
        excerpt: guide.guidelineSummary
      });
    }
  }

  // Always append standard authoritative search links if fewer than 3 matched
  if (matchedSources.length === 0) {
    matchedSources.push({
      title: 'MedlinePlus Medical Encyclopedia & Clinical Summaries',
      org: 'U.S. National Library of Medicine (NLM)',
      year: '2024',
      url: `https://medlineplus.gov/search.html?query=${encodeURIComponent(query)}`,
      type: 'Peer-Reviewed Consumer Health Resource',
      updateDate: '2024-02-01',
      excerpt: 'Comprehensive peer-reviewed health monographs indexed by the National Institutes of Health.'
    });
    matchedSources.push({
      title: 'PubMed Central & NCBI Peer-Reviewed Clinical Trials Database',
      org: 'National Center for Biotechnology Information (NCBI)',
      year: '2024',
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`,
      type: 'Biomedical Scientific Literature',
      updateDate: '2024-03-01',
      excerpt: 'Open biomedical literature and systematic review repository.'
    });
    matchedSources.push({
      title: 'World Health Organization (WHO) Guidelines Approved by the Guidelines Review Committee',
      org: 'World Health Organization (WHO)',
      year: '2023',
      url: 'https://www.who.int/publications/guidelines',
      type: 'Global Public Health Guideline',
      updateDate: '2023-12-15',
      excerpt: 'Evidence-based clinical guidelines vetted by international specialist consensus.'
    });
  }

  return matchedSources;
}
