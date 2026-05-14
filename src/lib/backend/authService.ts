import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "@/utils/firebaseConfig";

const DEFAULT_ADMIN_EMAIL = "admin@delucefood.com";
const DEFAULT_ADMIN_PASSWORD = "DeluceFood@2024";

export async function seedDefaultAdmin(): Promise<void> {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  
  console.log("Checking for default admin user...");
  
  try {
    // Try to sign in first
    await signInWithEmailAndPassword(auth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
    console.log("✅ Default admin user already logged in");
    return;
  } catch (signInError: any) {
    if (signInError.code === "auth/user-not-found") {
      console.log("Admin user not found, creating new user...");
    } else if (signInError.code !== "auth/invalid-credential") {
      console.error("Sign in error:", signInError.code, signInError.message);
      return;
    }
  }
  
  try {
    console.log("Creating new admin user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      DEFAULT_ADMIN_EMAIL, 
      DEFAULT_ADMIN_PASSWORD
    );
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: DEFAULT_ADMIN_EMAIL,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    
    console.log("✅ Default admin user created and logged in!");
  } catch (createError: any) {
    console.error("Error creating admin user:", createError.code, createError.message);
  }
}

export function getDefaultCredentials() {
  return { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD };
}