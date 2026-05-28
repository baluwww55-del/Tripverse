import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserPreferences, SavedTrip, ChatMessage } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore with specific Database ID
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider setup with requested Workspace scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/chat');

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

// Observe auth state changes to synchronize in-memory caches
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

// Sign in with Google Popup
export async function signInWithGoogle() {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return result.user;
  } catch (error) {
    console.error("Google Popup Auth failed:", error);
    cachedAccessToken = null;
    throw error;
  } finally {
    isSigningIn = false;
  }
}

// Log Out
export async function logoutUser() {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error("Sign Out failed:", error);
    throw error;
  }
}

// Ensure database entry for user exists
export async function ensureUserProfile(uid: string, email: string, name: string): Promise<UserPreferences> {
  const userDocRef = doc(db, 'users', uid);
  const snap = await getDoc(userDocRef);
  
  if (snap.exists()) {
    return snap.data() as UserPreferences;
  } else {
    // Generate new initial preferences for this Google account
    const initialPrefs: UserPreferences = {
      name: name || "India Explorer",
      email: email,
      budgetLevel: "moderate",
      travelStyle: ["culture", "relax", "foodie"],
      dietary: "any",
      preferredActivityLevel: "medium"
    };
    await setDoc(userDocRef, initialPrefs);
    return initialPrefs;
  }
}

// Update User Preferences
export async function updateUserPreferencesInDb(uid: string, prefs: UserPreferences) {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, prefs, { merge: true });
}

// Save or Update a Trip Itinerary
export async function saveTripToDb(uid: string, trip: SavedTrip) {
  const tripRef = doc(db, 'users', uid, 'trips', trip.id);
  // Clean trip payload to prevent undefined fields in firestore
  const cleanTrip = JSON.parse(JSON.stringify(trip));
  await setDoc(tripRef, cleanTrip);
}

// Delete a Saved Trip Itinerary
export async function deleteTripFromDb(uid: string, tripId: string) {
  const tripRef = doc(db, 'users', uid, 'trips', tripId);
  await deleteDoc(tripRef);
}

// Add a Chat Message log
export async function addChatMessageToDb(uid: string, msg: ChatMessage) {
  const chatRef = doc(db, 'users', uid, 'chats', msg.id);
  const cleanMsg = JSON.parse(JSON.stringify(msg));
  await setDoc(chatRef, cleanMsg);
}

// Real-time listener for Preferences
export function subscribeToPreferences(uid: string, callback: (prefs: UserPreferences) => void) {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserPreferences);
    }
  });
}

// Real-time listener for Saved Trips
export function subscribeToSavedTrips(uid: string, callback: (trips: SavedTrip[]) => void) {
  const tripsCollRef = collection(db, 'users', uid, 'trips');
  return onSnapshot(tripsCollRef, (querySnap) => {
    const list: SavedTrip[] = [];
    querySnap.forEach((doc) => {
      list.push(doc.data() as SavedTrip);
    });
    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  });
}

// Real-time listener for Concierge Chat
export function subscribeToChatHistory(uid: string, callback: (msgs: ChatMessage[]) => void) {
  const chatsCollRef = collection(db, 'users', uid, 'chats');
  return onSnapshot(chatsCollRef, (querySnap) => {
    const list: ChatMessage[] = [];
    querySnap.forEach((doc) => {
      list.push(doc.data() as ChatMessage);
    });
    // Sort by timestamp chronological
    list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    callback(list);
  });
}

// Wipe chat history
export async function clearChatHistoryInDb(uid: string) {
  const chatsCollRef = collection(db, 'users', uid, 'chats');
  const snap = await getDocs(chatsCollRef);
  const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  // Re-seed welcome message
  const welcomeMsg: ChatMessage = {
    id: 'welcome-1',
    sender: 'ai',
    text: "Namaste! Welcome back to Tripverse. How can I assist you with your Indian journeys today?",
    timestamp: new Date().toISOString()
  };
  await addChatMessageToDb(uid, welcomeMsg);
}
