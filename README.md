
##  Project Overview

This repository contains the full implementation of a **custom Shopify Product Detail Page (PDP)** for the *Process Creative* theme, built from the ground up with independent Liquid sections, modular CSS, and a unified JavaScript layer.  
The project replaces the default Horizon PDP structure with a clean, performant, and scalable architecture aligned with Shopify’s best practices.

---

# Process PDP – Live Preview

🔗 **Live Store Preview:** [https://process-pdp-juan.myshopify.com/#1039fc2a9180fb9a05d7bf90b44e26d6](https://process-pdp-juan.myshopify.com/#1039fc2a9180fb9a05d7bf90b44e26d6)

>  **Access note:**  
> This store is password-protected.  
> Please request access to the preview password if you’d like to explore the live implementation.



###  Design Decisions

- **Modularity over Monoliths:**  
  Each PDP component (gallery, customise section, editorial block, recommendations) was developed as an independent `.liquid` section.  
  This ensures maximum reusability and separation of concerns.

- **Scoped JavaScript:**  
  All interactive logic was extracted from inline `<script>` blocks into a single file (`pdp-scripts.js`), scoped per section via `[data-section-id]`.  
  This allows Shopify’s Theme Editor and section reload events (`shopify:section:load`) to behave predictably.

- **Semantic & Maintainable Markup:**  
  Classes follow a `pc-*` naming convention for consistent scoping.  
  Accessibility and semantic HTML (e.g., `aria-*`, headings, and button roles) were prioritized.

- **Design Fidelity:**  
  Pixel-perfect adherence to the Figma layout, using a 1440px base grid, Amiri and Matter typefaces, and subtle brand tones (`#FAFAF6` beige background applied behind header and PDP).

---

###  Metafield / Metaobject Setup

To enable dynamic content while keeping control of layout:

- **Product-level metafields** were used for:
  - `custom.metal_dot_image` – to render visual material swatches.  
  - `custom.finish_tile_image` – to display surface finishes for variants.  
  - `custom.side_video_2` – optional video source for “Behind the Ring” section.

- **Fallback logic** in Liquid ensures safe rendering if metafields are empty:
  ```liquid
  {% if v.metafields.custom.finish_tile_image %}
    {% assign ft = v.metafields.custom.finish_tile_image %}
  {% elsif v.image %}
    {% assign finish_tile_url = v.image | image_url: width: 900 %}
  {% endif %}


###  Challenges Faced

Shopify Theme Architecture Conflicts:
The Horizon theme’s native header-group and header-component used embedded JS that conflicted with the new layout.
The solution: a fully isolated header (pc-header.liquid) with its own CSS and drawer logic.

Cross-section JavaScript Conflicts:
Shopify reloads sections dynamically inside the Theme Editor.
Consolidating all inline scripts into a single pdp-scripts.js solved scope bleed and improved reliability.

Visual Consistency on Different Devices:
Achieving pixel-level fidelity required custom spacing and @media tuning for large and small screens.

TypeScript Warnings:
When refactoring the JS, VSCode’s TS linter flagged implicit any types — fixed via inline annotations and clear function signatures.


### Summary

This project demonstrates:

Full replacement of a legacy theme section structure.

Clean modular front-end architecture in Shopify.

Optimized and accessible user experience.

Production-ready organization across Liquid, CSS, and JS.
