from playwright.sync_api import sync_playwright, expect
import time
import os

def test_student_name_loading():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Mock sessionStorage
        context.add_init_script("""
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('studentIdentifier', 'test.student@example.com');
        """)

        page = context.new_page()

        # Open the page
        print("Navigating to 2D20R.html...")
        page.goto("http://localhost:8000/2D20R.html")

        # Check initial state
        loading_locator = page.locator("#auto-student-name-display")

        # Wait a bit to see if it updates
        try:
            # We expect it to CHANGE from "... Loading ..." to "Test Student"
            expect(loading_locator).to_have_text("Test Student", timeout=3000)
            print("SUCCESS: Student name loaded correctly.")
        except AssertionError:
            print("FAILURE: Student name stuck on Loading.")
            # Capture the text to be sure
            print(f"Current text: {loading_locator.text_content()}")

        page.screenshot(path="verification/reproduction.png")

        browser.close()

if __name__ == "__main__":
    test_student_name_loading()
