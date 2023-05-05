# Better Outlook

Making work's [Outlook](https://outlook.office.com) minimally usable.

- A Firefox extension with a content script to intercept and modify the Outlook web app's DOM on-the-fly.
- Use a `MutationObserver` to detect new instances of the insurance-policy-mandated phishing banner
- Use `requestIdleCallback()` to process things in the `MutationObserver` callback?
- Use `requestAnimationFrame()` to perform the DOM modifications.


## References

- <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Modify_a_web_page>
- <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json>
- [Performance of MutationObserver](https://stackoverflow.com/a/39332340)

