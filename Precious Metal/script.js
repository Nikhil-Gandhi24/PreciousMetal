// Main Application Script

// All functions and CONFIG are available globally from other script files
// No imports needed since we're not using modules

// Global state
const CONFIG = {
  initialRates: {
    gold: {
      price: 99320, // Updated to today's live rate ₹99,320 per 10g
      change: 1250, // Simulated daily change
      changePercent: 1.28, // Calculated percentage
      high: 99580,
      low: 98950,
    },
    silver: {
      price: 106780, // Updated to today's live rate ₹106,780 per kg
      change: -890, // Simulated daily change
      changePercent: -0.83, // Calculated percentage
      high: 107450,
      low: 106320,
    },
  },
  ui: {
    loadingDuration: 1500,
  },
  priceUpdate: {
    interval: 5000,
    maxFluctuation: {
      gold: 50, // Reduced fluctuation for more realistic movement
      silver: 80,
    },
  },
  validation: {
    quantity: {
      max: {
        gold: 500,
        silver: 50,
      },
    },
  },
}

let currentRates = {
  gold: { ...CONFIG.initialRates.gold },
  silver: { ...CONFIG.initialRates.silver },
}

let priceUpdateInterval
let isMarketOpen = true

// DOM Elements
const elements = {
  loadingScreen: null,
  goldPrice: null,
  silverPrice: null,
  goldChange: null,
  silverChange: null,
  goldLow: null,
  goldHigh: null,
  silverLow: null,
  silverHigh: null,
  lastUpdateTime: null,
  headerLastUpdate: null,
  bookingModal: null,
  successModal: null,
  bookingForm: null,
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  initializeElements()
  showLoadingScreen()

  setTimeout(() => {
    hideLoadingScreen()
    initializeApp()
  }, CONFIG.ui.loadingDuration)
})

/**
 * Initialize DOM elements
 */
