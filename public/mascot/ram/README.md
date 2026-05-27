# Ram Spine assets

This folder is wired for the official Spine 3.6 WebGL runtime.

Assets:

- `ram.json` converted from `ram.skel` with `wang606/SpineSkeletonDataConverter` v3.7
- `ram.atlas`
- `ram.png`
- `ram.skel` binary source/reference

The converted JSON keeps Spine version `3.6.39`. The component prefers animation `24_idle`; if a future JSON export does not contain it, the first animation in the JSON is used.
