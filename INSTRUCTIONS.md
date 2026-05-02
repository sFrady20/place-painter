Build an MVP app called Place Painter inside this existing Next.js project.

Before coding:
- Explore the existing project structure first.
- Identify the app router/page patterns, component conventions, styling system, import aliases, button/card/ui components, metadata patterns, and any existing utility functions.
- Follow the patterns already present in the template.
- Do not introduce conflicting architecture, duplicate styling systems, or unnecessary dependencies.
- Prefer existing components/utilities where appropriate.

Product goal:
Place Painter is a simple, viral, shareable map painting tool based on the “places I’d live” social trend.

Core concept:
Users paint areas of a US map with preference colors showing how likely they would be to live there.

Color meaning:
- Red = no / would not live there
- Orange = maybe not
- Yellow = maybe
- Green = yes / would live there

Core MVP features:
- Show a clean US map.
- Let users choose a paint color: red, orange, yellow, green.
- Let users paint directly on the map using a brush-like interaction.
- Support click/tap fill for states or regions where that is easier, but do not make state toggling the only interaction.
- Brush painting should be treated as a core feature, not a future enhancement.
- Users should be able to drag/paint across the map naturally.
- Include an eraser or clear/reset action.
- Make it mobile-friendly enough for touch painting.
- Make it screenshot/share friendly.

Implementation guidance:
- Start with the simplest reliable technical approach.
- Prefer SVG or canvas depending on what best supports brush painting.
- If using SVG states:
  - allow state/region fill by click
  - consider brush behavior by detecting pointer movement over regions
  - map painted regions to color values
- If using canvas:
  - support freeform brush painting over a US map silhouette/base
  - keep data structured so region-based stats can be added later
- Choose the approach that is easiest to maintain in this codebase.
- Keep the MVP focused and working.

Data model:
Each paintable region should support:
- id
- name
- color value: red | orange | yellow | green | null

Design requirements:
- Title: Place Painter
- Prompt/caption: “Paint the places you’d live.”
- Map should be the main visual focus.
- UI should be minimal and polished.
- Use existing theme/style conventions from the template.
- Avoid adding a heavy map library unless clearly justified.

Shareability:
- Add a simple export/download image feature if practical.
- Export should include:
  - painted map
  - “Place Painter”
  - “Places I’d live”
- URL sharing is nice-to-have, but lower priority than painting UX.

Future features to keep in mind, but do not build unless the structure naturally supports them:
- Different map sets beyond the US
- Tracking which regions are filled most often
- Custom colors
- Custom labels
- County/metro/custom region painting
- Public gallery or social sharing

Architecture expectations:
- Keep components small and readable.
- Suggested components:
  - PlacePainterPage or main route page
  - MapPainter
  - PaintToolbar
  - ExportButton or share utility
- Keep map data separate from UI components.
- Avoid overengineering.
- Do not create a separate design system.
- Do not rewrite unrelated template code.

Acceptance criteria:
- App runs in the existing Next.js project.
- User can select red/orange/yellow/green.
- User can paint areas of a US map with pointer drag/click.
- User can erase or reset.
- App works on desktop and mobile/touch.
- UI follows existing template patterns.
- Code is simple enough to extend later.