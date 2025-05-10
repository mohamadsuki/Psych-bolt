/// <reference types="vite/client" />

// Add HTML input date type enhancements for proper date format handling
interface HTMLInputElement {
  // Override the value property to ensure dates are properly handled in DD/MM/YYYY format
  valueAsDate?: Date | null;
}