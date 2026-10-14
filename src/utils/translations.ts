export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  navChat: string;
  navVerify: string;
  navDoctors: string;
  navCheckIn: string;
  navHistory: string;
  navSources: string;
  navOffline: string;
  navSettings: string;
  emergencyAlertTitle: string;
  emergencyCallPrompt: string;
  chatPlaceholder: string;
  askButton: string;
  clarifyTitle: string;
  clarifySubtitle: string;
  continueWithDetails: string;
  skipClarify: string;
  verifiedFindings: string;
  modelComparison: string;
  claimsAnalysis: string;
  officialCitations: string;
  doctorSearchTitle: string;
  doctorSearchPlaceholder: string;
  filterSpecialty: string;
  filterCity: string;
  searchButton: string;
  verifiedRegistration: string;
  dailyCheckInTitle: string;
  howFeeling: string;
  feelingBetter: string;
  feelingSame: string;
  feelingWorse: string;
  painScaleLabel: string;
  symptomsTrendLabel: string;
  trendImproving: string;
  trendStable: string;
  trendWorsening: string;
  notesLabel: string;
  saveCheckInButton: string;
  offlineMode: string;
  onlineMode: string;
  installApp: string;
  privacyNotice: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'VerityCare AI',
    tagline: 'Evidence-First Healthcare, Dual-AI Verification & Doctor Discovery',
    navChat: 'Health Chat',
    navVerify: 'Verify an Answer',
    navDoctors: 'Find a Doctor',
    navCheckIn: 'Daily Check-in',
    navHistory: 'Health History',
    navSources: 'Medical Sources',
    navOffline: 'Offline Knowledge',
    navSettings: 'Settings & Privacy',
    emergencyAlertTitle: 'Urgent Medical Warning Detected',
    emergencyCallPrompt: 'Please contact emergency medical services or visit the nearest emergency department immediately.',
    chatPlaceholder: 'Describe your symptom, health question, or medication concern...',
    askButton: 'Verify & Explain',
    clarifyTitle: 'Clarifying Medical Details',
    clarifySubtitle: 'Providing these details helps evaluate clinical guidelines accurately.',
    continueWithDetails: 'Analyze with My Details',
    skipClarify: 'Skip to General Evidence',
    verifiedFindings: 'Verified Medical Findings',
    modelComparison: 'Dual-AI Model Evaluation',
    claimsAnalysis: 'Extracted Claims & Clinical Evidence Status',
    officialCitations: 'Authoritative Sources & Clinical Guidelines',
    doctorSearchTitle: 'Find Verified Doctors & Specialists',
    doctorSearchPlaceholder: 'Search by medical specialty, symptom, or doctor name...',
    filterSpecialty: 'Specialty',
    filterCity: 'City / Region',
    searchButton: 'Search Doctors',
    verifiedRegistration: 'Official Council Verified',
    dailyCheckInTitle: 'Daily Recovery Check-in',
    howFeeling: 'How are you feeling today overall?',
    feelingBetter: 'Better than yesterday',
    feelingSame: 'About the same',
    feelingWorse: 'Worse / New concerns',
    painScaleLabel: 'Discomfort or Pain Scale (1-10)',
    symptomsTrendLabel: 'Symptom Trend',
    trendImproving: 'Improving',
    trendStable: 'Stable',
    trendWorsening: 'Worsening',
    notesLabel: 'Optional Daily Notes / Observations',
    saveCheckInButton: 'Record Today’s Check-in',
    offlineMode: 'Offline Mode Active',
    onlineMode: 'Connected to Evidence Registry',
    installApp: 'Install App (PWA)',
    privacyNotice: 'All chats, symptom records, and medical check-ins remain 100% on your device in local storage.'
  },
  te: {
    appName: 'వెరిటీకేర్ AI (VerityCare AI)',
    tagline: 'వైద్య ఆధారాల పరిశీలన, ద్వంద్వ AI ధృవీకరణ & వైద్యుల శోధన',
    navChat: 'ఆరోగ్య సమాచారం',
    navVerify: 'సమాధానం ధృవీకరించండి',
    navDoctors: 'వైద్యులను కనుగొనండి',
    navCheckIn: 'రోజువారీ తనిఖీ',
    navHistory: 'ఆరోగ్య చరిత్ర',
    navSources: 'వైద్య వనరులు',
    navOffline: 'ఆఫ్‌లైన్ విజ్ఞానం',
    navSettings: 'సెట్టింగ్‌లు & గోప్యత',
    emergencyAlertTitle: 'అత్యవసర వైద్య హెచ్చరిక గుర్తించబడింది',
    emergencyCallPrompt: 'దయచేసి వెంటనే అత్యవసర వైద్య సేవలను (108/112) సంప్రదించండి లేదా సమీపంలోని ఆసుపత్రికి వెళ్లండి.',
    chatPlaceholder: 'మీ లక్షణాలు, ఆరోగ్య ప్రశ్న లేదా మందుల గురించి అడగండి...',
    askButton: 'ధృవీకరించి వివరించండి',
    clarifyTitle: 'వైద్య వివరాల వివరణ',
    clarifySubtitle: 'ఈ వివరాలు అందించడం ద్వారా మరింత ఖచ్చితమైన సమాచారం లభిస్తుంది.',
    continueWithDetails: 'వివరాలతో విశ్లేషించండి',
    skipClarify: 'సాధారణ సమాచారం చూడండి',
    verifiedFindings: 'ధృవీకరించబడిన వైద్య విషయాలు',
    modelComparison: 'ద్వంద్వ AI పోలిక',
    claimsAnalysis: 'వైద్య వాదనల పరిశీలన',
    officialCitations: 'అధికారిక వైద్య ఆధారాలు',
    doctorSearchTitle: 'ధృవీకరించబడిన వైద్యులను కనుగొనండి',
    doctorSearchPlaceholder: 'స్పెషాలిటీ, లక్షణం లేదా వైద్యుడి పేరుతో శోధించండి...',
    filterSpecialty: 'స్పెషాలిటీ',
    filterCity: 'నగరం / ప్రాంతం',
    searchButton: 'వైద్యులను శోధించండి',
    verifiedRegistration: 'అధికారిక కౌన్సిల్ ధృవీకరణ',
    dailyCheckInTitle: 'రోజువారీ రికవరీ చెక్-ఇన్',
    howFeeling: 'ఈరోజు మీ ఆరోగ్యం ఎలా ఉంది?',
    feelingBetter: 'నిన్నటి కంటే మెరుగుపడింది',
    feelingSame: 'అలాగే ఉంది',
    feelingWorse: 'మరింత తీవ్రమైంది',
    painScaleLabel: 'నొప్పి తీవ్రత (1-10)',
    symptomsTrendLabel: 'లక్షణాల పరిస్థితి',
    trendImproving: 'మెరుగుపడుతోంది',
    trendStable: 'స్థిరంగా ఉంది',
    trendWorsening: 'క్షీణిస్తోంది',
    notesLabel: 'మీ గమనికలు',
    saveCheckInButton: 'చెక్-ఇన్ నమోదు చేయండి',
    offlineMode: 'ఆఫ్‌లైన్ మోడ్ పని చేస్తోంది',
    onlineMode: 'ఆధారాల నెట్‌వర్క్‌తో అనుసంధానించబడింది',
    installApp: 'యాప్ ఇన్‌స్టాల్ చేయండి',
    privacyNotice: 'మీ ఆరోగ్య సమాచారం పూర్తిగా మీ పరికరంలోనే భద్రంగా నిల్వ చేయబడుతుంది.'
  },
  hi: {
    appName: 'वेरिटीकेयर AI (VerityCare AI)',
    tagline: 'साक्ष्य-आधारित स्वास्थ्य जानकारी, दोहरे AI सत्यापन और डॉक्टर खोज',
    navChat: 'स्वास्थ्य संवाद',
    navVerify: 'उत्तर सत्यापित करें',
    navDoctors: 'डॉक्टर खोजें',
    navCheckIn: 'दैनिक स्वास्थ्य चेक-इन',
    navHistory: 'स्वास्थ्य इतिहास',
    navSources: 'चिकित्सा स्रोत',
    navOffline: 'ऑफलाइन ज्ञान',
    navSettings: 'सेटिंग्स और गोपनीयता',
    emergencyAlertTitle: 'आपातकालीन चिकित्सा चेतावनी',
    emergencyCallPrompt: 'कृपया तुरंत आपातकालीन सेवाओं (108/112) से संपर्क करें या निकटतम अस्पताल जाएं।',
    chatPlaceholder: 'अपने लक्षण, स्वास्थ्य प्रश्न या दवा के बारे में पूछें...',
    askButton: 'सत्यापित करें और समझें',
    clarifyTitle: 'चिकित्सा विवरण स्पष्टीकरण',
    clarifySubtitle: 'इन विवरणों को प्रदान करने से साक्ष्य-आधारित विश्लेषण अधिक सटीक होता है।',
    continueWithDetails: 'विवरण के साथ विश्लेषण करें',
    skipClarify: 'सामान्य साक्ष्य देखें',
    verifiedFindings: 'सत्यापित चिकित्सा निष्कर्ष',
    modelComparison: 'दोहरे AI मॉडल का मूल्यांकन',
    claimsAnalysis: 'चिकित्सा दावों का साक्ष्य स्तर',
    officialCitations: 'आधिकारिक संदर्भ और दिशानिर्देश',
    doctorSearchTitle: 'सत्यापित डॉक्टर और विशेषज्ञ खोजें',
    doctorSearchPlaceholder: 'विशेषज्ञता, लक्षण या डॉक्टर के नाम से खोजें...',
    filterSpecialty: 'विशेषज्ञता',
    filterCity: 'शहर / क्षेत्र',
    searchButton: 'डॉक्टर खोजें',
    verifiedRegistration: 'आधिकारिक परिषद से सत्यापित',
    dailyCheckInTitle: 'दैनिक स्वास्थ्य चेक-इन',
    howFeeling: 'आज आप कैसा महसूस कर रहे हैं?',
    feelingBetter: 'कल से बेहतर',
    feelingSame: 'पहले जैसा ही',
    feelingWorse: 'स्थिति बिगड़ी है',
    painScaleLabel: 'दर्द या असुविधा का पैमाना (1-10)',
    symptomsTrendLabel: 'लक्षणों की दिशा',
    trendImproving: 'सुधार हो रहा है',
    trendStable: 'स्थिर है',
    trendWorsening: 'बिगड़ रहा है',
    notesLabel: 'दैनिक टिप्पणियाँ',
    saveCheckInButton: 'चेक-इन सहेजें',
    offlineMode: 'ऑफलाइन मोड सक्रिय',
    onlineMode: 'साक्ष्य रजिस्ट्री से जुड़ा हुआ',
    installApp: 'ऐप इंस्टॉल करें',
    privacyNotice: 'आपका स्वास्थ्य डेटा पूरी तरह से आपके डिवाइस पर सुरक्षित रूप से संग्रहीत है।'
  }
};
