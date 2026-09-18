## Vibe
- Editorial streaming platform: dark-mode cinema interface inspired by Reelgood — deep forest-black canvas, cinematic poster imagery, minimal chrome

## Color
- Primary: #1DB954
- On Primary: #0A0A0A
- Accent: #E5A823
- On Accent: #0A0A0A
- Background: #0D1F1A
- Foreground: #F0F0EE
- Muted: #1A2E27
- Border: #243D35
- Secondary: #16302A

## Typography
- Heading: Inter (family: 'Inter', sans-serif, weight: 700, url: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap)
- Body: Inter (family: 'Inter', sans-serif, weight: 400, url: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap)

## Visual Language
- Core visual signature: Full-bleed cinematic backdrop with bottom-to-top gradient fade into background color — every section bleeds into the deep canvas; poster cards cast no shadow but gain a green-tinted border on hover
- Material & depth: Layered surfaces — hero sits at elevation 0 (full bleed), nav floats above with subtle background blur; cards are flat with a 1px border in border-color; active provider chips use secondary fill
- Containers & buttons: Movie poster cards — 2:3 aspect ratio, rounded-lg, border border-transparent hover:border-primary transition; primary CTA filled bg-primary text-on-primary font-semibold; secondary CTA bg-muted text-foreground; provider logos in rounded-full bg-secondary chips
- Layout rhythm: Sections alternate heading anchor-left with carousel flush-left; 60% canvas, 30% poster imagery, 10% primary/accent accents on ratings and CTAs; generous vertical spacing between sections

## Animation
- Entrance: Carousel rows fade-in + slide-up 300ms ease-out on mount
- Interaction: Poster card scale 1.05 on hover, 150ms ease; arrow buttons opacity 0 → 1 on carousel hover
- Scroll / transition: Hero backdrop parallax-lite; page route change fade 200ms

## Forbidden
- White or light backgrounds on any surface
- Large saturated primary color fills outside CTAs
- Generic frosted-glass overlays

## Additional Notes
- All text in English
- Dark theme only — no light mode toggle needed
- TMDB image CDN base: https://image.tmdb.org/t/p/
- Poster size: w342; backdrop size: w1280; provider logo: w45
- Star rating rendered as filled/half/empty SVG stars using Accent color
