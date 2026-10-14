#!/usr/bin/env python3
"""
VerityCare AI - Python Medical Evidence & Claim Verification Engine
Provides atomic medical claim extraction, evidence alignment, contradiction detection,
and model ranking scoring.
"""

import sys
import json
import re
from typing import List, Dict, Any

# Authoritative clinical knowledge benchmarks for verification alignment
CLINICAL_BENCHMARKS = [
    {
        "topic": "fever",
        "keywords": ["fever", "pyrexia", "temperature", "paracetamol", "acetaminophen", "ibuprofen"],
        "supported_facts": [
            "Paracetamol (acetaminophen) and ibuprofen are common antipyretics used to reduce fever discomfort.",
            "Adequate hydration and rest are foundational conservative management strategies for acute febrile illness.",
            "A fever in infants under 3 months (≥38.0°C / 100.4°F) is a medical emergency requiring urgent pediatric evaluation.",
            "Aspirin should be avoided in children and adolescents with viral fever due to the risk of Reye's syndrome."
        ],
        "contraindications": ["aspirin in children with viral illness", "exceeding 4000mg paracetamol daily in adults"],
        "sources": [
            {"title": "WHO Guidelines on Childhood Illness Management (IMCI)", "org": "WHO", "year": "2023", "url": "https://www.who.int/publications/i/item/9789241548885"},
            {"title": "MedlinePlus: Fever management and red flags", "org": "NIH / NLM", "year": "2024", "url": "https://medlineplus.gov/ency/article/003090.htm"}
        ]
    },
    {
        "topic": "hypertension",
        "keywords": ["blood pressure", "hypertension", "systolic", "diastolic", "dash diet", "salt", "sodium"],
        "supported_facts": [
            "Normal resting blood pressure is generally defined as systolic <120 mmHg and diastolic <80 mmHg.",
            "Lifestyle modifications including dietary sodium reduction (<2g/day) and DASH diet significantly lower blood pressure.",
            "First-line pharmacological therapy typically includes ACE inhibitors, ARBs, CCBs, or thiazide-like diuretics.",
            "Sudden severe headache, visual disturbance, or chest pain with elevated BP (>180/120 mmHg) indicates hypertensive emergency."
        ],
        "contraindications": ["stopping antihypertensives abruptly without medical supervision"],
        "sources": [
            {"title": "WHO Guideline for the pharmacological treatment of hypertension in adults", "org": "World Health Organization", "year": "2021", "url": "https://www.who.int/publications/i/item/9789240033986"},
            {"title": "Indian Guidelines on Hypertension (I.G.H.-IV)", "org": "Hypertension Society of India / MoHFW", "year": "2022", "url": "https://www.icmr.gov.in/"}
        ]
    },
    {
        "topic": "type 2 diabetes",
        "keywords": ["diabetes", "hba1c", "blood glucose", "metformin", "hypoglycemia", "insulin"],
        "supported_facts": [
            "An HbA1c level of 6.5% (48 mmol/mol) or higher on two separate tests confirms diabetes diagnosis.",
            "Metformin is the standard first-line oral agent alongside lifestyle changes, unless contraindicated by severe renal impairment.",
            "Hypoglycemia (blood sugar <70 mg/dL) requires immediate management using the 15-15 rule (15g fast-acting carbohydrate).",
            "Annual comprehensive screening for retinopathy, nephropathy, and peripheral neuropathy is recommended."
        ],
        "contraindications": ["metformin in acute metabolic acidosis or advanced renal failure eGFR <30"],
        "sources": [
            {"title": "Standards of Care in Diabetes", "org": "American Diabetes Association / ICMR", "year": "2024", "url": "https://diabetesjournals.org/care"},
            {"title": "MedlinePlus: Type 2 Diabetes Management", "org": "NLM / NIH", "year": "2024", "url": "https://medlineplus.gov/ency/article/000313.htm"}
        ]
    },
    {
        "topic": "acute respiratory infection / cough",
        "keywords": ["cough", "bronchitis", "cold", "antibiotics", "phlegm", "sore throat", "respiratory"],
        "supported_facts": [
            "Over 90% of acute bronchitis and upper respiratory tract infections are viral, and antibiotics are not clinically indicated.",
            "Over-the-counter cough suppressants have limited evidence in young children and should not be used in children under 4-6 years.",
            "Red flags include persistent dyspnea, hemoptysis (coughing blood), stridor, or high fever lasting over 3 days."
        ],
        "contraindications": ["routine empirical antibiotic use for acute uncomplicated bronchitis"],
        "sources": [
            {"title": "NICE Guidelines: Cough (acute): antimicrobial prescribing", "org": "NICE / NHS", "year": "2023", "url": "https://www.nice.org.uk/guidance/ng120"},
            {"title": "WHO Antimicrobial Stewardship Guidelines", "org": "WHO", "year": "2022", "url": "https://www.who.int/teams/surveillance-prevention-control-AMR"}
        ]
    },
    {
        "topic": "migraine / headache",
        "keywords": ["migraine", "headache", "triptan", "aura", "photophobia", "analgesic"],
        "supported_facts": [
            "Migraine is typically a unilateral, pulsating moderate-to-severe headache often accompanied by nausea, photophobia, or phonophobia.",
            "Triptans (e.g., sumatriptan) are migraine-specific acute therapies most effective when taken early in the headache phase.",
            "Overuse of acute headache medication (>10-15 days/month) can cause medication-overuse headache (rebound headache).",
            "Sudden severe 'thunderclap' headache reaching peak intensity within seconds requires emergency neuroimaging for suspected subarachnoid hemorrhage."
        ],
        "contraindications": ["triptans in patients with ischemic heart disease or uncontrolled hypertension"],
        "sources": [
            {"title": "International Headache Society Clinical Guidelines (ICHD-3)", "org": "IHS / Cephalalgia", "year": "2023", "url": "https://ichd-3.org/"},
            {"title": "MedlinePlus: Migraine overview", "org": "NLM", "year": "2024", "url": "https://medlineplus.gov/migraine.html"}
        ]
    }
]

