/*
 * PARAMS
 */

var API_URL = "https://www.kaizens.io/kima.json";

var SECOND   = 1000;
var MINUTE   = SECOND * 60;
var HOUR     = MINUTE * 60;
var HALF_DAY = HOUR * 12;
var DAY      = HOUR * 24;

var NOTIFICATION_ACTIVE = false;

/*
 * Functions
 */

function fetchPortfolio ()
{
  fetchJSON(API_URL, handlePorfolio);
}

function handlePorfolio (companies)
{
  if (!companies || !Object.keys(companies).length)
    { return console.error('No companies in portfolio'); }

  Object.keys(companies).forEach(function (id, i) {
    // More on chrome.storage at: https://developer.chrome.com/apps/storage
    var company = companies[id];
    chrome.storage.local.get(company.id, function (items) {
      if (!Object.keys(items).length) {
        saveNewCompany(company);
      }
    })
  });
}

function saveNewCompany (company)
{
  if (!company || !Object.keys(company).length)
    { console.error('Company is empty'); }

  var storage = {};
      storage[company.id] = company;

  // More on chrome.storage at: https://developer.chrome.com/apps/storage
  chrome.storage.local.set(storage, function () {
    notifyNewCompany(company);
  });

  console.info('Saving new invest - ' + company.name + '- ' + company);
};

function notifyNewCompany (company)
{
  if (!NOTIFICATION_ACTIVE)
    { return; }

  var notification_id = company.id;
  var notification_options = {
    type: "basic",
    title: "Kima has invested in " + company.name,
    message: company.description + ' - ' + company.url,
    iconUrl: "/img/logo_kima_128x128.png"
  };

  chrome.notifications.create(notification_id, notification_options);

  console.info('Notifying new invest - ' + company.name + '- ' + company);
}

function notificationEventListener ()
{
  chrome.notifications.onClicked.addListener(function (notification_id) {
    chrome.storage.local.get(notification_id, function (items) {
      Object.keys(items).forEach(function (item) {
        var company = items[item];
        return chrome.tabs.create({url:company.url});
      })
    });
  });
}

function initialize ()
{
  //chrome.storage.local.clear();
  chrome.storage.local.get(
    'installation_date',
    function (items)
    {
      if (!Object.keys(items).length)
      {
        chrome.storage.local.set(
          {'installation_date': (new Date()).toISOString()},
          function () { fetchPortfolio();}
        );
      }
      else
      {
        NOTIFICATION_ACTIVE = true;
        fetchPortfolio();
      }
    }
  );

  notificationEventListener();
};

/*
 * It starts here
 */

initialize();

// re-fetchPortfolio every half day
setTimeout(fetchPortfolio, HALF_DAY);
