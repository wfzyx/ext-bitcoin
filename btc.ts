(function(e,g){"object"===typeof exports&&"undefined"!==typeof module?module.exports=g():"function"===typeof define&&define.amd?define(g):(e=e||self,e.currency=g())})(this,function(){function e(b,a){if(!(this instanceof e))return new e(b,a);a=Object.assign({},m,a);var d=Math.pow(10,a.precision);this.intValue=b=g(b,a);this.value=b/d;a.increment=a.increment||1/d;a.groups=a.useVedic?n:p;this.s=a;this.p=d}function g(b,a){var d=2<arguments.length&&void 0!==arguments[2]?arguments[2]:!0;var c=a.decimal;
  var h=a.errorOnInvalid,k=a.fromCents,l=Math.pow(10,a.precision),f=b instanceof e;if(f&&k)return b.intValue;if("number"===typeof b||f)c=f?b.value:b;else if("string"===typeof b)h=new RegExp("[^-\\d"+c+"]","g"),c=new RegExp("\\"+c,"g"),c=(c=b.replace(/\((.*)\)/,"-$1").replace(h,"").replace(c,"."))||0;else{if(h)throw Error("Invalid Input");c=0}k||(c=(c*l).toFixed(4));return d?Math.round(c):c}var m={symbol:"$",separator:",",decimal:".",errorOnInvalid:!1,precision:2,pattern:"!#",negativePattern:"-!#",format:function(b,
  a){var d=a.pattern,c=a.negativePattern,h=a.symbol,k=a.separator,l=a.decimal;a=a.groups;var f=(""+b).replace(/^-/,"").split("."),q=f[0];f=f[1];return(0<=b.value?d:c).replace("!",h).replace("#",q.replace(a,"$1"+k)+(f?l+f:""))},fromCents:!1},p=/(\d)(?=(\d{3})+\b)/g,n=/(\d)(?=(\d\d)+\d\b)/g;e.prototype={add:function(b){var a=this.s,d=this.p;return e((this.intValue+g(b,a))/(a.fromCents?1:d),a)},subtract:function(b){var a=this.s,d=this.p;return e((this.intValue-g(b,a))/(a.fromCents?1:d),a)},multiply:function(b){var a=
  this.s;return e(this.intValue*b/(a.fromCents?1:Math.pow(10,a.precision)),a)},divide:function(b){var a=this.s;return e(this.intValue/g(b,a,!1),a)},distribute:function(b){var a=this.intValue,d=this.p,c=this.s,h=[],k=Math[0<=a?"floor":"ceil"](a/b),l=Math.abs(a-k*b);for(d=c.fromCents?1:d;0!==b;b--){var f=e(k/d,c);0<l--&&(f=f[0<=a?"add":"subtract"](1/d));h.push(f)}return h},dollars:function(){return~~this.value},cents:function(){return~~(this.intValue%this.p)},format:function(b){var a=this.s;return"function"===
  typeof b?b(this,a):a.format(this,Object.assign({},a,b))},toString:function(){var b=this.s,a=b.increment;return(Math.round(this.intValue/this.p/a)*a).toFixed(b.precision)},toJSON:function(){return this.value}};return e});



const CURRENCIES = {
  "R$": {code: "BRL", symbol: "R$", symbol: "R$", decimal_digits: 2, rounding: 0, thousands_sep: ".", decimal_sep: ",", symbol_first: true},
  "€": {code: "EUR", symbol: "€", symbol: "€", decimal_digits: 2, rounding: 0, thousands_sep: ".", decimal_sep: ",", symbol_first: true},
  "¥": {code: "JPY", symbol: "¥", symbol: "¥", decimal_digits: 0, rounding: 0, thousands_sep: ",", decimal_sep: ".", symbol_first: true},
  "£": {code: "GBP", symbol: "£", symbol: "£", decimal_digits: 2, rounding: 0, thousands_sep: ".", decimal_sep: ",", symbol_first: true},
  "$": {code: "USD", symbol: "$", symbol: "$", decimal_digits: 2, rounding: 0, thousands_sep: ",", decimal_sep: ".", symbol_first: true},
  };

const MONEY_TOKENS = []
  .concat(Object.keys(CURRENCIES))
  .concat(Object.values(CURRENCIES));

const REGEX = new RegExp(
  `^(${MONEY_TOKENS.map((token) => token.replace("$", "\\$")).join(
    "|"
  )})\\s?((\\d+(\\.|,|')?)+\\d)$`,
  "i"
);

async function convertPrices() {
  const currencyMap = {};
  var elements = document.querySelectorAll("*");

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    const matches = element.textContent.match(REGEX);
    if (!matches) continue;

    const currencyCode = Object.entries(CURRENCIES).find(
      ([_, e]) => e === matches[1]
    )[0];

    const storageKey = `${currencyCode}-exchangeRate`;
    console.log("btc", storageKey);
    if (!currencyMap[currencyCode]) {
      const storageData = await chrome.storage.local.get(storageKey);
      console.log("btc", storageData);
      if (!storageData || Object.keys(storageData).length === 0) {
        updateExchangeRateToLocalStorage(currencyCode);
      }
      const { [storageKey]: exchangeRate } = await chrome.storage.local.get(
        storageKey
      );
      console.log("btc", exchangeRate);

      currencyMap[currencyCode] = exchangeRate;
    }

    const exchangeRate = currencyMap[currencyCode];

    var originalText = element.textContent;
    var price = currency(originalText, { symbol: matches[1], precision: 2, decimal: "," });
    console.log("btc", price, exchangeRate);
    var bitcoinPrice = price / exchangeRate;
    var satoshisPrice = bitcoinPrice * 100000000;
    console.log("btc", price, bitcoinPrice, satoshisPrice);
    element.textContent = bitcoinPrice.toFixed(8) + " BTC";
    element.setAttribute("data-original", originalText);
    element.setAttribute("data-bitcoin", bitcoinPrice.toFixed(8) + " BTC");
    element.setAttribute(
      "data-satoshis",
      satoshisPrice
        .toFixed(0)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Sats"
    );
    element.setAttribute("data-toggle", "BTC");
    element.addEventListener("mouseover", function (event) {
      event.target.textContent = event.target.getAttribute("data-original");
    });
    element.addEventListener("mouseout", function (event) {
      var currentToggle = event.target.getAttribute("data-toggle");
      if (currentToggle == "BTC") {
        event.target.textContent = event.target.getAttribute("data-satoshis");
        event.target.setAttribute("data-toggle", "SATS");
      } else {
        event.target.textContent = event.target.getAttribute("data-bitcoin");
        event.target.setAttribute("data-toggle", "BTC");
      }
    });
  }
}

async function updateExchangeRateToLocalStorage(currency = "USD") {
  let data;
  var endpoint = `https://api.coindesk.com/v1/bpi/currentprice/${currency}.json`;

  try {
    const response = await fetch(endpoint);
    data = await response.json();
  } catch (error) {
    console.error(error);
  }

  if (!data?.bpi?.[currency]) {
    console.error(
      `Error: Exchange rate data not found in API response (${currency})`
    );
    return;
  }

  const storageData = {};

  console.log("btc", data);
  storageData[`${currency}-exchangeRate`] = data.bpi[currency].rate_float;
  storageData[`${currency}-exchangeRateTimestamp`] = Date.now();

  await chrome.storage.local.set(storageData);
}

convertPrices();

// TODO: this needs improvment
// setInterval(updateExchangeRateToLocalStorage, 3600 * 1000);
