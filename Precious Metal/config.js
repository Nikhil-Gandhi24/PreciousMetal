// Application Configuration
const CONFIG = {
  // API Configuration
  api: {
    baseUrl: "https://api.preciousmetalspro.in",
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Price Update Configuration
  priceUpdate: {
    interval: 30000, // 30 seconds
    maxFluctuation: {
      gold: 50, // ±₹50 per update
      silver: 100, // ±₹100 per update
    },
  },

  // Initial Rates (Indian Market)
  initialRates: {
    gold: {
      price: 63450, // ₹ per 10 grams
      change: 340,
      changePercent: 0.54,
      low: 63120,
      high: 63580,
      unit: "10g",
      purity: "24K",
    },
    silver: {
      price: 77850, // ₹ per kg
      change: -180,
      changePercent: -0.23,
      low: 77650,
      high: 78120,
      unit: "kg",
      purity: "999",
    },
  },

  // Business Configuration
  business: {
    name: "PreciousMetals Pro",
    email: "support@preciousmetalspro.in",
    phone: "+91 12345 67890",
    address: "Mumbai, Maharashtra, India",
    workingHours: {
      weekdays: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed",
    },
  },

  // Form Validation Rules
  validation: {
    name: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
    },
    phone: {
      pattern: /^[6-9]\d{9}$/,
      length: 10,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    quantity: {
      min: 1,
      max: {
        gold: 1000, // grams
        silver: 100, // kg
      },
    },
  },

  // UI Configuration
  ui: {
    loadingDuration: 2000,
    animationDuration: 300,
    toastDuration: 5000,
  },

  // Currency Configuration
  currency: {
    symbol: "₹",
    code: "INR",
    locale: "en-IN",
  },
}

// Export for ES6 modules
export { CONFIG }

// Also support CommonJS for compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG
}
