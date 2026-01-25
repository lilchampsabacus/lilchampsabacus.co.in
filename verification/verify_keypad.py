from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Verify Decimal HTML
    print("Verifying decimal.html...")
    page.add_init_script("""
        window.sessionStorage.setItem('isLoggedIn', 'true');
        window.sessionStorage.setItem('studentIdentifier', 'verify@test.com');
    """)
    page.goto("http://localhost:8000/decimal.html")

    page.wait_for_selector("#start-button:not([disabled])")
    page.click("#start-button")

    page.wait_for_selector("#test-area")
    page.wait_for_selector("#custom-keypad")

    # Test Interaction
    print("Testing Keypad Interaction...")
    # Click '7'
    page.click("button[onclick=\"handleKey('7')\"]")
    val = page.input_value("#answer-input")
    if val != "7":
        print(f"Error: Expected '7', got '{val}'")
    else:
        print("Success: Key '7' worked")

    # Click Backspace
    page.click("button[onclick=\"handleKey('backspace')\"]")
    val = page.input_value("#answer-input")
    if val != "":
        print(f"Error: Expected empty, got '{val}'")
    else:
        print("Success: Backspace worked")

    # Click 1 . 5
    page.click("button[onclick=\"handleKey('1')\"]")
    page.click("button[onclick=\"handleKey('.')\"]")
    page.click("button[onclick=\"handleKey('5')\"]")
    val = page.input_value("#answer-input")
    if val != "1.5":
        print(f"Error: Expected '1.5', got '{val}'")
    else:
        print("Success: Sequence '1.5' worked")

    page.screenshot(path="verification/decimal_keypad_tested.png")

    # Verify Negative HTML
    print("Verifying negative.html...")
    page.goto("http://localhost:8000/negative.html")
    page.wait_for_selector("#start-button:not([disabled])")
    page.click("#start-button")

    page.wait_for_selector("#test-area")

    # Test Interaction
    # Click '-' then '9'
    page.click("button[onclick=\"handleKey('-')\"]")
    page.click("button[onclick=\"handleKey('9')\"]")
    val = page.input_value("#answer-input")
    if val != "-9":
        print(f"Error: Expected '-9', got '{val}'")
    else:
        print("Success: Sequence '-9' worked")

    page.screenshot(path="verification/negative_keypad_tested.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
