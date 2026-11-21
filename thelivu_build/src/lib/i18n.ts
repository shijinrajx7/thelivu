import type { UserPreferences } from './types';
export type Language = UserPreferences['language'];

const copy: Record<Language, Record<string, string>> = {
  en: {
    overview: 'Overview', scanner: 'Website Scanner', claims: 'Claim Checker', image: 'Image Verification', video: 'Video Awareness', messages: 'Message Checker', review: 'API Security Review', threats: 'Threat Intelligence', learning: 'Cyber Learning Lab', history: 'Scan History', reports: 'Saved Reports', settings: 'Settings', account: 'Account',
    search: 'Search tools, resources, reports…', help: 'Help centre', notifications: 'Notifications', verify: 'Verify before you trust', privacy: 'Private by design',
    dashboardTitle: 'Your Digital Trust Centre', dashboardSubtitle: 'Understand what you’re looking at before you trust it.', scanNow: 'Analyse Website', urlPlaceholder: 'Paste a full website URL (https://…)', recent: 'Recent activity', quickTools: 'Quick verification tools', learningTip: 'A clean check is not a safety guarantee.',
    analyse: 'Analyse locally', clear: 'Clear', paste: 'Paste', saveReport: 'Save report', download: 'Download report', share: 'Share', clearData: 'Clear local data', noResults: 'Nothing to show yet', unavailable: 'Not configured', localOnly: 'Processed only in this browser', sourceCoverage: 'Coverage and limitations', findings: 'Findings', nextSteps: 'Recommended next steps', runCheck: 'Run check', addEvidence: 'Add source', settingsTitle: 'Privacy & preferences',
  },
  ml: {
    overview: 'അവലോകനം', scanner: 'വെബ്‌സൈറ്റ് സ്കാനർ', claims: 'വസ്തുത പരിശോധന', image: 'ചിത്ര പരിശോധന', video: 'വീഡിയോ ബോധവൽക്കരണം', messages: 'സന്ദേശ പരിശോധന', review: 'API സുരക്ഷാ പരിശോധന', threats: 'ഭീഷണി വിവരങ്ങൾ', learning: 'സൈബർ പഠനശാല', history: 'സ്കാൻ ചരിത്രം', reports: 'സംരക്ഷിച്ച റിപ്പോർട്ടുകൾ', settings: 'ക്രമീകരണങ്ങൾ', account: 'അക്കൗണ്ട്',
    search: 'ഉപകരണങ്ങൾ, ഉറവിടങ്ങൾ, റിപ്പോർട്ടുകൾ തിരയുക…', help: 'സഹായ കേന്ദ്രം', notifications: 'അറിയിപ്പുകൾ', verify: 'വിശ്വസിക്കുന്നതിന് മുമ്പ് പരിശോധിക്കുക', privacy: 'സ്വകാര്യത മുൻഗണന',
    dashboardTitle: 'നിങ്ങളുടെ ഡിജിറ്റൽ വിശ്വാസ കേന്ദ്രം', dashboardSubtitle: 'വിശ്വസിക്കുന്നതിന് മുമ്പ് നിങ്ങൾ കാണുന്നത് മനസ്സിലാക്കുക.', scanNow: 'വെബ്‌സൈറ്റ് വിശകലനം ചെയ്യുക', urlPlaceholder: 'പൂർണ്ണ വെബ്‌സൈറ്റ് URL നൽകുക (https://…)', recent: 'സമീപകാല പ്രവർത്തനം', quickTools: 'ദ്രുത പരിശോധന ഉപകരണങ്ങൾ', learningTip: 'വൃത്തിയായ പരിശോധന സുരക്ഷയുടെ ഉറപ്പല്ല.',
    analyse: 'പ്രാദേശികമായി വിശകലനം ചെയ്യുക', clear: 'മായ്ക്കുക', paste: 'ഒട്ടിക്കുക', saveReport: 'റിപ്പോർട്ട് സംരക്ഷിക്കുക', download: 'റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക', share: 'പങ്കിടുക', clearData: 'പ്രാദേശിക ഡാറ്റ മായ്ക്കുക', noResults: 'ഇപ്പോൾ ഒന്നും കാണിക്കാനില്ല', unavailable: 'ക്രമീകരിച്ചിട്ടില്ല', localOnly: 'ഈ ബ്രൗസറിൽ മാത്രം പ്രോസസ് ചെയ്യുന്നു', sourceCoverage: 'പരിശോധന പരിധിയും പരിമിതികളും', findings: 'കണ്ടെത്തലുകൾ', nextSteps: 'ശുപാർശ ചെയ്യുന്ന അടുത്ത ഘട്ടങ്ങൾ', runCheck: 'പരിശോധന നടത്തുക', addEvidence: 'ഉറവിടം ചേർക്കുക', settingsTitle: 'സ്വകാര്യതയും മുൻഗണനകളും',
  },
  hi: {
    overview: 'अवलोकन', scanner: 'वेबसाइट स्कैनर', claims: 'दावा जाँच', image: 'छवि सत्यापन', video: 'वीडियो जागरूकता', messages: 'संदेश जाँच', review: 'API सुरक्षा समीक्षा', threats: 'खतरा जानकारी', learning: 'साइबर शिक्षण लैब', history: 'स्कैन इतिहास', reports: 'सहेजी गई रिपोर्ट', settings: 'सेटिंग्स', account: 'खाता',
    search: 'टूल, संसाधन, रिपोर्ट खोजें…', help: 'सहायता केंद्र', notifications: 'सूचनाएँ', verify: 'भरोसा करने से पहले जाँचें', privacy: 'गोपनीयता पहले',
    dashboardTitle: 'आपका डिजिटल भरोसा केंद्र', dashboardSubtitle: 'भरोसा करने से पहले समझें कि आप क्या देख रहे हैं।', scanNow: 'वेबसाइट का विश्लेषण करें', urlPlaceholder: 'पूरा वेबसाइट URL डालें (https://…)', recent: 'हाल की गतिविधि', quickTools: 'त्वरित सत्यापन टूल', learningTip: 'स्वच्छ जाँच सुरक्षा की गारंटी नहीं है।',
    analyse: 'स्थानीय रूप से विश्लेषण करें', clear: 'साफ़ करें', paste: 'चिपकाएँ', saveReport: 'रिपोर्ट सहेजें', download: 'रिपोर्ट डाउनलोड करें', share: 'साझा करें', clearData: 'स्थानीय डेटा साफ़ करें', noResults: 'अभी दिखाने के लिए कुछ नहीं', unavailable: 'कॉन्फ़िगर नहीं है', localOnly: 'केवल इस ब्राउज़र में संसाधित', sourceCoverage: 'जाँच का दायरा और सीमाएँ', findings: 'निष्कर्ष', nextSteps: 'सुझाए गए अगले कदम', runCheck: 'जाँच चलाएँ', addEvidence: 'स्रोत जोड़ें', settingsTitle: 'गोपनीयता और प्राथमिकताएँ',
  },
};

export function t(language: Language, key: string): string {
  return copy[language]?.[key] ?? copy.en[key] ?? key;
}
