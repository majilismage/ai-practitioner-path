# The AI Practitioner's Path

A 5-week intensive programme for enterprise professionals to master AI — from basic prompting to building production systems.

**Live Site:** https://majilismage.github.io/ai-practitioner-path/

## Project Structure

This is a static website built with vanilla JavaScript ES modules, designed to work on GitHub Pages without a build step.

```
ai-practitioner-path/
├── index.html              # Main entry point and shell
├── css/
│   ├── main.css            # Core layout and base styles
│   ├── themes.css          # Light/dark theme CSS custom properties
│   └── components.css      # Sidebar, cards, modules, diagrams
├── js/
│   ├── app.js              # Main initialization and error handling
│   ├── router.js           # SPA navigation and page management
│   ├── progress.js         # Progress tracking (localStorage)
│   └── content.js          # Module content loading and rendering
├── content/
│   ├── home.html           # Homepage content
│   ├── mission-1/
│   │   ├── module-1-1.html # Individual module content files
│   │   ├── module-1-2.html
│   │   └── module-1-3.html
│   ├── mission-2/
│   │   ├── module-2-1.html
│   │   ├── module-2-2.html (placeholder)
│   │   └── module-2-3.html (placeholder)
│   ├── mission-3/ ... (placeholders)
│   ├── mission-4/ ... (placeholders)
│   └── mission-5/ ... (placeholders)
├── assets/
│   └── diagrams/           # SVG diagrams (to be extracted)
├── index.html.bak          # Original monolithic file backup
└── README.md
```

## Technical Architecture

### Frontend Stack
- **Pure HTML/CSS/JavaScript** - No frameworks or build process required
- **ES Modules** - Modern JavaScript modules for clean separation
- **CSS Custom Properties** - For theming and maintainable styles
- **Fetch API** - Dynamic content loading from `/content/` files
- **localStorage** - Client-side progress persistence

### Security Implementation

This site implements multiple security layers appropriate for a public GitHub Pages deployment:

#### Content Security Policy (CSP)
Strict CSP headers via `<meta>` tags:
- `script-src 'self'` - Only scripts from same origin
- `style-src 'self' fonts.googleapis.com` - Styles from self + Google Fonts
- `font-src 'self' fonts.gstatic.com` - Fonts from self + Google Fonts CDN
- `object-src 'none'` - No plugins/objects allowed
- `frame-ancestors 'none'` - Prevent embedding in frames

#### Input Validation & Sanitization
- **localStorage validation** - Progress data validated before use
- **HTML sanitization** - Dynamic content sanitized before injection
- **No eval()** - No dynamic code execution
- **No inline handlers** - All event handlers in separate JS files

#### Additional Security Headers
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer info

### Content Management

#### Module Content Structure
Each module is stored as an HTML fragment with standardized sections:
- **Briefing** - Context and learning objectives
- **Core** - Main teaching content 
- **Exercise** - Hands-on practical work
- **Debrief** - Reflection and synthesis

#### Content Loading Strategy
- **Fetch-based loading** - Modules loaded dynamically on demand
- **Graceful fallbacks** - Placeholder content for missing modules
- **Error handling** - User-friendly messages for load failures
- **Caching** - In-memory cache to avoid duplicate requests

## Development Workflow

### Adding New Modules

1. **Create content file:**
   ```
   /content/mission-X/module-X-Y.html
   ```

2. **Follow the template structure:**
   ```html
   <div class="content-header">
       <div class="page-subtitle">Module X.Y</div>
       <h1 class="page-title">Module Title</h1>
       <p class="module-briefing">Brief description</p>
   </div>
   <div class="content-body">
       <!-- Cards with sections -->
   </div>
   ```

3. **Test locally** using a static file server (Python, Node.js, etc.)

4. **Deploy** by pushing to the `main` branch

### Editing Existing Content

Content files are plain HTML - edit them directly:
- No build process to regenerate
- Changes appear immediately on next module load
- Use proper HTML structure for consistency

### Styling Changes

- **Core styles:** Edit `/css/main.css`
- **Component styles:** Edit `/css/components.css`  
- **Theme colors:** Edit `/css/themes.css`
- All styles use CSS custom properties for consistency

## Security Considerations

### Public Repository Risks
- **No secrets** - All code and content is publicly visible
- **No API keys** - No server-side functionality requiring credentials
- **No user data** - Only progress tracking in localStorage
- **No PII** - Content is educational, not personal

### Content Integrity
- **Version control** - All changes tracked in git history
- **Static hosting** - No server-side attack vectors
- **CSP protection** - Browser-enforced security policies
- **Input validation** - All user inputs sanitized

### Privacy & Data
- **No tracking** - No analytics or user behavior tracking
- **Local storage only** - Progress data never leaves the user's browser
- **No cookies** - No persistent identifiers
- **No external requests** - Except Google Fonts (via CSP)

## Browser Support

### Minimum Requirements
- **ES6 Module support** (Chrome 61+, Firefox 60+, Safari 10.1+, Edge 79+)
- **CSS Custom Properties** (Chrome 49+, Firefox 31+, Safari 9.1+, Edge 79+)
- **Fetch API** (Chrome 42+, Firefox 39+, Safari 10.1+, Edge 14+)

### Graceful Degradation
- **Module loading errors** - Fallback error page displayed
- **CSP violations** - Logged but don't break functionality  
- **Storage failures** - Progress tracking disabled but content accessible

### Testing Strategy
- **Manual testing** across target browsers
- **Error handling verification** for network failures
- **CSP compliance** using browser dev tools
- **Accessibility** basic keyboard navigation and screen reader support

## Performance

### Loading Strategy
- **Shell loading** - Minimal HTML shell loads first
- **Progressive enhancement** - Content loads as needed
- **Image optimization** - SVG diagrams for scalability
- **Font optimization** - Google Fonts with preconnect hints

### Caching Strategy
- **Browser caching** - Static assets cached by browser
- **Memory caching** - Module content cached in JavaScript
- **localStorage** - Progress data persisted locally
- **No server caching** - Static hosting relies on CDN caching

## Deployment

### GitHub Pages Configuration
- **Source:** Deploy from `main` branch, root folder
- **Custom domain:** None (using default `.github.io` domain)
- **HTTPS:** Enforced by default on GitHub Pages
- **Build:** None required - direct file serving

### Deployment Process
1. **Local testing** - Test changes with local static server
2. **Commit changes** - Push to main branch
3. **Automatic deployment** - GitHub Pages rebuilds automatically
4. **Verification** - Check live site for proper functionality

## Contributing

### Content Guidelines
- **Practical focus** - Real-world application over theory
- **Progressive structure** - Each module builds on previous
- **Consistent format** - Follow established template structure
- **Security awareness** - No inline scripts or unsafe content

### Code Standards
- **ES6+ JavaScript** - Use modern language features
- **Semantic HTML** - Proper markup structure
- **CSS custom properties** - Use theme variables
- **Security first** - All changes must maintain CSP compliance

For questions or contributions, see the repository issues page.