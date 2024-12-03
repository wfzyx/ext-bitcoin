export function getBandName(index: number) {
  if (index < -0.5) return "White";
  if (-0.5 <= index && index <= 0.5) return "Blue";
  if (0.5 <= index && index <= 1.5) return "Green";
  if (1.5 <= index && index <= 2.5) return "Yellow";
  if (2.5 <= index && index <= 3.5) return "Orange";
  if (3.5 <= index && index <= 4.5) return "Red";
  return "Black";
}

// Helper function to fit a logarithmic regression model and return the parameters
function fitLogRegression(
  xData: number[],
  yData: number[]
): { a: number; b: number } {
  const n = xData.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += Math.log(xData[i]);
    sumY += Math.log10(yData[i]);
    sumXY += Math.log(xData[i]) * Math.log10(yData[i]);
    sumX2 += Math.log(xData[i]) ** 2;
  }

  // Solving for a and b
  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const b = (sumY - a * sumX) / n;

  return { a, b };
}

export function halvingPriceBand(price: number, date: string): number {
  const bands = ["Green", "Yellow", "Orange", "Red"];

  // Halving dates and prices
  const halvingDates = [
    new Date(2012, 10, 28), // November is month 10 (0-indexed)
    new Date(2016, 6, 9), // July is month 6 (0-indexed)
    new Date(2020, 4, 11), // May is month 4 (0-indexed)
  ];
  const halvingPrices = [12.33, 651.94, 8591.65];

  // Convert halving dates to days since Genesis Block (2009-01-03)
  const genesisBlock = new Date(2009, 0, 3);
  const xHalvingDates = halvingDates.map((date) =>
    Math.floor(
      (date.getTime() - genesisBlock.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  // Fit the model parameters
  const { a, b } = fitLogRegression(xHalvingDates, halvingPrices);

  // Parse input date and find xInput (days since Genesis Block)
  const inputDate = new Date(date);
  const xInput = Math.floor(
    (inputDate.getTime() - genesisBlock.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate the HPR value using the fitted logarithmic model
  const logPrice = a * Math.log(xInput) + b;
  const hprPrice = Math.pow(10, logPrice);

  // Find the relative difference from the HPR value
  const difference = price / hprPrice;

  return difference - 1;
}