function initializeElements() {
  elements.loadingScreen = document.getElementById("loadingScreen")
  elements.goldPrice = document.getElementById("goldPrice")
  elements.silverPrice = document.getElementById("silverPrice")
  elements.goldChange = document.getElementById("goldChange")
  elements.silverChange = document.getElementById("silverChange")
  elements.goldLow = document.getElementById("goldLow")
  elements.goldHigh = document.getElementById("goldHigh")
  elements.silverLow = document.getElementById("silverLow")
  elements.silverHigh = document.getElementById("silverHigh")
  elements.lastUpdateTime = document.getElementById("lastUpdateTime")
  elements.headerLastUpdate = document.getElementById("headerLastUpdate")
  elements.bookingModal = document.getElementById("bookingModal")
  elements.successModal = document.getElementById("successModal")
  elements.bookingForm = document.getElementById("bookingForm")
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
  if (elements.loadingScreen) {
    elements.loadingScreen.classList.remove("hidden")
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  if (elements.loadingScreen) {
    elements.loadingScreen.classList.add("hidden")
    setTimeout(() => {
      elements.loadingScreen.style.display = "none"
    }, 500)
  }
}

/**
 * Initialize main application
 */
function initializeApp() {
  updatePriceDisplay()
  startPriceUpdates()
  initializeEventListeners()
  updateMarketStatus()

  // Load saved user preferences
  loadUserPreferences()

  console.log("PreciousMetals Pro initialized successfully")
}

/**
 * Start automatic price updates
 */
function startPriceUpdates() {
  // Update immediately
  updatePrices()

  // Set up interval for regular updates
  priceUpdateInterval = setInterval(() => {
    if (isMarketOpen) {
      updatePrices()
    }
  }, CONFIG.priceUpdate.interval)
}

/**
 * Update prices with simulated fluctuations
 */
function updatePrices() {
  try {
    // Generate new prices
    const oldGoldPrice = currentRates.gold.price
    const oldSilverPrice = currentRates.silver.price

    currentRates.gold.price = generatePriceFluctuation(currentRates.gold.price, CONFIG.priceUpdate.maxFluctuation.gold)

    currentRates.silver.price = generatePriceFluctuation(
      currentRates.silver.price,
      CONFIG.priceUpdate.maxFluctuation.silver,
    )

    // Calculate changes
    currentRates.gold.change = currentRates.gold.price - CONFIG.initialRates.gold.price
    currentRates.silver.change = currentRates.silver.price - CONFIG.initialRates.silver.price

    currentRates.gold.changePercent = calculatePercentageChange(CONFIG.initialRates.gold.price, currentRates.gold.price)

    currentRates.silver.changePercent = calculatePercentageChange(
      CONFIG.initialRates.silver.price,
      currentRates.silver.price,
    )

    // Update high/low values
    currentRates.gold.high = Math.max(currentRates.gold.high, currentRates.gold.price)
    currentRates.gold.low = Math.min(currentRates.gold.low, currentRates.gold.price)
    currentRates.silver.high = Math.max(currentRates.silver.high, currentRates.silver.price)
    currentRates.silver.low = Math.min(currentRates.silver.low, currentRates.silver.price)

    // Update display
    updatePriceDisplay()
    updateLastUpdateTime()

    // Save to localStorage
    storage.set("currentRates", currentRates)
  } catch (error) {
    console.error("Error updating prices:", error)
    showToast("Failed to update prices", "error")
  }
}

/**
 * Update price display in UI
 */
function updatePriceDisplay() {
  if (!elements.goldPrice || !elements.silverPrice) return

  // Update prices
  elements.goldPrice.textContent = formatCurrency(currentRates.gold.price, false)
  elements.silverPrice.textContent = formatCurrency(currentRates.silver.price, false)

  // Update changes
  updateChangeDisplay(elements.goldChange, currentRates.gold)
  updateChangeDisplay(elements.silverChange, currentRates.silver)

  // Update high/low values
  if (elements.goldHigh) elements.goldHigh.textContent = formatCurrency(currentRates.gold.high)
  if (elements.goldLow) elements.goldLow.textContent = formatCurrency(currentRates.gold.low)
  if (elements.silverHigh) elements.silverHigh.textContent = formatCurrency(currentRates.silver.high)
  if (elements.silverLow) elements.silverLow.textContent = formatCurrency(currentRates.silver.low)

  // Update metal type options in booking form
  updateBookingFormOptions()
}

/**
 * Update change display for a metal
 */
function updateChangeDisplay(element, rateData) {
  if (!element) return

  const changeValue = element.querySelector(".change-value")
  const changePercent = element.querySelector(".change-percent")

  if (changeValue && changePercent) {
    const sign = rateData.change >= 0 ? "+" : ""
    changeValue.textContent = `${sign}${formatCurrency(rateData.change)}`
    changePercent.textContent = `(${sign}${rateData.changePercent.toFixed(2)}%)`

    // Update classes
    element.className = `price-change ${rateData.change >= 0 ? "positive" : "negative"}`
  }
}

/**
 * Update last update time
 */
function updateLastUpdateTime() {
  const now = new Date()
  const timeString = formatDateTime(now)

  if (elements.lastUpdateTime) {
    elements.lastUpdateTime.textContent = timeString
  }

  if (elements.headerLastUpdate) {
    elements.headerLastUpdate.textContent = now.toLocaleTimeString("en-IN")
  }
}

/**
 * Update market status
 */
function updateMarketStatus() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  // Market is open Monday-Friday 9 AM to 6 PM, Saturday 10 AM to 4 PM
  isMarketOpen = (day >= 1 && day <= 5 && hour >= 9 && hour < 18) || (day === 6 && hour >= 10 && hour < 16)

  const statusElements = document.querySelectorAll(".status-indicator")
  const statusTexts = document.querySelectorAll(".market-status span:last-child")

  statusElements.forEach((el) => {
    el.className = `status-indicator ${isMarketOpen ? "active" : ""}`
  })

  statusTexts.forEach((el) => {
    el.textContent = isMarketOpen ? "Market Open" : "Market Closed"
  })
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Booking form submission
  if (elements.bookingForm) {
    elements.bookingForm.addEventListener("submit", handleBookingSubmission)
  }

  // Modal close events
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeBookingModal()
      closeSuccessModal()
    }
  })

  // Form field validation
  const formFields = ["fullName", "phone", "email", "quantity"]
  formFields.forEach((fieldName) => {
    const field = document.getElementById(fieldName)
    if (field) {
      field.addEventListener("blur", () => validateFormField(fieldName))
      field.addEventListener(
        "input",
        debounce(() => validateFormField(fieldName), 300),
      )
    }
  })

  // Quantity change for booking calculation
  const quantityField = document.getElementById("quantity")
  const metalTypeField = document.getElementById("metalType")

  if (quantityField && metalTypeField) {
    ;[quantityField, metalTypeField].forEach((field) => {
      field.addEventListener("change", updateBookingSummary)
      field.addEventListener("input", debounce(updateBookingSummary, 300))
    })
  }

  // Window visibility change
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Pause updates when tab is not visible
      if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval)
      }
    } else {
      // Resume updates when tab becomes visible
      startPriceUpdates()
    }
  })
}

