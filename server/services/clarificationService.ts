import { ClarifyingAssessment } from '../../src/types/index.ts';

interface RedFlagRule {
  patterns: RegExp[];
  alertMessage: string;
}

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    patterns: [
      /chest\s*(pain|pressure|tightness|heaviness)/i,
      /radiating\s*(to|down)\s*(left\s*)?(arm|jaw|neck|back)/i,
      /heart\s*attack/i
    ],
    alertMessage: 'POSSIBLE ACUTE CORONARY SYNDROME / CARDIAC EVENT: Severe chest pressure or pain radiating to the jaw, neck, or arm requires immediate emergency medical attention.'
  },
  {
    patterns: [
      /(face\s*droop|arm\s*weakness|slurred\s*speech|speech\s*difficulty)/i,
      /sudden\s*loss\s*of\s*(vision|balance|movement)/i,
      /stroke/i
    ],
    alertMessage: 'POSSIBLE ACUTE STROKE (F.A.S.T.): Sudden facial weakness, arm numbness, or speech disturbance is a neurological emergency where every minute matters.'
  },
  {
    patterns: [
      /severe\s*shortness\s*of\s*breath/i,
      /(cannot|can't)\s*breathe/i,
      /throat\s*closing/i,
      /anaphylaxis/i,
      /stridor|gasping/i
    ],
    alertMessage: 'ACUTE RESPIRATORY OR AIRWAY COMPROMISE: Inability to breathe adequately or sensation of throat closing demands urgent emergency paramedic dispatch.'
  },
  {
    patterns: [
      /thunderclap\s*headache/i,
      /worst\s*headache\s*of\s*(my\s*)?life/i,
      /sudden\s*explosive\s*headache/i
    ],
    alertMessage: 'POSSIBLE SUBARACHNOID HEMORRHAGE: Sudden peak-intensity headache requires urgent hospital neuroimaging to rule out intracranial hemorrhage.'
  },
  {
    patterns: [
      /(infant|baby|newborn)\s*(under|less\s*than|\b[0-3]\s*months?\s*old\b)?.*(fever|temperature|temp)/i,
      /(fever|temperature|temp).*(infant|baby|newborn|\b[0-3]\s*months?\s*old\b)/i,
      /newborn\s*fever/i,
      /baby\s*temperature\s*(over|above|>|\bis\b)\s*(38|100\.4)/i
    ],
    alertMessage: 'NEONATAL / INFANTILE FEVER EMERGENCY: Any fever ≥ 38.0°C (100.4°F) in an infant under 3 months requires immediate pediatric hospital evaluation for neonatal sepsis.'
  },
  {
    patterns: [
      /suicid(e|al)/i,
      /kill\s*myself/i,
      /end\s*my\s*life/i,
      /want\s*to\s*die/i
    ],
    alertMessage: 'URGENT CRISIS SUPPORT: You are not alone and immediate compassionate help is available. Please reach out to local crisis hotlines immediately.'
  }
];

export function assessQueryClarification(query: string, contextHistory: string[] = []): ClarifyingAssessment {
  const queryLower = query.toLowerCase();

  // 1. Check for emergency red flags first
  for (const rule of RED_FLAG_RULES) {
    if (rule.patterns.some(pat => pat.test(queryLower))) {
      return {
        is_urgent: true,
        urgent_warning_message: rule.alertMessage,
        emergency_contacts: [
          { label: 'India Emergency & Ambulance', number: '112 / 108' },
          { label: 'US / Canada Emergency', number: '911' },
          { label: 'UK & Europe Emergency', number: '999 / 112' },
          { label: 'Tele-MANAS Mental Health Helpline (India)', number: '14416 / 1800-891-4416' },
          { label: 'Suicide & Crisis Lifeline (US)', number: '988' }
        ],
        needs_clarification: false,
        clarifying_questions: [],
        identified_category: 'urgent_alert'
      };
    }
  }

  // 2. Determine domain and missing crucial clinical context
  const questions: ClarifyingAssessment['clarifying_questions'] = [];
  let category: ClarifyingAssessment['identified_category'] = 'general_education';

  const isFever = queryLower.includes('fever') || queryLower.includes('temperature') || queryLower.includes('chills');
  const isCough = queryLower.includes('cough') || queryLower.includes('cold') || queryLower.includes('throat');
  const isPain = queryLower.includes('pain') || queryLower.includes('ache') || queryLower.includes('headache') || queryLower.includes('stomach');
  const isBP = queryLower.includes('bp') || queryLower.includes('blood pressure') || queryLower.includes('hypertension');
  const isSugar = queryLower.includes('sugar') || queryLower.includes('glucose') || queryLower.includes('diabetes');

  if (isFever || isCough || isPain || isBP || isSugar) {
    category = 'symptom_concern';

    // Check if duration is specified
    const hasDuration = /\b(days?|hours?|weeks?|months?|yesterday|today|since)\b/i.test(queryLower);
    if (!hasDuration) {
      questions.push({
        id: 'q_duration',
        question: 'How long have you or the individual been experiencing this symptom?',
        options: ['Less than 24 hours', '1 to 3 days', '4 to 7 days', 'More than 2 weeks (Chronic)'],
        category: 'duration'
      });
    }

    // Check if progression/trend is specified
    const hasTrend = /\b(better|worse|worsening|improving|same|steady)\b/i.test(queryLower);
    if (!hasTrend) {
      questions.push({
        id: 'q_trend',
        question: 'Are your symptoms improving, staying consistent, or worsening over time?',
        options: ['Getting progressively worse', 'Staying about the same', 'Gradually improving', 'Comes and goes in waves'],
        category: 'trend'
      });
    }

    // Age group check if pediatric or elderly terms absent
    const hasAge = /\b(child|infant|baby|years\s*old|elderly|senior|adult|age)\b/i.test(queryLower);
    if (!hasAge && isFever) {
      questions.push({
        id: 'q_age',
        question: 'What is the approximate age group of the person with the fever?',
        options: ['Infant under 3 months', 'Toddler / Child (3 months - 12 years)', 'Teen / Adult (13 - 64)', 'Senior (65+)'],
        category: 'age_group'
      });
    }
  }

  return {
    is_urgent: false,
    needs_clarification: questions.length > 0,
    clarifying_questions: questions.slice(0, 3), // Max 3 concise clarifying prompts
    identified_category: category
  };
}
