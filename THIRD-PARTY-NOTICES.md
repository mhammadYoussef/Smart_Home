# Asset and dependency review / v1.0.0

The distributable has been assembled from an explicit file list, not a copy of the personal project.

- **Application code and documentation:** newly authored for this starter. Its design and measurement rules are inspired by the personal PRMGR build. No recovered frontend modules with embedded personal configuration are shipped.
- **House illustration:** `public/assets/starter-house.svg` is new, generic vector artwork authored for this package. It is included under MIT. It is not Peter’s house, an archived screenshot, or third-party stock art.
- **Fonts:** system font stacks only. No downloaded fonts or font files.
- **Icons:** simple text/Unicode symbols, rendered by the user’s system fonts. No third-party icon library.
- **Data:** synthetic examples only. No personal telemetry, device inventories, cameras, account IDs, pairing information or saved login files.
- **Brand:** PRMGR appears as plain text, not as a copied logo asset. No trademark or endorsement rights are granted by the software license. Rebrand your redistributed product to avoid implying it is an official PRMGR release.
- **Dependencies:** the package has no npm or browser dependencies. Node.js is an external runtime downloaded separately; it is not redistributed. Browser QA tools used during development are not included or required.
- **Optional Docker recipe:** references the official `node:24-alpine` image but redistributes no image in the ZIP. Anyone distributing their own built image must review the runtime/base-image licenses and notices as well. This package’s MIT license does not relicense Node.js or Alpine.
- **Homey:** the example uses the documented HomeyScript API surface. It bundles no Homey SDK or other Homey source. Homey and other equipment names belong to their respective owners; this project is not presented as an endorsed integration.

The permissive MIT choice allows redistribution, modification and commercial use of the licensed code/artwork, subject to preserving the license notice. Official license text reference: https://spdx.org/licenses/MIT.html