/**
 * Open booking modal
 */
function openBookingModal(metalType) {
  if (!elements.bookingModal) return

  elements.bookingModal.classList.add("active")
  elements.bookingModal.style.display = "flex"
  document.body.style.overflow = "hidden"

  // Set metal type
  const metalTypeField = document.getElementById("metalType")
  if (metalTypeField) {
    metalTypeField.value = metalType
    updateBookingSummary()
  }

  // Focus first field
  setTimeout(() => {
    const firstField = document.getElementById("fullName")
    if (firstField) firstField.focus()
  }, 100)

  // Track modal opening
  console.log(`Booking modal opened for ${metalType}`)
}

/**
 * Close booking modal
 */
function closeBookingModal() {
  if (!elements.bookingModal) return

  elements.bookingModal.classList.remove("active")
  elements.bookingModal.style.display = "none"
  document.body.style.overflow = "auto"

  // Reset form
  if (elements.bookingForm) {
    elements.bookingForm.reset()
    clearFormErrors()
  }

  console.log("Booking modal closed")
}

/**
 * Handle booking form submission
 */
async function handleBookingSubmission(e) {
  e.preventDefault()

  const submitButton = document.getElementById("submitBooking")
  const buttonText = submitButton.querySelector(".btn-text")
  const buttonLoader = submitButton.querySelector(".btn-loader")

  try {
    // Show loading state
    submitButton.disabled = true
    buttonText.style.display = "none"
    buttonLoader.style.display = "block"

    // Validate form
    const formData = new FormData(elements.bookingForm)
    const validationResult = validateBookingForm(formData)

    if (!validationResult.isValid) {
      showFormErrors(validationResult.errors)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Process booking
    const bookingData = processBooking(formData)

    // Show success
    showBookingSuccess(bookingData)
    closeBookingModal()

    // Save booking to localStorage
    saveBooking(bookingData)

    showToast("Booking confirmed successfully!", "success")
  } catch (error) {
    console.error("Booking submission error:", error)
    showToast("Failed to process booking. Please try again.", "error")
  } finally {
    // Reset button state
    submitButton.disabled = false
    buttonText.style.display = "block"
    buttonLoader.style.display = "none"
  }
}

/**
 * Validate booking form
 */
function validateBookingForm(formData) {
  const errors = {}
  let isValid = true

  // Validate each field
  const fields = ["fullName", "phone", "email", "metalType", "quantity"]

  fields.forEach((fieldName) => {
    const value = formData.get(fieldName)?.toString().trim() || ""

    if (!value) {
      errors[fieldName] = "This field is required"
      isValid = false
      return
    }

    const validation = validateField(fieldName === "fullName" ? "name" : fieldName, value)
    if (!validation.isValid) {
      errors[fieldName] = validation.error
      isValid = false
    }
  })

  // Additional quantity validation based on metal type
  const metalType = formData.get("metalType")
  const quantity = Number.parseFloat(formData.get("quantity"))

  if (metalType && quantity) {
    const maxQuantity = CONFIG.validation.quantity.max[metalType.toLowerCase()]
    if (quantity > maxQuantity) {
      errors.quantity = `Maximum quantity for ${metalType} is ${maxQuantity} ${metalType === "Gold" ? "grams" : "kg"}`
      isValid = false
    }
  }

  return { isValid, errors }
}

/**
 * Show form validation errors
 */
function showFormErrors(errors) {
  Object.keys(errors).forEach((fieldName) => {
    const errorElement = document.getElementById(`${fieldName}Error`)
    if (errorElement) {
      errorElement.textContent = errors[fieldName]
      errorElement.style.display = "block"
    }

    const field = document.getElementById(fieldName)
    if (field) {
      field.style.borderColor = "var(--error)"
    }
  })
}

/**
 * Clear form errors
 */
function clearFormErrors() {
  const errorElements = document.querySelectorAll(".form-error")
  errorElements.forEach((el) => {
    el.textContent = ""
    el.style.display = "none"
  })

  const fields = document.querySelectorAll(".form-group input, .form-group select")
  fields.forEach((field) => {
    field.style.borderColor = ""
  })
}

/**
 * Validate individual form field
 */
function validateFormField(fieldName) {
  const field = document.getElementById(fieldName)
  const errorElement = document.getElementById(`${fieldName}Error`)

  if (!field || !errorElement) return

  const value = field.value.trim()
  const validation = validateField(fieldName === "fullName" ? "name" : fieldName, value)

  if (validation.isValid) {
    errorElement.textContent = ""
    errorElement.style.display = "none"
    field.style.borderColor = ""
  } else {
    errorElement.textContent = validation.error
    errorElement.style.display = "block"
    field.style.borderColor = "var(--error)"
  }
}

/**
 * Update booking summary
 */
function updateBookingSummary() {
  const metalType = document.getElementById("metalType")?.value
  const quantity = Number.parseFloat(document.getElementById("quantity")?.value) || 0

  const summaryRate = document.getElementById("summaryRate")
  const summaryQuantity = document.getElementById("summaryQuantity")
  const summaryTotal = document.getElementById("summaryTotal")

  if (!metalType || !quantity || !summaryRate || !summaryQuantity || !summaryTotal) {
    return
  }

  const currentPrice = metalType === "Gold" ? currentRates.gold.price : currentRates.silver.price
  const calculation = calculateBookingValue(metalType, quantity, currentPrice)

  summaryRate.textContent = `${formatCurrency(currentPrice)}/${metalType === "Gold" ? "10g" : "kg"}`
  summaryQuantity.textContent = `${quantity} ${calculation.unit}`
  summaryTotal.textContent = formatCurrency(calculation.totalValue)
}

/**
 * Update booking form options with current prices
 */
function updateBookingFormOptions() {
  const metalTypeSelect = document.getElementById("metalType")
  if (!metalTypeSelect) return

  const goldOption = metalTypeSelect.querySelector('option[value="Gold"]')
  const silverOption = metalTypeSelect.querySelector('option[value="Silver"]')

  if (goldOption) {
    goldOption.textContent = `Gold (24K) - ${formatCurrency(currentRates.gold.price)}/10g`
  }

  if (silverOption) {
    silverOption.textContent = `Silver (999) - ${formatCurrency(currentRates.silver.price)}/kg`
  }
}

/**
 * Process booking data
 */
function processBooking(formData) {
  const metalType = formData.get("metalType")
  const quantity = Number.parseFloat(formData.get("quantity"))
  const currentPrice = metalType === "Gold" ? currentRates.gold.price : currentRates.silver.price
  const calculation = calculateBookingValue(metalType, quantity, currentPrice)

  return {
    id: generateBookingId(),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    metalType,
    quantity,
    unit: calculation.unit,
    currentPrice,
    pricePerGram: calculation.pricePerGram,
    totalValue: calculation.totalValue,
    timestamp: new Date().toISOString(),
    status: "confirmed",
  }
}

/**
 * Show booking success modal
 */
function showBookingSuccess(bookingData) {
  if (!elements.successModal) return

  const bookingDetails = document.getElementById("bookingDetails")
  if (bookingDetails) {
    bookingDetails.innerHTML = `
      <div class="summary-row">
        <span>Booking ID:</span>
        <span><strong>${bookingData.id}</strong></span>
      </div>
      <div class="summary-row">
        <span>Name:</span>
        <span>${bookingData.fullName}</span>
      </div>
      <div class="summary-row">
        <span>Metal:</span>
        <span>${bookingData.metalType}</span>
      </div>
      <div class="summary-row">
        <span>Quantity:</span>
        <span>${bookingData.quantity} ${bookingData.unit}</span>
      </div>
      <div class="summary-row">
        <span>Rate:</span>
        <span>${formatCurrency(bookingData.currentPrice)}/${bookingData.metalType === "Gold" ? "10g" : "kg"}</span>
      </div>
      <div class="summary-row total">
        <span>Total Value:</span>
        <span><strong>${formatCurrency(bookingData.totalValue)}</strong></span>
      </div>
    `
  }

  elements.successModal.classList.add("active")
  elements.successModal.style.display = "flex"
}

/**
 * Close success modal
 */
function closeSuccessModal() {
  if (!elements.successModal) return

  elements.successModal.classList.remove("active")
  elements.successModal.style.display = "none"
}

/**
 * Save booking to localStorage
 */
function saveBooking(bookingData) {
  const bookings = storage.get("bookings", [])
  bookings.push(bookingData)
  storage.set("bookings", bookings)
}

/**
 * Load user preferences
 */
function loadUserPreferences() {
  const savedRates = storage.get("currentRates")
  if (savedRates) {
    currentRates = { ...currentRates, ...savedRates }
  }
}

/**
 * Cleanup function
 */
function cleanup() {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
  }
}

