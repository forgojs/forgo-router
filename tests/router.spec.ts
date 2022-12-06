import { test, expect } from "@playwright/test";

test("Params are passed to the matching component", async ({ page }) => {
  await page.goto("http://localhost:5173/params/bar");

  // Expect a title "to contain" a substring.
  await expect(page.locator("#content")).toHaveText("bar");
});
