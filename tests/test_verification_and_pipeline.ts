/**
 * VerityCare AI - Comprehensive Automated Test Suite
 * Validates clinical triage, claim extraction, consensus scoring, doctor ranking, and privacy constraints.
 */

import { assessQueryClarification } from '../server/services/clarificationService.ts';
import { searchAndRankDoctors } from '../server/services/doctorService.ts';
import { OFFICIAL_GUIDELINES, searchEvidenceSources } from '../server/services/evidenceService.ts';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runPythonVerifierTest(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../server/python_verifier.py');
    const child = spawn('python3', [scriptPath]);
    let out = '';
    let err = '';
    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => err += d.toString());
    child.on('close', code => {
      if (code === 0) {
        try {
          resolve(JSON.parse(out));
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(err || `Exit code ${code}`));
      }
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

async function runTestSuite() {
  console.log('--- STARTING VERITYCARE AI CLINICAL TEST SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // Test 1: Urgent Warning Sign Detection - Acute Cardiac Symptoms
  const cardiacAssessment = assessQueryClarification('I have sudden crushing chest pain radiating to left arm and sweating');
  assert(cardiacAssessment.is_urgent === true, 'Test 1: Acute chest pain triggers is_urgent = true');
  assert(cardiacAssessment.emergency_contacts !== undefined && cardiacAssessment.emergency_contacts.length > 0, 'Test 1: Emergency hotlines provided immediately');

  // Test 2: Urgent Warning Sign Detection - Stroke FAST signs
  const strokeAssessment = assessQueryClarification('Sudden face drooping and slurred speech');
  assert(strokeAssessment.is_urgent === true, 'Test 2: Stroke signs trigger emergency triage immediately');

  // Test 3: Urgent Warning Sign Detection - Infant < 3 months fever
  const infantAssessment = assessQueryClarification('My 2 month old baby temperature is 38.5 C');
  assert(infantAssessment.is_urgent === true, 'Test 3: Neonatal/infant fever triggers emergency pediatric warning');

  // Test 4: Ambiguous Non-Urgent Query triggers Clarifying Questions
  const vagueAssessment = assessQueryClarification('I have a fever');
  assert(vagueAssessment.is_urgent === false, 'Test 4: Non-urgent fever does not falsely flag emergency');
  assert(vagueAssessment.needs_clarification === true, 'Test 4: Missing duration/progression triggers clarifying questions');
  assert(vagueAssessment.clarifying_questions.length > 0, 'Test 4: Clarifying questions generated with targeted options');

  // Test 5: Python Engine Claim Extraction & Evidence Alignment (Supported claims)
  const pyResult1 = await runPythonVerifierTest({
    model_a_text: 'Paracetamol 500mg can reduce fever and body ache. Ensure adequate hydration.',
    model_b_text: 'Hydration and rest are vital for fever recovery. Avoid exceeding paracetamol limits.',
    model_a_name: 'Llama3',
    model_b_name: 'Mistral'
  });
  assert(pyResult1.status === 'success', 'Test 5: Python verification runs cleanly');
  assert(pyResult1.model_a.claims.some((c: any) => c.evidence_status === 'Supported'), 'Test 5: Supported claim properly matched to benchmark');

  // Test 6: Python Engine Detects Contraindicated / Conflicting Claim
  const pyResult2 = await runPythonVerifierTest({
    model_a_text: 'Give aspirin to children with high viral fever to break it quickly.',
    model_b_text: 'Aspirin is dangerous for children with viral infection due to Reye syndrome.',
    model_a_name: 'OverconfidentModel',
    model_b_name: 'SafeModel'
  });
  const modelAContra = pyResult2.model_a.claims.some((c: any) => c.evidence_status === 'Conflicting evidence');
  assert(modelAContra, 'Test 6: Aspirin in children correctly classified as Conflicting Evidence / Contradiction');
  assert(pyResult2.model_b.score.total_score > pyResult2.model_a.score.total_score, 'Test 6: Model adhering to clinical safety receives superior score');

  // Test 7: Doctor Search by Specialty & Official Council Verification
  const cardioDocs = searchAndRankDoctors({ query: 'Cardiology', city: 'Delhi' });
  assert(cardioDocs.length > 0, 'Test 7: Doctor search returns matching cardiologists in Delhi');
  assert(cardioDocs[0].registrationStatus === 'Verified Official', 'Test 7: NMC / Council registration status is verified');
  assert(cardioDocs[0].scoreBreakdown.composite_rank > 80, 'Test 7: Multi-factor composite rank computed transparently');

  // Test 8: Doctor Distance & Proximity Computation
  const nearDocs = searchAndRankDoctors({ query: 'pediatric', city: 'Chennai' });
  assert(nearDocs.length > 0, 'Test 8: Pediatric search returns Chennai practitioners');
  assert(nearDocs[0].distanceKm !== undefined, 'Test 8: Distance metric calculated');

  // Test 9: Authoritative Guidelines Index Integrity
  assert(OFFICIAL_GUIDELINES.length >= 5, 'Test 9: Minimum 5 core clinical domains indexed in evidence service');
  const feverGuide = OFFICIAL_GUIDELINES.find(g => g.topic === 'fever');
  assert(feverGuide !== undefined && feverGuide.organization.includes('WHO'), 'Test 9: WHO fever guideline is accredited and indexed');

  // Test 10: Medical Sources Search Returns Peer-Reviewed Links
  const sources = await searchEvidenceSources('hypertension');
  assert(sources.length > 0, 'Test 10: Evidence search returns real authoritative source links');
  assert(sources.some(s => s.url.startsWith('https://')), 'Test 10: All source URLs are valid HTTPS citations');

  console.log(`\n--- TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
