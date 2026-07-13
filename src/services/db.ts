import { Quote, AppSettings } from '../types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// Default system settings
const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'CC Links Construction Ltd',
  companyAddress: 'Unit 12, Industrial Way, London, EC1A 1BB',
  companyEmail: 'estimates@cclinks.co.uk',
  companyPhone: '+44 (0) 20 7946 0192',
  defaultOverheadPercent: 5,
  defaultProfitPercent: 10,
  defaultVatPercent: 20,
  defaultTermsAndConditions: `1. Validity of Quotation: This quotation is valid for a period of 30 days from the date of issue.
2. Payment Terms: Payments shall be made in stages as outlined in the Payment Schedule. Each milestone invoice is payable within 7 days of issue.
3. Access & Utilities: The client shall provide unrestricted access to the site during agreed working hours and provide water and electricity free of charge.
4. Variations: Any changes, additions or deletions to the scope of works described in this document will be costed separately and agreed in writing before works commence.
5. Practical Completion: Practical completion will be certified upon substantial completion of the listed works, at which stage the final balance is payable.`,
  useFirebase: false,
};

// Helper to check if Firebase is fully configured
function getFirebaseAppInstance(settings: AppSettings) {
  if (!settings.useFirebase || !settings.firebaseConfig || !settings.firebaseConfig.apiKey) {
    return null;
  }
  try {
    if (getApps().length > 0) {
      return getApp();
    }
    return initializeApp(settings.firebaseConfig);
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
    return null;
  }
}

// LocalStorage helpers
const LS_KEYS = {
  SETTINGS: 'cclinks_settings',
  QUOTES: 'cclinks_quotes',
};

export const dbService = {
  // --- Settings Management ---
  getSettings(): AppSettings {
    const raw = localStorage.getItem(LS_KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- Quotes Management ---
  async getQuotes(): Promise<Quote[]> {
    const settings = this.getSettings();
    const app = getFirebaseAppInstance(settings);

    if (app) {
      try {
        const firestore = getFirestore(app);
        const colRef = collection(firestore, 'quotes');
        const snapshot = await getDocs(colRef);
        const quotesList: Quote[] = [];
        snapshot.forEach((doc) => {
          quotesList.push(doc.data() as Quote);
        });
        // Sort by createdAt desc
        return quotesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        console.error("Firestore read error, falling back to LocalStorage:", err);
      }
    }

    // Local Storage Fallback
    const raw = localStorage.getItem(LS_KEYS.QUOTES);
    if (!raw) return [];
    try {
      const quotes: Quote[] = JSON.parse(raw);
      return quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  async getQuote(id: string): Promise<Quote | null> {
    const settings = this.getSettings();
    const app = getFirebaseAppInstance(settings);

    if (app) {
      try {
        const firestore = getFirestore(app);
        const docRef = doc(firestore, 'quotes', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return snapshot.data() as Quote;
        }
      } catch (err) {
        console.error("Firestore read error, falling back to LocalStorage:", err);
      }
    }

    // Local Storage Fallback
    const quotes = await this.getQuotes();
    return quotes.find(q => q.id === id) || null;
  },

  async saveQuote(quote: Quote): Promise<void> {
    const settings = this.getSettings();
    const app = getFirebaseAppInstance(settings);

    if (app) {
      try {
        const firestore = getFirestore(app);
        const docRef = doc(firestore, 'quotes', quote.id);
        await setDoc(docRef, quote);
        // Also sync locally so list loads faster
      } catch (err) {
        console.error("Firestore write error, saving locally only:", err);
      }
    }

    // Local Storage Sync/Save
    const quotes = await this.getQuotes();
    const index = quotes.findIndex(q => q.id === quote.id);
    if (index > -1) {
      quotes[index] = quote;
    } else {
      quotes.push(quote);
    }
    localStorage.setItem(LS_KEYS.QUOTES, JSON.stringify(quotes));
  },

  async deleteQuote(id: string): Promise<void> {
    const settings = this.getSettings();
    const app = getFirebaseAppInstance(settings);

    if (app) {
      try {
        const firestore = getFirestore(app);
        const docRef = doc(firestore, 'quotes', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Firestore delete error, deleting locally only:", err);
      }
    }

    // Local Storage Sync/Delete
    const quotes = await this.getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    localStorage.setItem(LS_KEYS.QUOTES, JSON.stringify(filtered));
  },

  // --- PDF Storage Helper ---
  // Returns a promise that resolves with local object metadata and base64 preview string
  async uploadPDF(file: File, onProgress?: (pct: number) => void): Promise<{ fileName: string; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Simulate progress updates for premium feel
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress >= 100) {
          progress = 98;
        }
        if (onProgress) {
          onProgress(progress);
        }
      }, 100);

      reader.onload = () => {
        clearInterval(interval);
        if (onProgress) onProgress(100);

        resolve({
          fileName: file.name,
          dataUrl: reader.result as string
        });
      };

      reader.onerror = (err) => {
        clearInterval(interval);
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  }
};