def extract_atomic_claims(text: str, model_id: str) -> List[Dict[str, Any]]:
    """Splits response text into discrete, verifiable medical claims."""
    claims = []
    # Clean sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    medical_patterns = [
        r'(should|must|recommended|first-line|prescribe|take|avoid|causes|prevents|contraindicated|effective|dose|mg|hours|daily)',
        r'(symptom|fever|infection|pain|blood|pressure|glucose|disease|syndrome|therapy|treatment|emergency)',
        r'(antibiotic|medication|paracetamol|ibuprofen|aspirin|steroid|supplement|vaccine)'
    ]
    
    idx = 1
    for s in sentences:
        s_clean = s.strip()
        if len(s_clean) < 15 or len(s_clean) > 350:
            continue
        # Check if sentence contains medical assertions
        has_medical = any(re.search(pat, s_clean, re.IGNORECASE) for pat in medical_patterns)
        if has_medical:
            category = "treatment"
            if re.search(r'symptom|sign|indicat|presents', s_clean, re.IGNORECASE):
                category = "symptoms"
            elif re.search(r'avoid|contraindicat|harm|danger|side effect|overuse', s_clean, re.IGNORECASE):
                category = "safety_contraindication"
            elif re.search(r'diagnos|test|hba1c|screen|scan|blood test', s_clean, re.IGNORECASE):
                category = "diagnosis"
            elif re.search(r'emergency|urgent|call|immediately|warning sign', s_clean, re.IGNORECASE):
                category = "urgent_warning"

            claims.append({
                "id": f"claim_{model_id}_{idx}",
                "text": s_clean,
                "model": model_id,
                "category": category,
                "evidence_status": "Not verified",
                "supporting_evidence": [],
                "contradicting_evidence": [],
                "confidence_score": 0.0,
                "sources": []
            })
            idx += 1
            if idx > 6:  # Top distinct claims per model
                break
                
    return claims

