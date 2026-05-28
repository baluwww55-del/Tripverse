import { getCachedAccessToken } from './firebase';
import { Activity } from './types';

// Converts date "YYYY-MM-DD" and time "HH:MM AM/PM" to ISO 8601 date string
export function convertTimeToDateTime(dateStr: string, timeStr: string): string {
  try {
    const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    let hours = 10;
    let minutes = 0;
    
    if (match) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      // Fallback parse digits
      const digits = timeStr.replace(/[^0-9]/g, '');
      if (digits.length >= 2) {
        hours = parseInt(digits.slice(0, 2)) % 24;
      }
    }
    
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${dateStr}T${hh}:${mm}:00`;
  } catch (err) {
    return `${dateStr}T12:00:00`;
  }
}

// Google Calendar: Add individual activity as calendar event
export async function addActivityToCalendar(
  dateStr: string,
  activity: Activity,
  destination: string
): Promise<{ success: boolean; eventId?: string; message: string }> {
  const token = getCachedAccessToken();
  if (!token) {
    return {
      success: false,
      message: "Google Workspace session not discovered. Please re-authenticate using 'Sign-In with Google Workspace' to link your Google Calendar."
    };
  }

  // Ask for consent before mutating user data as mandated by security guidelines
  const confirmResult = window.confirm(
    `Confirm Google Calendar Action:\n\nDo you authorize Tripverse to publish this activity event to your primary Google Calendar?\n\n- Event: ${activity.title}\n- Destination: ${destination}\n- Date: ${dateStr} at ${activity.time}`
  );
  if (!confirmResult) {
    return { success: false, message: "Action cancelled by traveler." };
  }

  const startISO = convertTimeToDateTime(dateStr, activity.time);
  
  // Calculate end time (default 1.5 hours later)
  const startDate = new Date(startISO);
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
  const endISO = endDate.toISOString().split('.')[0]; // remove millis and 'Z' for timezone-bound matching

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: `Tripverse: ${activity.title} (${destination})`,
        location: activity.location || destination,
        description: `${activity.description}\n\n★ Local Rating: ${activity.rating || 4.5}/5.0\n★ Cost: $${activity.cost}\n\nPlan curated by Tripverse AI Premium Indian Tourism Companion.`,
        start: {
          dateTime: startISO,
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: endISO,
          timeZone: 'Asia/Kolkata'
        }
      })
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      console.error("Google Calendar API failed:", errorJson);
      return {
        success: false,
        message: `Google Calendar replied with error code: ${res.status}. Please make sure calendar permissions are accepted.`
      };
    }

    const eventData = await res.json();
    return {
      success: true,
      eventId: eventData.id,
      message: `Successfully synchronized event with your Google Calendar for ${activity.time}!`
    };
  } catch (error: any) {
    console.error("Google Calendar API call crash:", error);
    return {
      success: false,
      message: `Failed to connect with Google Calendar network: ${error.message || error}`
    };
  }
}

// Interface for Google Chat space
export interface GoogleChatSpace {
  name: string; // resource name, e.g. "spaces/ABCDE"
  displayName: string;
  type: string;
}

// Google Chat: Fetch list of conversational spaces/channels
export async function fetchGoogleChatSpaces(): Promise<{ success: boolean; spaces: GoogleChatSpace[]; message: string }> {
  const token = getCachedAccessToken();
  if (!token) {
    return {
      success: false,
      spaces: [],
      message: "Workspace credentials not found. Please log in utilizing 'Sign-In with Google Workspace'."
    };
  }

  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      console.error("Fetch spaces failed:", errRes);
      return {
        success: false,
        spaces: [],
        message: `Could not load Chat spaces: ${res.statusText || res.status}`
      };
    }

    const data = await res.json();
    return {
      success: true,
      spaces: data.spaces || [],
      message: "Chat spaces loaded successfully!"
    };
  } catch (error: any) {
    console.error("Fetch spaces network error:", error);
    return {
      success: false,
      spaces: [],
      message: `Failed to connect to Google Chat: ${error.message || error}`
    };
  }
}

// Google Chat: Share compiled trip details to a designated Chat Space
export async function shareItineraryToGoogleChat(
  spaceName: string,
  spaceLabel: string,
  destination: string,
  daysCount: number,
  budget: number
): Promise<{ success: boolean; message: string }> {
  const token = getCachedAccessToken();
  if (!token) {
    return {
      success: false,
      message: "Workspace session has expired."
    };
  }

  // Mandatory Traveler confirmation dialog before sending outgoing Chat message
  const consent = window.confirm(
    `Confirm Google Chat Action:\n\nDo you authorize Tripverse to send an automated travel card with your plan to Google Chat Space "${spaceLabel}"?`
  );
  if (!consent) {
    return { success: false, message: "Action aborted." };
  }

  try {
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: `✈️ *Tripverse AI Bespoke Indian Travel Itinerary* 🇮🇳\n\nI have formulated an amazing trip to *${destination}*!\n• *Duration:* ${daysCount} Days\n• *Estimated Budget Value:* INR ${budget.toLocaleString('en-IN')}\n\nPlan curated with precision by Tripverse Premium India Experience. Let's make this journey incredible!`
      })
    });

    if (!res.ok) {
      const errInfo = await res.json().catch(() => ({}));
      console.error("Google Chat publish message failed:", errInfo);
      return {
        success: false,
        message: `Google Chat replied with error status: ${res.status}.`
      };
    }

    return {
      success: true,
      message: `Successfully published travel itinerary details to Google Chat Space "${spaceLabel}"!`
    };
  } catch (error: any) {
    console.error("Google Chat publish error:", error);
    return {
      success: false,
      message: `Failed to publish to Google Chat: ${error.message || error}`
    };
  }
}
