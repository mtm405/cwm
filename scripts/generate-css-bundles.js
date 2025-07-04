/**
 * CSS Bundle Generator
 * Phase 3A.4: CSS Splitting and Lazy Loading
 * 
 * This script generates CSS bundles based on the configuration
 * and creates split CSS files for different loading strategies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CSS_BUNDLES, PAGE_CSS_MAPPING } from '../config/css-bundles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Output directories
const BUNDLE_OUTPUT_DIR = path.join(projectRoot, 'static', 'css', 'bundles');
const SPLIT_OUTPUT_DIR = path.join(projectRoot, 'static', 'css', 'split');

// Ensure output directories exist
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
}

// Read CSS file content
function readCSSFile(filePath) {
    const fullPath = path.join(projectRoot, filePath);
    try {
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf8');
        } else {
            console.warn(`⚠️ CSS file not found: ${fullPath}`);
            return '';
        }
    } catch (error) {
        console.error(`❌ Error reading CSS file ${fullPath}:`, error.message);
        return '';
    }
}

// Generate CSS bundle
function generateBundle(bundleName, bundleConfig) {
    console.log(`📦 Generating bundle: ${bundleName}`);
    
    let bundleContent = `/* CSS Bundle: ${bundleName} */\n`;
    bundleContent += `/* Generated on: ${new Date().toISOString()} */\n`;
    bundleContent += `/* Priority: ${bundleConfig.priority} */\n`;
    bundleContent += `/* Load Strategy: ${bundleConfig.loadStrategy} */\n\n`;
    
    // Combine all CSS files in the bundle
    bundleConfig.files.forEach(file => {
        const content = readCSSFile(file);
        if (content.trim()) {
            bundleContent += `/* === ${file} === */\n`;
            bundleContent += content;
            bundleContent += `\n/* === End ${file} === */\n\n`;
        }
    });
    
    // Write bundle file
    const bundleFileName = `${bundleName}.css`;
    const bundleFilePath = path.join(BUNDLE_OUTPUT_DIR, bundleFileName);
    
    fs.writeFileSync(bundleFilePath, bundleContent);
    console.log(`✅ Bundle created: ${bundleFileName}`);
    
    return {
        name: bundleName,
        file: bundleFileName,
        path: bundleFilePath,
        size: Buffer.byteLength(bundleContent, 'utf8')
    };
}

// Generate page-specific CSS files
function generatePageSpecificCSS(pageName, bundleNames) {
    console.log(`📄 Generating page-specific CSS: ${pageName}`);
    
    let pageContent = `/* Page-Specific CSS: ${pageName} */\n`;
    pageContent += `/* Generated on: ${new Date().toISOString()} */\n\n`;
    
    // Critical CSS first (inline)
    if (bundleNames.includes('critical')) {
        pageContent += `/* === CRITICAL CSS (Inline) === */\n`;
        CSS_BUNDLES.critical.files.forEach(file => {
            const content = readCSSFile(file);
            if (content.trim()) {
                pageContent += content + '\n';
            }
        });
        pageContent += `/* === End CRITICAL CSS === */\n\n`;
    }
    
    // Core CSS (async preload)
    if (bundleNames.includes('core')) {
        pageContent += `/* === CORE CSS (Async Preload) === */\n`;
        pageContent += `/* Link: <link rel="preload" href="/static/css/bundles/core.css" as="style" onload="this.onload=null;this.rel='stylesheet'"> */\n\n`;
    }
    
    // Other bundles (lazy load)
    bundleNames.forEach(bundleName => {
        if (bundleName !== 'critical' && bundleName !== 'core') {
            pageContent += `/* === ${bundleName.toUpperCase()} CSS (Lazy Load) === */\n`;
            pageContent += `/* Load: cssLoader.loadBundle('${bundleName}') */\n\n`;
        }
    });
    
    const pageFileName = `${pageName}.css`;
    const pageFilePath = path.join(SPLIT_OUTPUT_DIR, pageFileName);
    
    fs.writeFileSync(pageFilePath, pageContent);
    console.log(`✅ Page CSS created: ${pageFileName}`);
}

// Generate CSS loading manifest
function generateLoadingManifest(bundles) {
    console.log(`📋 Generating CSS loading manifest`);
    
    const manifest = {
        version: "1.0.0",
        generated: new Date().toISOString(),
        bundles: bundles.reduce((acc, bundle) => {
            acc[bundle.name] = {
                file: bundle.file,
                size: bundle.size,
                priority: CSS_BUNDLES[bundle.name].priority,
                loadStrategy: CSS_BUNDLES[bundle.name].loadStrategy
            };
            return acc;
        }, {}),
        pages: PAGE_CSS_MAPPING
    };
    
    const manifestPath = path.join(BUNDLE_OUTPUT_DIR, 'css-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ CSS manifest created: css-manifest.json`);
    
    return manifest;
}

// Main function
function main() {
    console.log('🚀 Starting CSS Bundle Generation...\n');
    
    // Ensure output directories exist
    ensureDirectoryExists(BUNDLE_OUTPUT_DIR);
    ensureDirectoryExists(SPLIT_OUTPUT_DIR);
    
    // Generate bundles
    const generatedBundles = [];
    Object.entries(CSS_BUNDLES).forEach(([bundleName, bundleConfig]) => {
        const bundle = generateBundle(bundleName, bundleConfig);
        generatedBundles.push(bundle);
    });
    
    console.log('\n📊 Bundle Generation Summary:');
    generatedBundles.forEach(bundle => {
        console.log(`  • ${bundle.name}: ${(bundle.size / 1024).toFixed(2)} KB`);
    });
    
    // Generate page-specific CSS
    console.log('\n📄 Generating page-specific CSS files...');
    Object.entries(PAGE_CSS_MAPPING).forEach(([pageName, bundleNames]) => {
        generatePageSpecificCSS(pageName, bundleNames);
    });
    
    // Generate loading manifest
    const manifest = generateLoadingManifest(generatedBundles);
    
    console.log('\n✅ CSS Bundle Generation Complete!');
    console.log(`📁 Bundles: ${BUNDLE_OUTPUT_DIR}`);
    console.log(`📁 Split CSS: ${SPLIT_OUTPUT_DIR}`);
    console.log(`📋 Manifest: ${path.join(BUNDLE_OUTPUT_DIR, 'css-manifest.json')}`);
    
    return {
        bundles: generatedBundles,
        manifest: manifest,
        success: true
    };
}

// Run if called directly
if (process.argv[1] === __filename) {
    main();
}

export { main as generateCSSBundles };