// Cleanup on page unload
window.addEventListener("beforeunload", cleanup)

// Global functions for HTML onclick handlers
window.openBookingModal = openBookingModal
window.closeBookingModal = closeBookingModal
window.closeSuccessModal = closeSuccessModal

// Helper functions (These would ideally be in separate files)
function generatePriceFluctuation(basePrice, maxFluctuation) {
  const fluctuation = Math.random() * maxFluctuation - maxFluctuation / 2
  return Math.max(0, basePrice + fluctuation) // Ensure price doesn't go negative
}

function calculatePercentageChange(oldPrice, newPrice) {
  return ((newPrice - oldPrice) / oldPrice) * 100
}

const storage = {
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error("Error getting data from localStorage:", error)
      return defaultValue
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error setting data to localStorage:", error)
    }
  },
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer")

  if (!toastContainer) {
    console.warn("Toast container not found")
    return
  }

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  toastContainer.appendChild(toast)

  // Remove toast after a delay
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

function formatCurrency(amount, showSymbol = true) {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)

  return showSymbol ? formattedAmount : formattedAmount.replace("₹", "")
}

function formatDateTime(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }
  return date.toLocaleDateString("en-IN", options)
}

function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

function validateField(fieldName, value) {
  if (!value) {
    return { isValid: false, error: "This field is required" }
  }

  switch (fieldName) {
    case "name":
      if (!/^[a-zA-Z\s]+$/.test(value)) {
        return { isValid: false, error: "Name must contain only letters and spaces" }
      }
      break
    case "phone":
      if (!/^\d{10}$/.test(value)) {
        return { isValid: false, error: "Phone number must be 10 digits" }
      }
      break
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { isValid: false, error: "Invalid email address" }
      }
      break
    case "quantity":
      if (isNaN(value) || Number(value) <= 0) {
        return { isValid: false, error: "Quantity must be a positive number" }
      }
      break
    default:
      return { isValid: true, error: null }
  }

  return { isValid: true, error: null }
}

function calculateBookingValue(metalType, quantity, currentPrice) {
  const unit = metalType === "Gold" ? "grams" : "kg"
  const pricePerGram = metalType === "Gold" ? currentPrice / 10 : currentPrice / 1000
  const totalValue = metalType === "Gold" ? pricePerGram * quantity : currentPrice * quantity

  return { unit, pricePerGram, totalValue }
}

function generateBookingId() {
  return "BOOK" + Math.random().toString(36).substring(2, 10).toUpperCase()
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    currentRates,
    updatePrices,
    validateBookingForm,
    processBooking,
    calculateBookingValue,
  }
}
