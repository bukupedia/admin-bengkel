# Admin Bengkel (Beta-2)

## Changelog

**Created new CSS file:**
- `responsive-table.css` - Contains responsive table styles

**Updated HTML files:**
- pelanggan.html - Added responsive wrapper with `data-label` attribute
- sparepart.html - Added responsive wrapper with `data-label` attribute
- servis.html - Added responsive wrapper with `data-label` attribute

**Updated JavaScript modules:**
- pelanggan.js - Added data-label attributes to td elements
- sparepart.js - Added data-label attributes to td elements
- servis.js - Added data-label attributes to td elements

**How the responsive tables work:**
- On desktop: Tables display normally with horizontal scroll if needed
- On mobile (<768px): Tables transform into card-style layout where each row becomes a block, with column labels displayed before each value (e.g., "Nama: John Doe" instead of just "John Doe" in a cell)
