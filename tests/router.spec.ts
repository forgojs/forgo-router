import { test, expect } from "@playwright/test";

test("Params are passed to the matching component", async ({ page }) => {
  await page.goto("http://localhost:5173/params/bar");

  // Expect a title "to contain" a substring.
  await expect(page.locator("#content")).toHaveText("bar");
});

test("Params are captured without changing their case", async ({ page }) => {
  await page.goto("http://localhost:5173/params/Bar");

  // Expect a title "to contain" a substring.
  await expect(page.locator("#content")).toHaveText("Bar");
});
