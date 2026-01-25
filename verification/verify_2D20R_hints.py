from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})

    # Inject session storage
    page.add_init_script("""
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('studentIdentifier', 'test@example.com');
    """)

    page.goto("http://localhost:8000/2D20R.html")

    # Wait for page to load and start button to be enabled
    page.wait_for_selector("#start-button:not([disabled])")

    # Enable Hints
    page.check("#show-hints-toggle")

    # Click start
    page.click("#start-button")

    # Wait for test area to be visible
    page.wait_for_selector("#test-area", state="visible")

    # Wait a bit for layout to settle
    page.wait_for_timeout(1000)

    # Take screenshot
    page.screenshot(path="verification/2D20R_layout_hints.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
