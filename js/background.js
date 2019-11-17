/*
 * PARAMS
 */

var API_URL = 'https://vcportfolio.info/api/portfolio/kima'

var SECOND = 1000
var MINUTE = SECOND * 60
var HOUR = MINUTE * 60
var HALF_DAY = HOUR * 12
var DAY = HOUR * 24

var OPEN_COMPANY_EVENT = false

/*
 * Functions
 */

function fetchPortfolio() {
  var today = new Date()
  var url = API_URL + '?v=' + [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-')
  fetchJSON(url, handlePorfolio)
}

function handlePorfolio(companies) {
  if (!companies || !companies.data) {
    return console.error('Malformed API response')
  }

  Object.keys(companies.data).forEach(function(i) {
    var company = companies.data[i]
    // More on chrome.storage at: https://developer.chrome.com/apps/storage
    chrome.storage.local.get(company.id, function(items) {
      var isNewCompany = !(Object.keys(items).length > 0)
      saveCompany(company, isNewCompany)
    })
  })
}

function saveCompany(company, isNewCompany) {
  if (!company || !Object.keys(company).length) {
    console.error('Company is empty')
  }

  var storage = {}
  storage[company.id] = company

  // Store company details inside local storage
  // More on chrome.storage at: https://developer.chrome.com/apps/storage
  chrome.storage.local.set(storage, function() {
    if (isNewCompany) {
      notifyNewCompany(company)
    }
  })
}

function openCompany(company) {
  if (OPEN_COMPANY_EVENT) {
    console.log('Refused to open. Event still ongoing.')
    return
  } else if (!company || !company.url) {
    console.log('Refused to open. Company URL is undefined.')
    return
  }

  OPEN_COMPANY_EVENT = true
  window.setTimeout(function() {
    OPEN_COMPANY_EVENT = false
  }, 800)

  console.log('Opening: ' + company.url)
  chrome.tabs.create({
    url: company.url + '?utm_source=vcportfolio.info&utm_medium=addon&utm_campaign=kima-portfolio-tracker'
  })
}

function notifyNewCompany(company) {
  var investmentDate = new Date(company.date)
  var today = new Date()
  if (isNaN(investmentDate)) {
    return
  } else if (today - investmentDate > 7 * DAY) {
    return
  }

  var notification_id = company.id
  var notification_options = {
    type: 'basic',
    title: company.name,
    message: company.url,
    iconUrl: '/img/logo_kima_128x128.png'
  }

  chrome.notifications.create(notification_id, notification_options)

  console.debug('Notifying new invest - ' + company.name)
}

function notificationEventListener() {
  chrome.notifications.onClicked.addListener(function(notification_id) {
    chrome.storage.local.get(notification_id, function(items) {
      var company = items[notification_id]
      openCompany(company)
    })
  })
}

function initialize() {
  chrome.storage.local.get('installation_date', function(items) {
    if (!Object.keys(items).length) {
      console.debug('Set installation date')
      chrome.storage.local.set({ installation_date: new Date().toISOString() })
    }

    console.debug('Fetching portfolio')
    fetchPortfolio()

    // re-fetchPortfolio every half day
    window.setTimeout(initialize, HOUR)
  })

  notificationEventListener()
}

/*
 * It starts here
 */

initialize()
