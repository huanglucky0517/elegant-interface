# Architecture rules
- Keep the lamination viewer in dedicated components with pure part-state and structure rules, so geometric display and UI controls share one source of truth.
- The lamination route is client-rendered for the interactive R3F canvas; the assembled axial-flux motor uses custom annular CAD geometry, not generic object stand-ins.
- Read motor material colors from semantic CSS tokens after mounting; keep generated surface textures local so the viewer has no external model or environment dependency.
- Generate part-tree identities with pure partComponents rules and share them with model interaction groups; selection and hover use PartTarget and instance overrides use effectivePart so individual controls and geometry remain linked.
- Use fixed physical scale from motorDimensions and shared numeric detail mappings for CAD annotations and geometry; diameter edits must not rescale unrelated parts. Mesh display is a visual triangulation overlay, not an analysis solver.
- Share screen-oriented solid arrowheads between flux and dimension annotations so their direction remains legible during camera rotation.
- Keep conditional stator-yoke presence and winding phase assignment in pure model-state rules shared by geometry and the part tree; depth-test solid and highlight materials so selection does not bypass physical occlusion.
- Generate coil sleeves as local rounded hollow extrusions around each tooth, sharing one interaction identity across their axial layers so visibility and selection remain per coil.
- Call the local STEP service from the browser once per lamination page entry with a parameter snapshot, not from a hosted server; localhost must refer to the visitor's CAD service. Keep binary transport and download helpers separate from viewer geometry.