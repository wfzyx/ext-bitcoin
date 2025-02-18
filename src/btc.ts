import currency from "currency.js";
import { CURRENCIES, FIVE_MINUTES, ONE_MINUTE, REGEX_FUZZY } from "model";

let updatedLastMinute = false;

async function convertPrices() {
  const thisPageCurrencyMap: Record<string, number> = {};
  const elements = document.querySelectorAll("*");

  for (const e of elements) {
    const element = e as HTMLElement;
    const matches = element.textContent?.trim().match(REGEX_FUZZY);

    if (!matches) continue;

    const currencyCode = CURRENCIES[matches[1] as keyof typeof CURRENCIES].code;
    const rateStorageKey = `${currencyCode}-exchangeRate`;

    if (!thisPageCurrencyMap[currencyCode]) {
      const { [rateStorageKey]: currencyRate } = await chrome.storage.local.get(
        rateStorageKey
      );

      if (!currencyRate && !updatedLastMinute) {
        await updateExchangeRateToLocalStorage(currencyCode);
        updatedLastMinute = true
      }

      const { [rateStorageKey]: exchangeRate } = await chrome.storage.local.get(
        rateStorageKey
      );

      thisPageCurrencyMap[currencyCode] = exchangeRate;
    }

    const exchangeRate = thisPageCurrencyMap[currencyCode];
    const originalText = element.textContent!.trim();

    // TODO: use the decimal and thousands separators from the model file
    // TODO2: we can try to detect the wrongly typed format
    const price = currency(originalText, {
      symbol: matches[1],
      precision: 8,
      decimal: CURRENCIES[matches[1] as keyof typeof CURRENCIES].decimal_sep,
      separator:
        CURRENCIES[matches[1] as keyof typeof CURRENCIES].thousands_sep,
    });

    const bitcoinPrice = price.divide(exchangeRate);
    const bitsPrice = currency(bitcoinPrice.multiply(1e6), { precision: 2 });

    const tooltip = bitsPrice.format({
      symbol: "bits",
      decimal: ".",
      separator: " ",
      pattern: "# !",
    });

    // Add tooltip
    element.title = tooltip;
  }
}

async function updateExchangeRateToLocalStorage(currency: string) {
  try {
    const response = await fetch(
      `https://api.coindesk.com/v1/bpi/currentprice/${currency}.json`
    );
    const data = await response.json();
    if (!data?.bpi?.[currency])
      throw new Error(`Exchange rate data not found for ${currency}`);
    await chrome.storage.local.set({
      [`${currency}-exchangeRate`]: data.bpi[currency].rate_float,
      [`${currency}-exchangeRateTimestamp`]: new Date().getTime(),
    });
  } catch (error) {
    console.error(error);
  }
}

async function clearDeadRates() {
  Object.values(CURRENCIES)
    .map((e) => e.code)
    .forEach(async (e) => {
      const key = `${e}-exchangeRateTimestamp`;
      const { [key]: lastUpdate } = await chrome.storage.local.get(key);
      if (lastUpdate && new Date().getTime() - lastUpdate > FIVE_MINUTES) {
        await chrome.storage.local.remove([key, `${e}-exchangeRate`]);
      }
    });
}

const observer = new MutationObserver(convertPrices);
const config = { childList: true, subtree: true };
observer.observe(document, config);

setInterval(clearDeadRates, ONE_MINUTE);
setInterval(() => (updatedLastMinute = false), ONE_MINUTE);