# Add your own connection

The starter has a deliberate boundary:

**Equipment → your private read-only adapter → schema-1 JSON → recorder/dashboard.**

The dashboard doesn’t need passwords, device control access, or knowledge of how each device communicates.

## Homey

Homey was a key component of the original build. It already connected many of the devices and exposed their readings. Some measurements in that project came from direct local connections instead. Don’t assume all equipment must route through Homey.

The included `examples/homey-export.homeyscript.js` is a small, read-only **manual export example**:

1. Use [HomeyScript](https://homey.app/a/com.athom.homeyscript) on your own Homey.
2. Open the example in a text editor and copy it into a new HomeyScript.
3. Fill the `selection` list with your own device IDs, metric keys and capability IDs. Inspect the available capabilities in [Homey Developer Tools](https://tools.developer.homey.app/).
4. Select the correct equipment and verify the units. Do not copy example names into a live system without checking their meaning.
5. Run the script, then copy its returned JSON to a local file and import that file into the dashboard.
6. Treat unavailable/stale results as unknown. An unchanged capability timestamp may mean an old reading or a device that does not publish often; verify your particular device’s reporting behaviour.

This example reads `Homey.devices.getDevices()` and capability values. It does not change capabilities, trigger Flows, authenticate a standalone app, or schedule itself. It is not an end-to-end automatic Homey integration. Test it on your own Homey; no live-device validation is included in this starter release.

For a continuous Homey adapter, follow the official [Homey Web API documentation](https://api.developer.homey.app/) and the authentication method available for your setup. A third-party Web API application needs its own registration/authentication; Peter’s saved login is not included or reusable. Keep any tokens on the server side, and request the narrowest access you need.

## Direct local equipment

Heat pumps, inverters and meters may expose local APIs or protocols such as Modbus. “It has Wi-Fi” does not establish that an accessible reading exists. Check the exact device model, documented protocol, register definitions, unit scaling and permissions first.

No device-specific polling or register map is shipped here. A connection supported on Peter’s equipment is not automatically supported on yours. Start with one read-only measurement, compare it against a trustworthy display, then have your adapter write schema-1 JSON.

Your adapter should:

- Read only what you need, with appropriate timeouts and polling intervals.
- Convert units to the documented format.
- Preserve measurement times and reject stale/unavailable values.
- Align independent source timestamps before calculating a building split.
- Write its output atomically (temporary file then rename).
- Keep device addresses, IDs, tokens and credentials outside `public/`.

## Recorder operation

Start `collector.mjs` with the input file your adapter produces. It checks the file every 30 seconds, validates it, and adds only samples newer than the last saved sample. It preserves original measurement times and refuses a source-label change to prevent accidental mixing. Archive the old history before switching sources. It does not backfill older out-of-order samples into an existing history.

A fresh sample can still contain stale values if an adapter supplied them incorrectly. The starter cannot verify hardware measurements; that responsibility stays with the adapter.

## Local display versus remote display

`server.mjs` binds only to `127.0.0.1` and allows only local Host headers. It is intended for the same computer running the dashboard. It deliberately does not expose unauthenticated home readings to your LAN or the internet. A phone, TV or another computer cannot use that loopback address to reach the recorder.

Deploying on a NAS or allowing other screens to read it requires a separately designed, authenticated network service. Keep the collector private and expose only the minimum read-only data. The video’s installed TV app and restricted access arrangement are outside this starter’s scope.
