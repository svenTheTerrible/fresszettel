import { useState } from 'react';

/**
 * The `busy`/`error` state pair shared by submit-driven forms and buttons.
 * Keep it in one hook so every input surfaces the same loading + error states.
 */
export function useSubmitState() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return { busy, setBusy, error, setError };
}
