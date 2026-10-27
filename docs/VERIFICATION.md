# v1.0.0 verification

Prepared 2026-10-25. Verification used a ZIP extracted into a fresh temporary folder, separate from the working source and personal installation.

## Passed

- All six Node test groups: synthetic-data validation; invalid inputs and timestamps; building-split withholding; chart gaps; recorder persistence/deduplication/source separation; public-file allowlist, Host checking and write rejection.
- Direct `file://` opening of the demo in Chrome with no server or dependency installation.
- All four dashboard views rendered without browser JavaScript errors.
- Valid JSON import, JSON export, invalid-file error, and return to demo after reload.
- Local HTTP server and loading recorded synthetic data.
- A one-shot synthetic generator and recorder from the extracted package.
- Desktop (1600 px wide) and mobile (390 px wide) rendering; no mobile horizontal overflow.
- No external network requests while exercising the app; documentation links were not followed in that check.
- ZIP integrity check and an allowlist-based distribution audit for known personal device IDs, private network addresses, workspace paths and key-file signatures.

## Not verified / not included

- Live hardware integrations, HomeyScript execution on a real Homey, or device-specific units/register maps.
- Safari, Firefox, Windows/macOS launcher behaviour, screen-reader use, or all browser/OS combinations. Native keyboard controls and text table alternatives are included, but this is not an accessibility certification.
- Docker image build, Synology Container Manager deployment, authenticated LAN hosting, or native Android TV installation.
- Public download URLs were not part of the local-install tests. They are checked separately when publishing. A local preview is not a public download.

Tests run with the available Node runtime and Chrome. The code targets Node 22+; a separate Node 22/24 compatibility matrix has not been run. No claim of fully tested hardware support is made.
