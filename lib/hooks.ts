'use client';

import { useCallback, useState, useTransition } from 'react';

export function useActionState<State, Data>(
  action: (prevState: State, data: Data) => Promise<State>,
  initialState: State
) {
  const [state, setState] = useState<State>(initialState);
  const [isPending, startTransition] = useTransition();

  const formAction = useCallback(
    (data: Data) => {
      startTransition(async () => {
        const result = await action(state, data);
        setState(result);
      });
    },
    [action, state]
  );

  return [state, formAction] as const;
}