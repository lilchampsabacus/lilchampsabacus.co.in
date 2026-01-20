
from playwright.sync_api import sync_playwright, expect

def test_2D20R_updates(page):
    # Inject sessionStorage BEFORE navigation
    page.add_init_script("""
        window.sessionStorage.setItem('isLoggedIn', 'true');
        window.sessionStorage.setItem('studentIdentifier', 'testuser@example.com');
    """)

    # Navigate to the page
    page.goto("http://localhost:8000/2D20R.html")

    # Wait for the Start button to be visible
    start_button = page.locator("#start-button")
    expect(start_button).to_be_visible()

    # Wait for it to be enabled (it might take a moment due to preloading)
    expect(start_button).to_be_enabled(timeout=10000)

    # Click Start
    start_button.click()

    # Wait for the game area to be visible
    test_area = page.locator("#test-area")
    expect(test_area).to_be_visible()

    # 1. Verify Keypad Visibility and Position (Desktop)
    keypad = page.locator("#custom-keypad")
    expect(keypad).to_be_visible()

    # 2. Verify Input Type
    answer_input = page.locator("#answer-input")
    input_type = answer_input.get_attribute("type")
    assert input_type == "text", f"Expected input type 'text', got '{input_type}'"

    inputmode = answer_input.get_attribute("inputmode")
    assert inputmode == "none", f"Expected inputmode 'none', got '{inputmode}'"

    # 3. Verify Keypad Input Logic (Clicking buttons)
    # Click '5'
    page.locator("button.keypad-btn", has_text="5").click()
    expect(answer_input).to_have_value("5")

    # Click '.'
    page.locator("button.keypad-btn", has_text=".").click()
    expect(answer_input).to_have_value("5.")

    # Click '5'
    page.locator("button.keypad-btn", has_text="5").click()
    expect(answer_input).to_have_value("5.5")

    # Clear
    answer_input.evaluate("el => el.value = ''")

    # Verify '-'
    page.locator("button.keypad-btn", has_text="-").click()
    expect(answer_input).to_have_value("-")

    page.locator("button.keypad-btn", has_text="1").click()
    expect(answer_input).to_have_value("-1")

    # 4. Verify Physical Keyboard Support
    # Clear
    answer_input.evaluate("el => el.value = ''")
    # Click somewhere else
    page.locator("body").click()

    # Type physical keys
    page.keyboard.press("7")
    expect(answer_input).to_have_value("7")

    page.keyboard.press("Period")
    expect(answer_input).to_have_value("7.")

    page.keyboard.press("5")
    expect(answer_input).to_have_value("7.5")

    page.keyboard.press("Backspace")
    expect(answer_input).to_have_value("7.")

    # Capture Screenshot
    page.screenshot(path="/home/jules/verification/verification_keypad.png")

    # Capture Screenshot of input with value
    page.screenshot(path="/home/jules/verification/verification_keypad_input.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to Desktop size
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            test_2D20R_updates(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
