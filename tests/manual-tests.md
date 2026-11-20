# Manual tests

Manual checks recur when a change can affect their result. A successful check applies to the tested commit, environment, and scope; it is not permanent accessibility or visual approval. Run the automated suites first. Unchecked items have not been verified.

## When to run them

| Trigger | Manual work |
| --- | --- |
| First setup of this suite | Review the initial CI-generated screenshots and run the full accessibility checklist to establish a recorded starting point. |
| Navigation, content structure, form, code-copy, CSS, or layout changes | Repeat the affected keyboard, screen-reader, contrast, zoom, and no-JavaScript checks on the changed page types. |
| Release candidate | Run a representative keyboard and screen-reader smoke test across home, list, single, terms, taxonomy, and 404 pages; review unresolved findings before release. |
| Browser or assistive-technology changes that affect supported users | Repeat representative navigation, reading-order, and form checks in the changed environment. |
| Intended visual change, browser upgrade, font change, or capture-environment change | Review the screenshot differences and approve replacement baselines generated in CI. |
| A new page type or viewport enters the visual suite | Review its first CI-generated baseline. |

## Visual baseline review

Initial baseline approval is a one-time setup step for that baseline set. Screenshot comparisons run automatically in CI after that. Human review recurs when a difference is intentional or when the capture environment changes; an unchanged screenshot does not need a fresh manual review on every run.

Generate baseline images with the workflow described in [the visual baseline guide](README.md#visual-baselines). Check page content, navigation, responsive layout, clipping, overlap, focus appearance where captured, and unexpected missing elements at each viewport. Record the CI run and reviewed commit. Review the actual differences before accepting replacement images; do not update baselines only to silence a failure.

## Accessibility checklist

Use the checks below for the affected scope. A release smoke test covers representative pages and interactions; a substantial navigation or layout change warrants the full checklist.

* [ ] Navigate each page type using only Tab, Shift+Tab, Enter, Space, and Escape. Confirm logical focus order, visible focus, and no keyboard traps.
* [ ] Open and close desktop submenus and the mobile menu. Confirm focus returns to the correct control, and expanded states are announced.
* [ ] Read home, list, single, terms, taxonomy, and 404 pages with a screen reader. Check document language, page titles, heading order, landmarks, link names, and reading order.
* [ ] Confirm form controls have useful accessible names, instructions, required states, and understandable validation feedback.
* [ ] Check code copying and feedback with keyboard and screen reader. Confirm code can be selected when JavaScript is disabled.
* [ ] Disable JavaScript. Follow primary and child navigation links, read content, and check that hidden enhancement controls leave no empty stops.
* [ ] Check text at 200% zoom and reflow at 320 CSS pixels. Confirm content remains readable without unnecessary horizontal scrolling.
* [ ] Check contrast for normal text, large text, focus indicators, controls, and text on featured images. Test hover, focus, selected, and disabled states.
* [ ] Check meaningful image alternatives and confirm decorative images do not add noise.
* [ ] Check pointer target size, mobile orientation, reduced motion, and forced colours.

The automated suite now requires zero violations, including contrast and form labels. This does not mean these manual checks have passed. Record any manual defects separately.

## Record a result

Put results in the pull request or release record, and link any defects. Keep the checklist as the procedure rather than checking it off permanently. Use this template:

```text
Date:
Tested commit:
Tester:
Scope and page types:
Browser and version:
Operating system and version:
Screen reader or other assistive technology and version:
Viewport and zoom:
Checks completed:
Result: passed / failed / not run
Findings and issue links:
Screenshots or CI run:
```

Axe results and accessible-name assertions do not replace a person using a screen reader. Leave manual checks marked as not run until that work is done.
