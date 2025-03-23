'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!validateEmail(email)) {
    return { error: 'invalid_email' };
  }

  if (!validatePassword(password)) {
    return { error: 'invalid_password_format' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    switch (error.code) {
      case 'invalid_credentials':
        return { error: 'invalid_credentials' };

      case 'email_not_confirmed':
        return { error: 'email_not_confirmed' };

      default:
        return { error: 'unexpected_error' };
    }
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!validateEmail(email)) {
    return { error: 'invalid_email' };
  }

  if (!validatePassword(password)) {
    return { error: 'weak_password' };
  }


  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    switch (error.code) {
      case 'email_address_invalid':
      case 'validation_failed':
        return { error: 'invalid_email' };

      case 'weak_password':
        return { error: 'weak_password' };

      case 'signup_disabled':
        return { error: 'signup_disabled' };

      default:
        return { error: 'unexpected_error' };
    }
  }

  
  if (data.user && data.user.identities && data.user.identities.length === 0) {
   
    return { error: 'email_exists' };
  }

  revalidatePath('/', 'layout');
  redirect('/login?signupSuccess=true');
}


function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
}