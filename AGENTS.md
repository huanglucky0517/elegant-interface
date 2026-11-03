# Architecture rules
- Keep the lamination viewer in dedicated components with pure part-state and structure rules, so geometric display and UI controls share one source of truth.
- The lamination route is client-rendered for the interactive R3F canvas; the assembled axial-flux motor uses custom annular CAD geometry, not generic object stand-ins.
- Read motor material colors from semantic CSS tokens after mounting; keep generated surface textures local so the viewer has no external model or environment dependency.
- Generate part-tree identities with pure partComponents rules and share them with model interaction groups; selection and hover use PartTarget and instance overrides use effectivePart so individual controls and geometry remain linked.
- Use fixed physical scale from motorDimensions and shared numeric detail mappings for CAD annotations and geometry; diameter edits must not rescale unrelated parts. Mesh display is a visual triangulation overlay, not an analysis solver.