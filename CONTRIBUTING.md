# Contributing to Igor Szuniewicz Portfolio

Thank you for your interest in contributing to this portfolio project! This document provides guidelines for contributing to the codebase.

## 🎯 Project Overview

This is a professional portfolio website for Igor Szuniewicz, showcasing game audio design, interactive music systems, and audio development work. The site is built with vanilla HTML, CSS, and JavaScript for optimal performance and accessibility.

## 🚀 Getting Started

### Prerequisites

- Modern web browser
- Text editor (VS Code recommended)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Szunias/igorszuniewicz.git
   cd igorszuniewicz
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000`

3. **Make changes**
   - Edit HTML, CSS, or JavaScript files
   - Test in multiple browsers
   - Ensure responsive design works

## 📁 Project Structure

```
igorszuniewicz/
├── 📄 index.html              # Homepage
├── 👤 about.html              # About page
├── 🎵 music.html              # Music showcase
├── 📧 contact.html            # Contact page
├── 🎨 projects/               # Project pages
├── 🖼️ assets/                 # Static assets
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript
│   ├── images/                # Images & photos
│   └── icons/                 # Favicons & icons
├── 📚 docs/                   # Documentation
│   └── technical/             # Technical guides
├── 🌐 locales/                # Translation files
└── 📄 README.md               # This file
```

## 🛠️ Development Guidelines

### Code Style

- **HTML**: Use semantic HTML5 elements
- **CSS**: Follow BEM methodology for class naming
- **JavaScript**: Use modern ES6+ features
- **Indentation**: 2 spaces for HTML/CSS, 4 spaces for JavaScript

### File Naming

- Use kebab-case for file names: `my-file.html`
- Use descriptive names: `project-showcase.css`
- Group related files: `navigation-*.js`

### Performance

- Optimize images before adding
- Use lazy loading for non-critical content
- Minimize HTTP requests
- Compress assets when possible

## 🎨 Adding New Projects

1. **Create project page**
   ```bash
   # Create new project file
   touch projects/my-new-project.html
   ```

2. **Add project data**
   - Update `locales/projects.json`
   - Add translations for all languages (EN/PL/NL)

3. **Add project images**
   - Place in `assets/images/projects/`
   - Use WebP format when possible
   - Include multiple sizes

4. **Update navigation**
   - Add to `projects/index.html`
   - Update main navigation if needed

## 🌐 Translation Guidelines

### Adding New Languages

1. **Create language directory**
   ```bash
   mkdir locales/new-lang
   ```

2. **Copy existing files**
   ```bash
   cp locales/en/* locales/new-lang/
   ```

3. **Translate content**
   - Update all JSON files
   - Maintain same structure
   - Test language switching

### Translation Keys

- Use descriptive keys: `hero.title`, `projects.description`
- Group related content: `navigation.*`, `footer.*`
- Keep keys consistent across languages

## 🐛 Bug Reports

### Before Reporting

1. Check if the issue already exists
2. Test in multiple browsers
3. Clear browser cache
4. Check console for errors

### Bug Report Template

```markdown
**Bug Description**
Brief description of the issue

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: [e.g. Chrome 91]
- OS: [e.g. Windows 10]
- Device: [e.g. Desktop]

**Screenshots**
If applicable, add screenshots

**Additional Context**
Any other relevant information
```

## ✨ Feature Requests

### Before Requesting

1. Check if feature already exists
2. Consider if it fits the project scope
3. Think about implementation complexity

### Feature Request Template

```markdown
**Feature Description**
Brief description of the feature

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions you've thought about

**Additional Context**
Any other relevant information
```

## 🔧 Pull Request Process

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes**
   - Follow coding guidelines
   - Add tests if applicable
   - Update documentation

4. **Commit changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Use descriptive title
   - Explain changes in description
   - Link related issues

### PR Guidelines

- Keep PRs small and focused
- Test thoroughly before submitting
- Update documentation if needed
- Follow commit message conventions

## 📝 Commit Message Convention

Use the following format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(projects): add new project showcase
fix(navigation): resolve mobile menu issue
docs(readme): update installation instructions
```

## 🧪 Testing

### Manual Testing

- Test in Chrome, Firefox, Safari, Edge
- Test on mobile devices
- Test with different screen sizes
- Test accessibility features

### Automated Testing

Currently no automated tests, but consider adding:
- Unit tests for JavaScript functions
- Visual regression tests
- Performance tests

## 📋 Code Review Checklist

- [ ] Code follows style guidelines
- [ ] No console errors
- [ ] Responsive design works
- [ ] Accessibility standards met
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Translations updated (if needed)

## 🤝 Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully

### Be Professional

- Focus on the issue, not the person
- Provide constructive feedback
- Help others learn and grow

## 📞 Contact

For questions about contributing:

- **Email**: igorszuniewiczwork@gmail.com
- **LinkedIn**: [Igor Szuniewicz](https://www.linkedin.com/in/igor-szuniewicz-a6877a2a3)
- **GitHub**: [@Szunias](https://github.com/Szunias)

## 📄 License

This project is proprietary. All rights reserved by Igor Szuniewicz.

---

Thank you for contributing to this project! 🎵
