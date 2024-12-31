type Currency = {
  code: string;
  symbol: string;
  decimal_digits: number;
  rounding: number;
  thousands_sep: string;
  decimal_sep: string;
  symbol_first: boolean;
};

export const ONE_MINUTE = 1 * 60 * 1000;
export const FIVE_MINUTES = 5 * 60 * 1000;

// TODO: Find a currency json file
export const CURRENCIES = {
  R$: {
    code: "BRL",
    symbol: "R$",
    decimal_digits: 2,
    rounding: 0,
    thousands_sep: ".",
    decimal_sep: ",",
    symbol_first: true,
  },
  "€": {
    code: "EUR",
    symbol: "€",
    decimal_digits: 2,
    rounding: 0,
    thousands_sep: ".",
    decimal_sep: ",",
    symbol_first: true,
  },
  "¥": {
    code: "JPY",
    symbol: "¥",
    decimal_digits: 0,
    rounding: 0,
    thousands_sep: ",",
    decimal_sep: ".",
    symbol_first: true,
  },
  "£": {
    code: "GBP",
    symbol: "£",
    decimal_digits: 2,
    rounding: 0,
    thousands_sep: ".",
    decimal_sep: ",",
    symbol_first: true,
  },
  $: {
    code: "USD",
    symbol: "$",
    decimal_digits: 2,
    rounding: 0,
    thousands_sep: ",",
    decimal_sep: ".",
    symbol_first: true,
  },
};

const MONEY_TOKENS: string[] = Object.values(CURRENCIES)
  .map((currency: Currency) => currency.symbol)
  .concat(Object.values(CURRENCIES).map((currency: Currency) => currency.code));

export const REGEX_FUZZY = new RegExp(
  `^(${MONEY_TOKENS.map((token) => token.replace("$", "\\$")).join(
    "|"
  )})\\s?((\\d+(\\.|,|')?)+)$`,
  "i"
);
