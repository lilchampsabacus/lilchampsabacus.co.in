from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Load the benchmark file. Assuming it's served or just opening the file directly.
        # Since I'm in the repo root, I can use absolute path or file://
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/benchmark_report.html")

        # Wait for result
        result = page.locator("#result").text_content()
        print(f"Benchmark Result: {result}")

        browser.close()

if __name__ == "__main__":
    run()
