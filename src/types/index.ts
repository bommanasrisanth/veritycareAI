export type EvidenceStatus = 'Supported' | 'Conflicting evidence' | 'Insufficient evidence' | 'Not verified';

export interface MedicalSource {
  title: string;
  org: string;
  year?: string;
  url: string;
  type?: string;
  updateDate?: string;
  excerpt?: string;
}

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

export interface MedicalClaim {
  id: string;
  text: string;
  model: string;
  category: 'treatment' | 'symptoms' | 'safety_contraindication' | 'diagnosis' | 'urgent_warning';
  evidence_status: EvidenceStatus;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  confidence_score: number;
  sources: MedicalSource[];
  explanation?: string;
}

export interface ModelScore {
  total_score: number;
  evidence_accuracy: number;
  completeness: number;
  clarity: number;
  uncertainty_handling: number;
  supported_claims_count: number;
  conflicting_claims_count: number;
  insufficient_claims_count: number;
}

export interface ModelResult {
  name: string;
  raw_response: string;
  claims: MedicalClaim[];
  score: ModelScore;
  runtime_status: 'local_ollama' | 'cloud_verified_adapter' | 'offline_fallback' | 'error';
  execution_time_ms?: number;
}

export interface VerificationAnalysis {
  status: 'success' | 'failed' | 'offline';
  model_a: ModelResult;
  model_b: ModelResult;
  agreements: Array<{
    topic: string;
    claim_a: string;
    claim_b: string;
    consensus_status: EvidenceStatus;
  }>;
  disagreements: Array<{
    topic: string;
    model_a_view: string;
    model_b_view: string;
    clinical_verdict: string;
  }>;
  comparison_summary: string;
  recommended_winner: string;
  scoring_weights_used: {
    evidence_accuracy: number;
    completeness: number;
    clarity: number;
    uncertainty_handling: number;
  };
  disclaimer: string;
  synthesized_answer?: {
    summary: string;
    key_verified_points: string[];
    uncertainties_and_conflicts: string[];
    citations: MedicalSource[];
    consult_recommendation: string;
  };
}

export interface ClarifyingAssessment {
  is_urgent: boolean;
  urgent_warning_message?: string;
  emergency_contacts?: { label: string; number: string }[];
  needs_clarification: boolean;
  clarifying_questions: Array<{
    id: string;
    question: string;
    options: string[];
    category: 'duration' | 'trend' | 'associated_symptoms' | 'prior_conditions' | 'age_group';
  }>;
  identified_category: 'general_education' | 'symptom_concern' | 'medication_inquiry' | 'doctor_discovery' | 'report_analysis' | 'urgent_alert';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  registrationNumber: string;
  registrationCouncil: string;
  registrationStatus: 'Verified Official' | 'Pending Verification' | 'Unverified Directory';
  clinicHospital: string;
  city: string;
  area: string;
  pinCode?: string;
  distanceKm?: number;
  rating?: number;
  reviewCount?: number;
  reviewSource?: string;
  reviewsVerified: boolean;
  availabilityStatus: 'Verified Slots Available' | 'Contact Clinic Directly' | 'Teleconsultation Available';
  bookingUrl?: string;
  phone?: string;
  address: string;
  scoreBreakdown: {
    specialty_relevance: number; // 35%
    registration_verification: number; // 25%
    distance: number; // 15%
    availability: number; // 10%
    reviews: number; // 15%
    composite_rank: number;
  };
  rankingReason: string;
}

export interface DailyCheckIn {
  id: string;
  timestamp: number;
  dateStr: string;
  overallFeeling: 'better' | 'same' | 'worsening';
  painScale: number; // 1 - 10
  symptomsTrend: 'improving' | 'stable' | 'worsening';
  newSymptoms: boolean;
  notes: string;
  hasRedFlags: boolean;
  redFlagDetails?: string;
}

export interface HealthChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system_alert';
  text: string;
  timestamp: number;
  clarification?: ClarifyingAssessment;
  verification?: VerificationAnalysis;
  attachedDocument?: {
    fileName: string;
    fileSize: number;
    extractedText: string;
  };
}

export interface SystemStatus {
  ollama_active: boolean;
  ollama_endpoint: string;
  model_a_name: string;
  model_b_name: string;
  cloud_adapter_active: boolean;
  python_service_active: boolean;
  medical_sources_online: boolean;
  local_guidelines_count: number;
}
