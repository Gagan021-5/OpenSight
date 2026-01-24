import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      landing: {
        title: 'Vision Therapy',
        gamified: 'Reimagined.',
        subtitle: 'Clinically inspired vision exercises transformed into browser games.',
        getStarted: 'Get started',
        signIn: 'Sign in',
        games: 'Gamified Therapy',
        gamesDesc: 'Games designed to target common vision conditions.',
        logic: 'Dichoptic Logic',
        logicDesc: 'Red/Blue methods to isolate and train the weak eye.',
        progress: 'Progress Tracking',
        progressDesc: 'Track sessions and improvements over time.',
      },
    },
  },
  hi: {
    translation: {
      landing: {
        title: 'दृष्टि चिकित्सा',
        gamified: 'पुनर्परिभाषित।',
        subtitle: 'क्लिनिकल रूप से प्रेरित दृष्टि व्यायाम जो ब्राउज़र गेम्स में बदल दिए गए हैं।',
        getStarted: 'शुरू करें',
        signIn: 'साइन इन करें',
        games: 'गेमिफाइड थेरेपी',
        gamesDesc: 'आम दृष्टि स्थितियों को लक्षित करने वाले गेम।',
        logic: 'डायकॉप्टिक तर्क',
        logicDesc: 'कमज़ोर आँख को अलग करने और प्रशिक्षित करने के लिए लाल/नीली विधियाँ।',
        progress: 'प्रगति ट्रैकिंग',
        progressDesc: 'सत्रों और सुधारों को समय के साथ ट्रैक करें।',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
