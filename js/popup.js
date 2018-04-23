var companies;

chrome.storage.local.get(null, function (items) {

  var list = "";
  var limit = 10;

  companies = [];

  Object.keys(items).forEach(function (item) {
    var company = items[item];

    if (!company.id)
      { return; }

    company.date = new Date(company.date);
    company.sector_string = company.sector.map(function(c) { return c.name; }).join();
    companies.push(company);
  });

  companies = companies.sort(function(a, b){return 0.5 - Math.random()});
  companies = companies.sort(function (a,b) { return b.date - a.date; });

  var html = "<div id=\"content\">"
      html += "<h1 id=\"title\"> <a href=\"https://www.kimaventures.com\" title=\"kimaventures.com\" target=\"_blank\">Kima's latest deals</a></h1>";
      html += "<div class=\"search\">"
      html += "<input id=\"search\" type=\"search\" autocomplete=\"off\" placeholder=\"Browse the "+companies.length+" companies\" incremental=\"true\">";
      html += "<span id=\"hits\"></span>"
      html += "</div>"
      html += "<ul id=\"portfolio\"></ul>";

  document.body.innerHTML = html;
  //document.getElementById('search').addEventListener('keyup', search);
  document.getElementById('search').addEventListener('search', search);

  show();

  // https://bugs.chromium.org/p/chromium/issues/detail?id=428044
  // Popup height may not set properly. This is a workaround.
  window.setTimeout(function () { document.body.className = ''; }, 200);

  window.setTimeout(function () { document.getElementById("portfolio").className = 'fade-in'; }, 200);
});



function show (query)
{
  var list = "";

  var regex = new RegExp(query,"gi");

  // Handle sector operator
  if (query)
  {
    var operator = query.split(':');

    if (operator.length > 1 && operator[0] == 'sector' && operator[1] !== "")
      { var regexCategory = new RegExp(operator[1], "gi"); }
  }

  var hits = 0;
  var referenceDate = new Date('2018-04-06')
  var sevenDays = new Date().getTime() - (7 * 24 * 60 * 60 * 1000)

  for (var i = 0 ; i < companies.length ; i++)
  {
    var company = companies[i];
    var sectorsField = [];

    if (regexCategory && !company.sector.length)
      { continue; }
    else if (regexCategory && !company.sector_string.match(regexCategory))
      { continue; }
    else if (!regexCategory && query && !company.name.toString().match(regex))
      { continue; }

    list += "<li>";

    if (company.date > referenceDate && company.date > sevenDays ) {
      list += "<h1><a href=\"" + company.url + "\" target=\"blank\">"+company.name+"</a><span></span><span id=\"new\"> new </span></h1>";
    }
    else {
      list += "<h1><a href=\"" + company.url + "\" target=\"blank\">"+company.name+"</a></h1>";
    }


     if (company.sector.length>0){

      for (var j=0; j < company.sector.length; j++) {

        if (j != company.sector.length - 1){
          list +="<span class=\"sectors\" id="+company.sector[j].name+">";
          list += "<a href=\"#"+company.sector[j].name+"\">"
          list += company.sector[j].name;
          list += "</a>"
          list += " - ";
          list += "</span>";

        }
        else {
          list +="<span class=\"sectors\" id="+company.sector[j].name+">";
          list += "<a href=\"#"+company.sector[j].name+"\">"
          list += company.sector[j].name;
          list += "</a>"
          list += "</span>";
          }
        }
      }
    list += "<p>" + company.description + "</p>";

    // Date management scenarios
    // 1) *NEW* : the date < 30 days, then it displays NEW
    // 2) the date is known and > 30 days, displays the full date
    // if unknown, then reference date is 06/04/18, then displays N/A

    if (company.date > referenceDate && company.date > sevenDays ) {
      list += "<time>"+company.date.toLocaleString("fr-FR",{year: "numeric", month: "numeric", day: "numeric"})+"</time>";
    }
    if (company.date > referenceDate && company.date < sevenDays ) {
      list += "<time>"+company.date.toLocaleString("fr-FR",{year: "numeric", month: "numeric", day: "numeric"})+"</time>";
    }
    if (company.date < referenceDate) {
      // list += "<time>N/A</time>";
    }

    list += "</li>";

    hits++;
  }

  if (operator && operator[0] == "sector" && operator[1] == "")
    { list = '<div class="empty-states">Enter a sector to search for</div>'; }
  if (list == "")
    { list = '<div class="empty-states">No companies matching</div>'; }

  var portfolio = document.getElementById('portfolio');
  portfolio.innerHTML = list;
  portfolio.querySelectorAll('.sectors a').forEach(function (link) {
    link.addEventListener('click', searchSector);
  });

  var hitsContainer = document.getElementById('hits');
  hitsContainer.innerHTML = hits + ' ' + (hits > 1 ? 'hits' : 'hit');
  hitsContainer.style.display = (companies.length == hits) ? 'none' : 'block';
}

function search ()
{
  var query = document.getElementById('search').value;
  return show(query);
}

function searchSector (e)
{
  e.preventDefault();
  document.getElementById('search').value = 'sector:' + this.innerHTML.toLowerCase();
  scroll(0,0)
  search();
}
