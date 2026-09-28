import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

test("typed random letters get a kind note instead of a well done, and real words go through", async ({ page }) => {
  await seed(page);
  await page.goto("/step/class-answer?level=2");
  const field = page.getByRole("textbox", { name: "Type it here" });
  await field.fill("sdfjhk qwerty hjkhjk");
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("status").filter({ hasText: "That looks like random letters" })).toBeVisible();
  await expect(field).toBeFocused();
  await expect(page).toHaveURL(/level=2/);

  await field.fill("Can I ask a question about the homework?");
  await expect(page.getByText("That looks like random letters")).toBeHidden();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("button", { name: "Done" })).toBeHidden();
});
