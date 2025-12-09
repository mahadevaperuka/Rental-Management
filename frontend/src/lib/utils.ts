import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date | undefined | null): string {
    if (!dateString) return "N/A"
    // Create date object
    const date = new Date(dateString)
    // Check if valid date
    if (isNaN(date.getTime())) return "Invalid Date"

    // Format using UTC to prevent timezone shifts
    return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "short", // or "long" or "numeric"
        day: "numeric"
    })
}
