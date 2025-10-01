import { useEffect, useState } from 'react';
import api from '@/services/api';

// In-memory cache: slug -> ingredients array
const INGREDIENTS_CACHE = {};

export default function useProductIngredients(slug) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!slug) {
        setIngredients([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        if (INGREDIENTS_CACHE[slug]) {
          if (mounted) setIngredients(INGREDIENTS_CACHE[slug]);
          return;
        }
        // getProduct accepts slug or id
        const res = await api.getProduct(slug);
        const ing = res?.data?.ingredients || [];
        INGREDIENTS_CACHE[slug] = ing;
        if (mounted) setIngredients(ing);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load ingredients');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [slug]);

  return { ingredients, loading, error };
}
