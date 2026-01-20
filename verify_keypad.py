from playwright.sync_api import sync_playwright

def verify_keypad():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a mobile device
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},
            is_mobile=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        )
        page = context.new_page()

        # Add init script to set session storage
        context.add_init_script("""
            window.sessionStorage.setItem('isLoggedIn', 'true');
            window.sessionStorage.setItem('studentIdentifier', 'test@example.com');
        """)

        page.goto("http://localhost:8000/2D20R.html")

        # Wait for the page to load
        page.wait_for_selector("#start-button", state="visible")

        # Click start button to show the test area and keypad
        page.click("#start-button")

        # Wait for test area and keypad
        page.wait_for_selector("#test-area", state="visible")
        page.wait_for_selector("#custom-keypad", state="visible")

        # Take a screenshot
        page.screenshot(path="verification_keypad.png")

        # Test Keypad interaction
        page.click("button:has-text('1')")
        page.click("button:has-text('2')")
        page.click("button:has-text('3')")

        # Take another screenshot to verify input
        page.screenshot(path="verification_keypad_input.png")

        # Verify input value
        input_value = page.input_value("#answer-input")
        print(f"Input value: {input_value}")

        if input_value == "123":
            print("Verification Successful: Keypad input works.")
        else:
            print("Verification Failed: Keypad input mismatch.")

        browser.close()

if __name__ == "__main__":
    verify_keypad()
