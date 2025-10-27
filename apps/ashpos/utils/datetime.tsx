'use client'

import { Timezones } from "@/src/__generated__/operations";
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { parseISO, format } from "date-fns";
import * as tzModule from "date-fns-tz";

// const zonedTimeToUtc: ((date: Date | number, tz: string) => Date) | undefined =
//   // named export
//   (tzModule as any).zonedTimeToUtc ??
//   // default export containing function
//   (tzModule as any).default?.zonedTimeToUtc ??
//   // some builds expose under .default.default
//   (tzModule as any).default?.default?.zonedTimeToUtc ??
//   undefined;

// if (!zonedTimeToUtc) {
//   throw new Error(
//     "zonedTimeToUtc not found on date-fns-tz import. Check your date-fns-tz version and module system."
//   );
// }

import Moment from 'moment';

 // Map our timezone enum to IANA timezone names
export const timezoneMap: Record<Timezones, string> = {
    'AKST': 'America/Anchorage',    // Alaska
    'CST': 'America/Chicago',       // Central
    'EST': 'America/New_York',      // Eastern
    'HAST': 'Pacific/Honolulu',     // Hawaii
    'MST': 'America/Denver',        // Mountain
    'PST': 'America/Los_Angeles'    // Pacific
};

export function convertPSTTimestampToTimezone(timestamp: string | number | Date | undefined, targetTimezone: Timezones): string {
    // Handle empty input
    if (!timestamp) return "";

    // console.log("targetTimezone", targetTimezone)
    
    // Create a date object from the UTC timestamp
    const utcDate = new Date(timestamp);
    
    // Validate date
    if (isNaN(utcDate.getTime())) {
        // console.error('Invalid date provided to convertPSTTimestampToTimezone');
        return "";
    }
    const targetTz = timezoneMap[targetTimezone];
    if (!targetTz) {
        // console.error(`Invalid timezone provided: ${targetTimezone}`);
        return "";
    }

    // Format the date in the target timezone, automatically handling DST
    return formatInTimeZone(utcDate, targetTz, 'MM/dd/yyyy - hh:mm a');
}

export const convertLocalTimetoUTCTimezone = (
  timestamp: string,
  inputTimeZone?: Timezones
): string => {
  if (!timestamp || typeof timestamp !== "string") return "";

  const parts = timestamp.trim().split(" ");
  if (parts.length !== 2) return "";

  const [datePart, timePart] = parts;

  // Normalize time: if HH:mm -> add :00; if HH:mm:ss -> leave as-is
  const timeSegments = timePart.split(":");
  if (timeSegments.length !== 2 && timeSegments.length !== 3) return "";

  const timeIso = timeSegments.length === 3 ? timePart : `${timePart}:00`;

  // Build valid ISO string (without timezone suffix)
  const iso = `${datePart}T${timeIso}`;

  const parsed = parseISO(iso);
  if (isNaN(parsed.getTime())) {
    console.error("Invalid local timestamp:", iso);
    return "";
  }

  const timezone =
    inputTimeZone !== undefined
      ? timezoneMap[inputTimeZone]
      : Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!timezone) {
    console.error("Could not resolve timezone");
    return "";
  }

  const utcDate = zonedTimeToUtc(parsed, timezone);
  if (isNaN(utcDate.getTime())) {
    console.error("Invalid UTC date conversion for:", iso, timezone);
    return "";
  }

  // ✅ Return ISO-8601 string in UTC
  return utcDate.toISOString();
};


export const convertUTCTimeToLocalTimezone = (timestamp: string | number | Date | undefined, timezone: Timezones) => {
    if (!timestamp) return "";
    const utcDate = new Date(timestamp);
    return formatInTimeZone(utcDate, timezoneMap[timezone], 'MM/dd/yyyy - hh:mm a');
}


export const formatFullDateFns = (isoDateString: any) => {
    const date = new Date(isoDateString);

    // Get components of the date
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    // Get hours and minutes
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Determine AM/PM suffix
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12; // Convert to 12-hour format
    hours = hours ? hours : 12; // The hour '0' should be '12'

    // Format the date
    return `${month}/${day}/${year} - ${hours}:${minutes} ${ampm}`;
};

// Get current time in CST
export const getCurrentTimeByTimezone = (timezone: Timezones) => {
    const now = new Date();
    return formatInTimeZone(now, timezoneMap[timezone], 'MM/dd/yyyy - hh:mm a');
};


export const getCurrentDateByTimezone = (timezone: Timezones) => {
    const now = new Date();
    return formatInTimeZone(now, timezoneMap[timezone], 'MM/dd/yyyy');
};


// Wed May 07 2025 00:00:00 GMT-0300 (Brasilia Standard Time) to Y-M-D
export const formatDate = (date: Date, format?: string ) => {
    if (date == null || date == undefined) return "";
    return Moment(date).format(format ? format : 'YYYY-MM-DD');
}

export const formatDateTime = (date: Date, format?: string ) => {
    if (date == null || date == undefined) return "";
    return Moment(date).format(format ? format : 'YYYY-MM-DD HH:mm:ss');
}