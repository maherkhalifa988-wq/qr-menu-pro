import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

export async function signInWithPasscode(passcode: string) {
  const f = getFunctions(app);
  const login: any = httpsCallable(f, 'loginWithPasscode');
  const res = await login({ passcode });
  const token = res.data.token as string;
  const role = res.data.role as 'admin' | 'editor';

  const auth = getAuth(app);
  await signInWithCustomToken(auth, token);
  return role;
}
