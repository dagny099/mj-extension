# Midjourney Image Tracker Documentation

This directory contains the complete MkDocs documentation site for the Midjourney Image Tracker Chrome extension.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Serve locally with live reload
mkdocs serve

# Open http://127.0.0.1:8000
```

### Building for Production

```bash
# Build static site
mkdocs build

# Output in site/ directory
```

## 📁 Structure

```
docs_site/
├── mkdocs.yml              # Main configuration
├── requirements.txt        # Python dependencies
├── docs/                   # Documentation source
│   ├── index.md           # Homepage
│   ├── getting-started/   # User onboarding
│   ├── features/          # Feature documentation  
│   ├── technical/         # Developer documentation
│   ├── development/       # Contributing guides
│   ├── how-to/           # Troubleshooting & guides
│   ├── blog/             # Blog posts & updates
│   ├── assets/           # CSS, JS, images
│   └── includes/         # Reusable content snippets
├── overrides/            # Theme customizations
└── .github/              # GitHub Actions deployment
```

## 🎨 Features

- **Material Design**: Modern, responsive interface
- **Search**: Full-text search with auto-complete
- **Navigation**: Organized sections with cross-references
- **Code Highlighting**: Syntax highlighting for multiple languages
- **Diagrams**: Mermaid diagram support
- **Social Cards**: Auto-generated social media previews
- **Git Integration**: Last updated timestamps and contributors
- **Blog**: Markdown-powered blog with categories and tags
- **Accessibility**: WCAG compliant with keyboard navigation

## 🔧 Configuration

### Key Settings

- **Theme**: Material for MkDocs with custom colors
- **Plugins**: Search, minify, git integration, social cards, blog
- **Extensions**: PyMdown for enhanced Markdown features
- **Navigation**: Hierarchical with section indices

### Customization

**Colors**: Edit `mkdocs.yml` palette section for brand colors
**Styling**: Custom CSS in `docs/assets/stylesheets/extra.css`
**JavaScript**: Custom scripts in `docs/assets/javascripts/`

## 📝 Writing Content

### Markdown Extensions

The site supports enhanced Markdown features:

- **Admonitions**: `!!! info`, `!!! warning`, etc.
- **Code Blocks**: Syntax highlighting with line numbers
- **Tables**: GitHub-flavored table support
- **Diagrams**: Mermaid flowcharts and sequence diagrams
- **Cards**: Grid layouts for features and links
- **Tabs**: Content organization with tabbed interfaces

### Content Guidelines

- Use descriptive headings and consistent structure
- Include code examples with proper language tags
- Add accessibility attributes to images and diagrams
- Cross-reference related sections with internal links
- Follow the established tone (concise, helpful, technical)

## 🚀 Deployment

### GitHub Pages (Automatic)

The site auto-deploys to GitHub Pages when changes are pushed to `main`:

1. GitHub Actions builds the site
2. Deploys to `https://dagny099.github.io/mj-extension`
3. Updates are live within minutes

### Manual Deployment

```bash
# Build and deploy to gh-pages branch
mkdocs gh-deploy

# Force deployment (use with caution)
mkdocs gh-deploy --force
```

## 🔍 Development Tips

### Live Reload

```bash
# Start development server with live reload
mkdocs serve --dev-addr=127.0.0.1:8000

# Auto-reload on file changes
# Great for iterating on content and styling
```

### Content Validation

```bash
# Build with strict mode (fails on warnings)
mkdocs build --strict

# Check for broken links
mkdocs build --strict --verbose
```

### Plugin Debugging

```bash
# Verbose output for plugin debugging
mkdocs serve --verbose

# Check plugin configuration
mkdocs config-inspector
```

## 📊 Analytics & Performance

### Built-in Features

- **Search Analytics**: Track search queries and popular content
- **Social Cards**: Automatic Open Graph image generation
- **Performance**: Minified CSS/JS for fast loading
- **SEO**: Proper meta tags and structured navigation

### Optional Integrations

- **Google Analytics**: Add tracking ID to `mkdocs.yml`
- **Social Media**: Automatic social card generation
- **Comments**: Can integrate with Disqus or similar

## 🐛 Troubleshooting

### Common Issues

**Build Failures**:
- Check `requirements.txt` versions
- Verify Python 3.8+ compatibility
- Run `mkdocs build --verbose` for details

**Plugin Errors**:
- Update to latest MkDocs Material version
- Check plugin compatibility with current MkDocs version
- Disable problematic plugins temporarily

**Navigation Issues**:
- Verify file paths in `mkdocs.yml`
- Check that referenced files exist
- Use relative paths for internal links

### Getting Help

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material for MkDocs Guide](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Issues](https://github.com/dagny099/mj-extension/issues)

## 🤝 Contributing

### Content Contributions

1. Fork the repository
2. Create a feature branch
3. Edit content in `docs/` directory
4. Test locally with `mkdocs serve`
5. Submit a pull request

### Style Improvements

1. Edit CSS in `docs/assets/stylesheets/extra.css`
2. Test responsive design on multiple screen sizes
3. Verify accessibility with browser dev tools
4. Document any new CSS classes or utilities

### Documentation Structure

When adding new sections:

1. Create directory in `docs/`
2. Add `index.md` for section overview
3. Update navigation in `mkdocs.yml`
4. Cross-reference from relevant existing pages
5. Add appropriate tags and categories

---

This documentation site showcases the Midjourney Image Tracker project with comprehensive guides, technical references, and user-friendly navigation. It's designed to serve both end users and developers contributing to the project.