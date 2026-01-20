from playwright.sync_api import sync_playwright, expect
import time
import os

def test_hints_functionality():
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

        # 1. Verify Student Name loads (Regression check)
        loading_locator = page.locator("#auto-student-name-display")
        expect(loading_locator).to_have_text("Test Student", timeout=3000)
        print("SUCCESS: Student name loaded correctly.")

        # 2. Enable Hints
        hints_checkbox = page.locator("#show-hints-toggle")
        hints_checkbox.check()
        print("Checked hints toggle.")

        # 3. Start Mission
        start_btn = page.locator("#start-button")
        start_btn.click()
        print("Clicked Start.")

        # 4. Check for hints in the DOM
        # Hints are span elements with class 'hint-dot'
        # We need to wait for the carousel to populate
        page.wait_for_selector(".slide-container.active")

        hint_dots = page.locator(".slide-container.active .hint-dot")

        # We expect multiple dots (one per number row)
        count = hint_dots.count()
        print(f"Found {count} hint dots.")

        if count > 0:
            # Check if they are visible (removed 'hidden' class)
            # The CSS logic in 2D20R.html:
            # .hint-dot { display: inline-block; ... }
            # .hidden { display: none !important; }
            # But the 'hidden' class is toggled based on checkbox.
            # However, in renderCards(), the class is added conditionally:
            # const visibilityClass = showHints ? '' : 'hidden';

            first_dot = hint_dots.first
            class_attr = first_dot.get_attribute("class")
            print(f"First dot class: {class_attr}")

            if "hidden" not in class_attr:
                print("SUCCESS: Hints are visible.")
            else:
                print("FAILURE: Hints are hidden despite checkbox.")
        else:
             print("FAILURE: No hint dots found in DOM.")

        page.screenshot(path="verification/hints_check.png")

        browser.close()

if __name__ == "__main__":
    test_hints_functionality()