def verify_claims_against_benchmarks(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Verifies each extracted claim against authoritative clinical evidence."""
    verified_claims = []
    
    for claim in claims:
        text_lower = claim["text"].lower()
        matched_benchmark = None
        
        for bm in CLINICAL_BENCHMARKS:
            match_count = sum(1 for kw in bm["keywords"] if kw in text_lower)
            if match_count >= 1:
                matched_benchmark = bm
                break
                
        if not matched_benchmark:
            # Insufficient or outside indexed benchmarks
            claim["evidence_status"] = "Insufficient evidence"
            claim["confidence_score"] = 0.45
            claim["explanation"] = "Specific claim statements require expanded specialized literature lookup."
            claim["sources"] = [{
                "title": "National Library of Medicine PubMed Medical Subject Search",
                "org": "NLM / NIH",
                "year": "2024",
                "url": f"https://pubmed.ncbi.nlm.nih.gov/?term={re.sub(r'[^a-zA-Z0-9]+', '+', claim['text'][:40])}",
                "type": "Literature Database"
            }]
            verified_claims.append(claim)
            continue
            
        # Check contraindications with specific negative triggers
        is_contradicted = False
        if matched_benchmark.get("topic") == "fever":
            if "aspirin" in text_lower and any(w in text_lower for w in ["child", "children", "pediatric", "teen"]):
                is_contradicted = True
                claim["contradicting_evidence"].append("Aspirin is contraindicated in children/adolescents due to Reye's syndrome risk.")
            elif "antibiotic" in text_lower and not any(w in text_lower for w in ["not", "avoid", "only if bacterial", "inappropriate"]):
                is_contradicted = True
                claim["contradicting_evidence"].append("Routine antibiotics are inappropriate for uncomplicated viral fever.")
        elif matched_benchmark.get("topic") == "acute respiratory infection / cough":
            if "antibiotic" in text_lower and not any(w in text_lower for w in ["not", "avoid", "ineffective", "viral"]):
                is_contradicted = True
                claim["contradicting_evidence"].append("Over 90% of acute bronchitis is viral; empirical antibiotics are discouraged.")
        elif matched_benchmark.get("topic") == "hypertension":
            if any(w in text_lower for w in ["stop medication", "discontinue blood pressure", "stop pills"]):
                is_contradicted = True
                claim["contradicting_evidence"].append("Abrupt cessation of antihypertensives can precipitate rebound hypertensive crisis.")

        if is_contradicted:
            claim["evidence_status"] = "Conflicting evidence"
            claim["confidence_score"] = 0.15
            claim["sources"] = matched_benchmark["sources"]
            verified_claims.append(claim)
            continue

        # Check support in benchmark facts
        support_matches = []
        for fact in matched_benchmark["supported_facts"]:
            fact_words = [w for w in re.findall(r'\b[a-z]{4,}\b', fact.lower()) if w not in ["with", "from", "that", "this", "have", "were", "been"]]
            claim_words = [w for w in re.findall(r'\b[a-z]{4,}\b', text_lower) if w not in ["with", "from", "that", "this", "have", "were", "been"]]
            overlap = set(fact_words).intersection(set(claim_words))
            if len(overlap) >= 2:
                support_matches.append(fact)

        if len(support_matches) > 0:
            claim["evidence_status"] = "Supported"
            claim["confidence_score"] = min(0.95, 0.75 + (len(support_matches) * 0.08))
            claim["supporting_evidence"] = support_matches
            claim["sources"] = matched_benchmark["sources"]
        else:
            claim["evidence_status"] = "Insufficient evidence"
            claim["confidence_score"] = 0.50
            claim["explanation"] = "Clinical evidence is inconclusive or requires individualized clinician appraisal."
            claim["sources"] = matched_benchmark["sources"]

        verified_claims.append(claim)

    return verified_claims

def compute_model_score(claims: List[Dict[str, Any]], full_text: str, weights: Dict[str, float]) -> Dict[str, Any]:
    """
    Computes transparent multi-factor score:
    - Evidence accuracy (default 60%)
    - Completeness (default 15%)
    - Clarity (default 10%)
    - Uncertainty handling (default 15%)
    """
    if not claims:
        return {
            "total_score": 50.0,
            "evidence_accuracy": 50.0,
            "completeness": 50.0,
            "clarity": 70.0,
            "uncertainty_handling": 50.0,
            "summary": "No distinct verifiable medical claims extracted."
        }

    supported_count = sum(1 for c in claims if c["evidence_status"] == "Supported")
    conflicting_count = sum(1 for c in claims if c["evidence_status"] == "Conflicting evidence")
    insufficient_count = sum(1 for c in claims if c["evidence_status"] == "Insufficient evidence")
    total_claims = len(claims)

    # Evidence accuracy: high penalty for conflicting evidence
    accuracy_raw = ((supported_count * 100) + (insufficient_count * 40) - (conflicting_count * 100)) / max(1, total_claims)
    accuracy_score = max(5.0, min(99.0, accuracy_raw))

    # Completeness: presence of symptoms, treatments, safety caveats
    has_treatment = any(c["category"] == "treatment" for c in claims)
    has_safety = any(c["category"] == "safety_contraindication" for c in claims)
    has_urgent = any(c["category"] == "urgent_warning" for c in claims)
    completeness_score = 50.0 + (15.0 if has_treatment else 0) + (20.0 if has_safety else 0) + (15.0 if has_urgent else 0)

    # Clarity: readability length and structure
    word_count = len(full_text.split())
    clarity_score = 85.0 if (80 <= word_count <= 450) else (65.0 if word_count < 80 else 75.0)

    # Uncertainty handling: presence of cautious, clinician consultation language
    uncertainty_phrases = ["consult a doctor", "healthcare professional", "individual variation", "not a definitive diagnosis", "seek emergency care", "may indicate"]
    found_phrases = sum(1 for p in uncertainty_phrases if p in full_text.lower())
    uncertainty_score = min(98.0, 50.0 + (found_phrases * 12.0))

    w_acc = weights.get("evidence_accuracy", 0.60)
    w_comp = weights.get("completeness", 0.15)
    w_clar = weights.get("clarity", 0.10)
    w_unc = weights.get("uncertainty_handling", 0.15)

    total_weighted = (accuracy_score * w_acc) + (completeness_score * w_comp) + (clarity_score * w_clar) + (uncertainty_score * w_unc)

    return {
        "total_score": round(total_weighted, 1),
        "evidence_accuracy": round(accuracy_score, 1),
        "completeness": round(completeness_score, 1),
        "clarity": round(clarity_score, 1),
        "uncertainty_handling": round(uncertainty_score, 1),
        "supported_claims_count": supported_count,
        "conflicting_claims_count": conflicting_count,
        "insufficient_claims_count": insufficient_count
    }

def process_verification_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Processes dual model outputs and returns full verification analysis."""
    model_a_text = payload.get("model_a_text", "")
    model_b_text = payload.get("model_b_text", "")
    model_a_name = payload.get("model_a_name", "Model A")
    model_b_name = payload.get("model_b_name", "Model B")
    weights = payload.get("weights", {
        "evidence_accuracy": 0.60,
        "completeness": 0.15,
        "clarity": 0.10,
        "uncertainty_handling": 0.15
    })

    claims_a = extract_atomic_claims(model_a_text, model_a_name)
    claims_b = extract_atomic_claims(model_b_text, model_b_name)

    verified_a = verify_claims_against_benchmarks(claims_a)
    verified_b = verify_claims_against_benchmarks(claims_b)

    score_a = compute_model_score(verified_a, model_a_text, weights)
    score_b = compute_model_score(verified_b, model_b_text, weights)

    # Determine agreements and disagreements
    agreements = []
    disagreements = []
    for ca in verified_a:
        for cb in verified_b:
            # Check topical similarity
            words_a = set(re.findall(r'\b\w{4,}\b', ca["text"].lower()))
            words_b = set(re.findall(r'\b\w{4,}\b', cb["text"].lower()))
            overlap = words_a.intersection(words_b)
            if len(overlap) >= 3:
                if ca["evidence_status"] == cb["evidence_status"]:
                    agreements.append({
                        "topic": " ".join(list(overlap)[:3]),
                        "claim_a": ca["text"],
                        "claim_b": cb["text"],
                        "consensus_status": ca["evidence_status"]
                    })
                else:
                    disagreements.append({
                        "topic": " ".join(list(overlap)[:3]),
                        "model_a_view": f"{ca['text']} ({ca['evidence_status']})",
                        "model_b_view": f"{cb['text']} ({cb['evidence_status']})",
                        "clinical_verdict": "Evidence divergence detected. Clinical appraisal recommended."
                    })

    # Evidence-based synthesis recommendation
    if score_a["evidence_accuracy"] < 40 and score_b["evidence_accuracy"] < 40:
        recommendation = "Both models contain unverified or weakly supported claims. Available medical literature is insufficient for definitive conclusion."
        winner = "Neither (Insufficient Evidence)"
    elif abs(score_a["total_score"] - score_b["total_score"]) < 4.0:
        recommendation = "Both models show comparable evidence alignment. Synthesized consensus incorporates verified claims from both."
        winner = "Consensus Balanced"
    elif score_a["total_score"] > score_b["total_score"]:
        recommendation = f"{model_a_name} scored higher primarily due to superior evidence accuracy and validated citations."
        winner = model_a_name
    else:
        recommendation = f"{model_b_name} demonstrated higher medical evidence adherence and prudent safety contraindications."
        winner = model_b_name

    return {
        "status": "success",
        "model_a": {
            "name": model_a_name,
            "claims": verified_a,
            "score": score_a
        },
        "model_b": {
            "name": model_b_name,
            "claims": verified_b,
            "score": score_b
        },
        "agreements": agreements[:4],
        "disagreements": disagreements[:4],
        "comparison_summary": recommendation,
        "recommended_winner": winner,
        "scoring_weights_used": weights,
        "disclaimer": "AI model comparison scores are algorithmic prototype evaluations based on indexed medical literature. They do not constitute formal clinical validation or replace medical professional advice."
    }

if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"error": "No input provided to verifier"}))
            sys.exit(1)
        data = json.loads(raw_input)
        result = process_verification_payload(data)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e), "status": "failed"}))
        sys.exit(1)
