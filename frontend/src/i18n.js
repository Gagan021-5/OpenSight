import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      landing: {
        title: "Vision therapy,",
        gamified: "reimagined.",
        subtitle: "Professional-grade exercises for Amblyopia, Strabismus, and Convergence Insufficiency—now in your browser.",
        getStarted: "Get Started",
        signIn: "Sign In",
        games: "Gamified Therapy",
        gamesDesc: "Engaging games designed to improve visual acuity and binocular vision.",
        logic: "Clinical Logic",
        logicDesc: "Based on proven optometric principles for effective home therapy.",
        progress: "Track Progress",
        progressDesc: "Monitor improvement with detailed analytics and performance charts."
      },
      dashboard: {
        welcome: "Welcome back",
        subtitle: "Your vision therapy journey continues. Today is a great day to improve!",
        games: "Recommended Exercises"
      }
    }
  },
  hi: {
    translation: {
      landing: {
        title: "दृष्टि चिकित्सा,",
        gamified: "नये रूप में।",
        subtitle: "एम्ब्लोपिया, स्ट्रैबिस्मस और कन्वर्जेंस अपर्याप्तता के लिए पेशेवर अभ्यास—अब आपके ब्राउज़र में।",
        getStarted: "शुरू करें",
        signIn: "साइन इन करें",
        games: "गेमिफाइड थेरेपी",
        gamesDesc: "दृश्य तीक्ष्णता और द्विनेत्री दृष्टि में सुधार के लिए डिज़ाइन किए गए आकर्षक खेल।",
        logic: "नैदानिक तर्क",
        logicDesc: "प्रभावी घरेलू चिकित्सा के लिए सिद्ध ऑप्टोमेट्रिक सिद्धांतों पर आधारित।",
        progress: "प्रगति ट्रैक करें",
        progressDesc: "विस्तृत विश्लेषण और प्रदर्शन चार्ट के साथ सुधार की निगरानी करें।"
      },
      dashboard: {
        welcome: "वापसी पर स्वागत है",
        subtitle: "आपकी दृष्टि चिकित्सा यात्रा जारी है। आज सुधार करने का एक बहुत अच्छा दिन है!",
        games: "अनुशंसित अभ्यास"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
