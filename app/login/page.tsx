


import { createClient } from "@supabase/supabase-js";

import { login, signUp } from './actions'
import { register } from "module";

// Typy pro stav komponenty
type AuthMessage = {
  type: "success" | "error";
  text: string;
};

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function LoginPage() {
 






 

  return (
    

    <div>
     
     <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={signUp}>Sign up</button>
    </form>
      
   
    </div>

   
  );
}