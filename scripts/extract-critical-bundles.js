/**
 * Critical CSS Extractor for CSS Bundles
 * Phase 3A.4: CSS Splitting and Lazy Loading
 * 
 * This script extracts critical CSS from main files and creates
 * critical CSS bundles for immediate loading.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Critical CSS rules - these should be loaded immediately
const CRITICAL_CSS_RULES = [
    // Reset and base styles
    'html', 'body', '*', 'a', 'img',
    
    // Layout essentials
    '.container', '.row', '.col', '.flex', '.grid',
    
    // Header and navigation (above the fold)
    '.header', '.navbar', '.nav', '.menu', '.logo',
    '.modern-dashboard-header', '.header-modern',
    
    // Critical buttons and forms
    '.btn', '.button', '.form', '.input', '.select',
    '.btn-primary', '.btn-secondary', '.btn-success',
    
    // Loading states and skeletons
    '.loading', '.skeleton', '.spinner', '.progress',
    '.loading-skeleton',
    
    // Typography for immediate text rendering
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p',
    '.title', '.subtitle', '.text',
    
    // Essential visibility utilities
    '.hidden', '.show', '.visible', '.invisible',
    
    // Critical responsive utilities
    '.d-none', '.d-block', '.d-flex', '.d-grid',
    
    // Above-the-fold content
    '.hero', '.banner', '.welcome', '.intro',
    '.dashboard-summary', '.main-content'
];

// CSS Variables and custom properties (always critical)
const CRITICAL_CSS_PATTERNS = [
    /:root\s*\{[^}]*\}/g,           // CSS custom properties
    /@media\s*\([^)]*\)\s*\{[^}]*\}/g, // Media queries (responsive)
    /\.loading[^{]*\{[^}]*\}/g,     // Loading states
    /\.skeleton[^{]*\{[^}]*\}/g,    // Skeleton loaders
    /\.btn[^{]*\{[^}]*\}/g,         // Button styles
    /\.header[^{]*\{[^}]*\}/g,      // Header styles
    /\.navbar[^{]*\{[^}]*\}/g,      // Navigation styles
    /\.container[^{]*\{[^}]*\}/g,   // Container styles
    /\.flex[^{]*\{[^}]*\}/g,        // Flex utilities
    /\.grid[^{]*\{[^}]*\}/g,        // Grid utilities
    /h[1-6][^{]*\{[^}]*\}/g,        // Heading styles
    /body[^{]*\{[^}]*\}/g,          // Body styles
    /html[^{]*\{[^}]*\}/g,          // HTML styles
    /\*[^{]*\{[^}]*\}/g             // Universal selector
];

// Extract critical CSS from a CSS file
function extractCriticalCSS(cssContent) {
    let criticalCSS = '';
    
    // Extract patterns
    CRITICAL_CSS_PATTERNS.forEach(pattern => {
        const matches = cssContent.match(pattern);
        if (matches) {
            matches.forEach(match => {
                criticalCSS += match + '\n';
            });
        }
    });
    
    // Extract rules by selector
    CRITICAL_CSS_RULES.forEach(rule => {
        const escapedRule = rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`${escapedRule}[^{]*\\{[^}]*\\}`, 'g');
        const matches = cssContent.match(pattern);
        if (matches) {
            matches.forEach(match => {
                criticalCSS += match + '\n';
            });
        }
    });
    
    return criticalCSS;
}

// Create critical CSS bundles
function createCriticalBundles() {
    console.log('🚀 Extracting Critical CSS for Bundles...\n');
    
    const criticalDir = path.join(projectRoot, 'static', 'css', 'critical');
    const bundleDir = path.join(projectRoot, 'static', 'css', 'bundles');
    
    // Ensure critical directory exists
    if (!fs.existsSync(criticalDir)) {
        fs.mkdirSync(criticalDir, { recursive: true });
    }
    
    // Read main CSS files
    const mainCSSPath = path.join(projectRoot, 'static', 'css', 'main.css');
    const coreBundlePath = path.join(bundleDir, 'core.css');
    const dashboardBundlePath = path.join(bundleDir, 'dashboard.css');
    const authBundlePath = path.join(bundleDir, 'auth.css');
    
    let mainCSS = '';
    let coreCSS = '';
    let dashboardCSS = '';
    let authCSS = '';
    
    // Read files
    try {
        if (fs.existsSync(mainCSSPath)) {
            mainCSS = fs.readFileSync(mainCSSPath, 'utf8');
        }
        if (fs.existsSync(coreBundlePath)) {
            coreCSS = fs.readFileSync(coreBundlePath, 'utf8');
        }
        if (fs.existsSync(dashboardBundlePath)) {
            dashboardCSS = fs.readFileSync(dashboardBundlePath, 'utf8');
        }
        if (fs.existsSync(authBundlePath)) {
            authCSS = fs.readFileSync(authBundlePath, 'utf8');
        }
    } catch (error) {
        console.error('❌ Error reading CSS files:', error);
        return;
    }
    
    // Extract critical CSS
    console.log('📦 Extracting critical CSS from main.css...');
    const mainCritical = extractCriticalCSS(mainCSS);
    
    console.log('📦 Extracting critical CSS from core bundle...');
    const coreCritical = extractCriticalCSS(coreCSS);
    
    console.log('📦 Extracting critical CSS from dashboard bundle...');
    const dashboardCritical = extractCriticalCSS(dashboardCSS);
    
    console.log('📦 Extracting critical CSS from auth bundle...');
    const authCritical = extractCriticalCSS(authCSS);
    
    // Combine and deduplicate
    const combinedCritical = [
        '/* Critical CSS Bundle - Generated */\n',
        '/* Essential styles for immediate rendering */\n\n',
        mainCritical,
        coreCritical,
        dashboardCritical,
        authCritical
    ].join('\n');
    
    // Remove duplicates (basic deduplication)
    const uniqueRules = [...new Set(combinedCritical.split('\n'))];
    const finalCritical = uniqueRules.join('\n');
    
    // Write critical CSS files
    const criticalFiles = [
        { name: 'main.css', content: mainCritical },
        { name: 'dashboard.css', content: dashboardCritical },
        { name: 'auth.css', content: authCritical },
        { name: 'combined.css', content: finalCritical }
    ];
    
    criticalFiles.forEach(file => {
        const filePath = path.join(criticalDir, file.name);
        fs.writeFileSync(filePath, file.content);
        console.log(`✅ Created: ${file.name} (${(Buffer.byteLength(file.content, 'utf8') / 1024).toFixed(2)} KB)`);
    });
    
    // Update the critical bundle
    const criticalBundlePath = path.join(bundleDir, 'critical.css');
    fs.writeFileSync(criticalBundlePath, finalCritical);
    console.log(`✅ Updated: critical.css bundle (${(Buffer.byteLength(finalCritical, 'utf8') / 1024).toFixed(2)} KB)`);
    
    console.log('\n✅ Critical CSS Bundle Generation Complete!');
    console.log(`📁 Critical CSS: ${criticalDir}`);
    console.log(`📁 Critical Bundle: ${criticalBundlePath}`);
    
    return {
        criticalDir,
        criticalBundlePath,
        size: Buffer.byteLength(finalCritical, 'utf8'),
        files: criticalFiles.length
    };
}

// Run if called directly
if (process.argv[1] === __filename) {
    createCriticalBundles();
}

export { createCriticalBundles };
