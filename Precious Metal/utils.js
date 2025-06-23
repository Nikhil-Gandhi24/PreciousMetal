// Utility Functions

/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, showSymbol = true) {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(amount)
}

/**
 * Format date and time in Indian format
 * @param {Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
function formatDateTime(date, includeTime = true) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }

  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
    options.second = "2-digit"
    options.hour12 = true
  }

  return new Intl.DateTimeFormat("en-IN", options).format(date)
}

/**
 * Generate random price fluctuation
 * @param {number} basePrice - Base price
 * @param {number} maxFluctuation - Maximum fluctuation amount
 * @returns {number} New price after fluctuation
 */
function generatePriceFluctuation(basePrice, maxFluctuation) {
  const fluctuation = (Math.random() - 0.5) * 2 * maxFluctuation
  return Math.max(0, basePrice + fluctuation)
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Validate form field
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to validate
 * @param {object} CONFIG - Configuration object containing validation rules
 * @returns {object} Validation result
 */
function validateField(fieldName, value, CONFIG) {
  const rules = CONFIG.validation[fieldName]
  if (!rules) return { isValid: true, error: "" }

  switch (fieldName) {
    case "name":
      if (value.length < rules.minLength) {
        return { isValid: false, error: `Name must be at least ${rules.minLength} characters` }
      }
      if (value.length > rules.maxLength) {
        return { isValid: false, error: `Name must not exceed ${rules.maxLength} characters` }
      }
      if (!rules.pattern.test(value)) {
        return { isValid: false, error: "Name can only contain letters and spaces" }
      }
      break

    case "phone":
      if (!rules.pattern.test(value)) {
        return { isValid: false, error: "Please enter a valid 10-digit Indian mobile number" }
      }
      break

    case "email":
      if (!rules.pattern.test(value)) {
        return { isValid: false, error: "Please enter a valid email address" }
      }
      break

    case "quantity":
      const numValue = Number.parseFloat(value)
      if (isNaN(numValue) || numValue < rules.min) {
        return { isValid: false, error: `Quantity must be at least ${rules.min}` }
      }
      break
  }

  return { isValid: true, error: "" }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments

    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type of toast (success, error, info)
 * @param {object} CONFIG - Configuration object containing ui settings
 */
function showToast(message, type = "info", CONFIG) {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message

  // Add styles
  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 24px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    zIndex: "10000",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    maxWidth: "300px",
    wordWrap: "break-word",
  })

  // Set background color based on type
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b",
  }
  toast.style.backgroundColor = colors[type] || colors.info

  // Add to DOM
  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)"
  }, 100)

  // Remove after duration
  setTimeout(() => {
    toast.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, CONFIG.ui.toastDuration)
}

/**
 * Generate unique booking ID
 * @returns {string} Unique booking ID
 */
function generateBookingId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `PM${timestamp}${randomStr}`.toUpperCase()
}

/**
 * Calculate total booking value
 * @param {string} metalType - Type of metal (Gold/Silver)
 * @param {number} quantity - Quantity to book
 * @param {number} currentPrice - Current price per unit
 * @returns {object} Calculation details
 */
function calculateBookingValue(metalType, quantity, currentPrice) {
  let pricePerGram, totalValue, unit

  if (metalType === "Gold") {
    // Gold price is per 10 grams, convert to per gram
    pricePerGram = currentPrice / 10
    totalValue = pricePerGram * quantity
    unit = "grams"
  } else {
    // Silver price is per kg, convert to per gram
    pricePerGram = currentPrice / 1000
    totalValue = pricePerGram * quantity
    unit = "grams"
  }

  return {
    pricePerGram: Math.round(pricePerGram * 100) / 100,
    totalValue: Math.round(totalValue),
    unit,
    quantity,
  }
}

/**
 * Local storage helper functions
 */
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn("Failed to save to localStorage:", e)
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (e) {
      console.warn("Failed to read from localStorage:", e)
      return defaultValue
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn("Failed to remove from localStorage:", e)
    }
  },
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
  return window.innerWidth <= 768
}

/**
 * Smooth scroll to element
 * @param {string} elementId - ID of element to scroll to
 */
function scrollToElement(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

// Export for ES6 modules
export {
  formatCurrency,
  formatDateTime,
  generatePriceFluctuation,
  calculatePercentageChange,
  validateField,
  debounce,
  throttle,
  showToast,
  generateBookingId,
  calculateBookingValue,
  storage,
  isMobile,
  scrollToElement,
}

// Also support CommonJS for compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    formatCurrency,
    formatDateTime,
    generatePriceFluctuation,
    calculatePercentageChange,
    validateField,
    debounce,
    throttle,
    showToast,
    generateBookingId,
    calculateBookingValue,
    storage,
    isMobile,
    scrollToElement,
  }
}
