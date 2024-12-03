import { expect, test } from "bun:test";
import { halvingPriceBand } from "hpr";

test("halvingPriceBand", () => {
  expect(halvingPriceBand(54000, "2024-12-01")).toBeGreaterThanOrEqual(-0.25);
  expect(halvingPriceBand(80000, "2024-12-01")).toBeLessThanOrEqual(0.21);
  expect(halvingPriceBand(81000, "2024-12-01")).toBeGreaterThanOrEqual(0.21);
  expect(halvingPriceBand(114000, "2024-12-01")).toBeLessThanOrEqual(0.57);
  expect(halvingPriceBand(130000, "2024-12-01")).toBe("Yellow");
  expect(halvingPriceBand(200000, "2024-12-01")).toBe("Orange");
  expect(halvingPriceBand(250000, "2024-12-01")).toBe("Red");
  expect(halvingPriceBand(310000, "2024-12-01")).toBe("Black");
});
