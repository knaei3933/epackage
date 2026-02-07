import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3001/")
    page.get_by_text("お知らせ2025年12月27日テスト通知これはテスト通知です。").click()
    page.goto("http://localhost:3001/auth/signin?redirect=%2Fquote-simulate")
    page.get_by_role("button", name="お見積り").click()
    page.get_by_role("main").nth(1).click()
    page.get_by_role("textbox", name="メールアドレスrequired").click()
    page.get_by_role("textbox", name="メールアドレスrequired").click()
    page.get_by_role("textbox", name="メールアドレスrequired").click()
    page.get_by_role("textbox", name="メールアドレスrequired").fill("member@e")
    page.goto("http://localhost:3002/")
    page.locator("div").nth(1).click()
    page.locator("body").press("ControlOrMeta+r")
    page.goto("chrome-error://chromewebdata/")

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
