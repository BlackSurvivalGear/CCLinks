import { useState, useEffect, useCallback } from 'react';
import { Quote, AppSettings } from '../types';
import { dbService } from '../services/db';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [settings, setSettings] = useState<AppSettings>(dbService.getSettings());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await dbService.getQuotes();
      setQuotes(list);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshQuotes();
  }, [refreshQuotes]);

  const saveQuote = useCallback(async (quote: Quote) => {
    setError(null);
    try {
      await dbService.saveQuote(quote);
      await refreshQuotes();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save quote');
      throw err;
    }
  }, [refreshQuotes]);

  const deleteQuote = useCallback(async (id: string) => {
    setError(null);
    try {
      await dbService.deleteQuote(id);
      await refreshQuotes();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to delete quote');
      throw err;
    }
  }, [refreshQuotes]);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    dbService.saveSettings(newSettings);
    setSettings(newSettings);
    // Refresh quotes because toggling firebase settings changes where we load from
    refreshQuotes();
  }, [refreshQuotes]);

  return {
    quotes,
    settings,
    loading,
    error,
    refreshQuotes,
    saveQuote,
    deleteQuote,
    updateSettings,
  };
}
