import currency from "currency.js";
import { CURRENCIES, REGEX } from "model";

async function convertPrices() {
  const currencyMap: Record<string, number> = {};
  const elements = document.querySelectorAll("*");
  const existingTooltipElements: HTMLElement[] = [];

  for (const e of elements) {
    const element = e as HTMLElement;
    const matches = element.textContent?.match(REGEX);
    if (!matches) continue;
    if (element.dataset.processed === "true") continue;

    element.dataset.processed = "true";

    const currencyCode = CURRENCIES[matches[1] as keyof typeof CURRENCIES].code;
    const storageKey = `${currencyCode}-exchangeRate`;

    if (!currencyMap[currencyCode]) {
      const storageData = await chrome.storage.local.get(storageKey);
      if (!storageData || Object.keys(storageData).length === 0) {
        await updateExchangeRateToLocalStorage(currencyCode);
      }
      const { [storageKey]: exchangeRate } = await chrome.storage.local.get(
        storageKey
      );
      currencyMap[currencyCode] = exchangeRate;
    }

    const exchangeRate = currencyMap[currencyCode];
    const originalText = element.textContent!;
    const price = currency(originalText, {
      symbol: matches[1],
      precision: 8,
      decimal: ",",
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
    element.dataset.btc = tooltip;

    existingTooltipElements.push(element);
  }

  await Promise.resolve();
  existingTooltipElements.forEach((e) => {
    if (existingTooltipElements.some((it) => it.contains(e) && it !== e)) {
      e.dataset.btc = "";
    }
  });
}

async function updateExchangeRateToLocalStorage(currency: string = "USD") {
  const { lastUpdate } = await chrome.storage.local.get(
    `${currency}-exchangeRateTimestamp`
  );

  if (lastUpdate && new Date().getTime() - lastUpdate < 3600 * 1000) return;

  try {
    const response = await fetch(
      `https://api.coindesk.com/v1/bpi/currentprice/${currency}.json`
    );
    const data = await response.json();
    if (!data?.bpi?.[currency])
      throw new Error(`Exchange rate data not found for ${currency}`);
    await chrome.storage.local.set({
      [`${currency}-exchangeRate`]: data.bpi[currency].rate_float,
      [`${currency}-exchangeRateTimestamp`]: Date.now(),
    });
  } catch (error) {
    console.error(error);
  }
}

// Create a style element
const style = document.createElement("style");

// Add CSS rules
style.textContent = `
[data-btc]:hover::after {
  display: block;
  position: absolute;
  content: attr(data-btc);
  border: 1px solid black;
  background: #eee;
  padding: .25em;
  z-index: 99;
}
`;

// Append the style element to the document head
document.head.appendChild(style);

const observer = new MutationObserver(convertPrices);
const config = { childList: true, subtree: true };
observer.observe(document, config);

setInterval(updateExchangeRateToLocalStorage, 300 * 1000);
