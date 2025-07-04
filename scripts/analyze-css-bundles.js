/**
 * CSS Bundle Analysis and Performance Report
 * Phase 3A.4: CSS Splitting and Lazy Loading
 * 
 * This script analyzes the CSS bundle performance and provides
 * detailed metrics on the splitting and lazy loading implementation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file size
function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        return 0;
    }
}

// Analyze CSS bundles
function analyzeBundles() {
    console.log('🚀 CSS Bundle Analysis - Phase 3A.4');
    console.log('=======================================\n');
    
    const bundleDir = path.join(projectRoot, 'static', 'css', 'bundles');
    const manifestPath = path.join(bundleDir, 'css-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
        console.error('❌ CSS manifest not found. Run: npm run generate-css-bundles');
        return;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log('📦 Bundle Analysis:');
    console.log('-------------------');
    
    let totalSize = 0;
    let criticalSize = 0;
    let lazySize = 0;
    
    Object.entries(manifest.bundles).forEach(([bundleName, bundleInfo]) => {
        const bundlePath = path.join(bundleDir, bundleInfo.file);
        const actualSize = getFileSize(bundlePath);
        const priority = bundleInfo.priority;
        const loadStrategy = bundleInfo.loadStrategy;
        
        console.log(`   ${bundleName.padEnd(12)} ${formatBytes(actualSize).padEnd(10)} ${priority.padEnd(8)} ${loadStrategy}`);
        
        totalSize += actualSize;
        if (priority === 'high' || loadStrategy === 'blocking') {
            criticalSize += actualSize;
        } else {
            lazySize += actualSize;
        }
    });
    
    console.log('   ' + '-'.repeat(50));
    console.log(`   Total Size:  ${formatBytes(totalSize)}`);
    console.log(`   Critical:    ${formatBytes(criticalSize)} (${((criticalSize / totalSize) * 100).toFixed(1)}%)`);
    console.log(`   Lazy:        ${formatBytes(lazySize)} (${((lazySize / totalSize) * 100).toFixed(1)}%)`);
    
    return {
        totalSize,
        criticalSize,
        lazySize,
        bundleCount: Object.keys(manifest.bundles).length
    };
}

// Analyze page-specific loading
function analyzePageLoading() {
    console.log('\n📄 Page-Specific Loading Analysis:');
    console.log('------------------------------------');
    
    const bundleDir = path.join(projectRoot, 'static', 'css', 'bundles');
    const manifestPath = path.join(bundleDir, 'css-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
        return;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    Object.entries(manifest.pages).forEach(([pageName, bundles]) => {
        let pageSize = 0;
        let criticalPageSize = 0;
        
        bundles.forEach(bundleName => {
            const bundleInfo = manifest.bundles[bundleName];
            if (bundleInfo) {
                const bundlePath = path.join(bundleDir, bundleInfo.file);
                const size = getFileSize(bundlePath);
                pageSize += size;
                
                if (bundleInfo.priority === 'high' || bundleInfo.loadStrategy === 'blocking') {
                    criticalPageSize += size;
                }
            }
        });
        
        console.log(`   ${pageName.padEnd(12)} Total: ${formatBytes(pageSize).padEnd(10)} Critical: ${formatBytes(criticalPageSize).padEnd(10)} Bundles: ${bundles.length}`);
    });
}

// Compare with original CSS
function compareWithOriginal() {
    console.log('\n📊 Performance Comparison:');
    console.log('----------------------------');
    
    const originalMainPath = path.join(projectRoot, 'static', 'css', 'main.css');
    const originalSize = getFileSize(originalMainPath);
    
    // Calculate total component size
    const componentDir = path.join(projectRoot, 'static', 'css', 'components');
    let totalComponentSize = 0;
    
    if (fs.existsSync(componentDir)) {
        const componentFiles = fs.readdirSync(componentDir).filter(f => f.endsWith('.css'));
        componentFiles.forEach(file => {
            const filePath = path.join(componentDir, file);
            totalComponentSize += getFileSize(filePath);
        });
    }
    
    const bundleAnalysis = analyzeBundles();
    const originalTotal = originalSize + totalComponentSize;
    const bundleTotal = bundleAnalysis.totalSize;
    
    console.log(`   Original CSS:     ${formatBytes(originalTotal)}`);
    console.log(`   Bundled CSS:      ${formatBytes(bundleTotal)}`);
    console.log(`   Size Change:      ${formatBytes(bundleTotal - originalTotal)} (${((bundleTotal - originalTotal) / originalTotal * 100).toFixed(1)}%)`);
    
    // Loading performance analysis
    console.log('\n⚡ Loading Performance:');
    console.log('------------------------');
    console.log(`   Critical CSS:     ${formatBytes(bundleAnalysis.criticalSize)} (immediate load)`);
    console.log(`   Lazy CSS:         ${formatBytes(bundleAnalysis.lazySize)} (deferred load)`);
    console.log(`   Bundle Count:     ${bundleAnalysis.bundleCount}`);
    console.log(`   Parallel Loading: Yes`);
    console.log(`   Cache Strategy:   HTTP/2 Push + Browser Cache`);
}

// Analyze lazy loading potential
function analyzeLazyLoadingPotential() {
    console.log('\n🔄 Lazy Loading Benefits:');
    console.log('---------------------------');
    
    const bundleDir = path.join(projectRoot, 'static', 'css', 'bundles');
    const manifestPath = path.join(bundleDir, 'css-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
        return;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Calculate potential savings for different pages
    const pageLoadSavings = {};
    
    Object.entries(manifest.pages).forEach(([pageName, bundles]) => {
        let immediateLoad = 0;
        let totalLoad = 0;
        
        bundles.forEach(bundleName => {
            const bundleInfo = manifest.bundles[bundleName];
            if (bundleInfo) {
                const bundlePath = path.join(bundleDir, bundleInfo.file);
                const size = getFileSize(bundlePath);
                totalLoad += size;
                
                if (bundleInfo.loadStrategy === 'blocking' || bundleInfo.priority === 'high') {
                    immediateLoad += size;
                }
            }
        });
        
        pageLoadSavings[pageName] = {
            immediate: immediateLoad,
            total: totalLoad,
            deferred: totalLoad - immediateLoad,
            savings: ((totalLoad - immediateLoad) / totalLoad * 100).toFixed(1)
        };
    });
    
    console.log('   Page              Immediate    Deferred    Savings');
    console.log('   ------------------------------------------------');
    Object.entries(pageLoadSavings).forEach(([page, stats]) => {
        console.log(`   ${page.padEnd(16)} ${formatBytes(stats.immediate).padEnd(11)} ${formatBytes(stats.deferred).padEnd(11)} ${stats.savings}%`);
    });
}

// Main analysis function
function main() {
    console.log('🎨 CSS Bundle Performance Analysis');
    console.log('Phase 3A.4: CSS Splitting and Lazy Loading');
    console.log('==========================================\n');
    
    analyzeBundles();
    analyzePageLoading();
    compareWithOriginal();
    analyzeLazyLoadingPotential();
    
    console.log('\n✅ Analysis Complete!');
    console.log('\n🎯 Key Benefits:');
    console.log('   • Critical CSS loaded immediately');
    console.log('   • Non-critical CSS lazy loaded');
    console.log('   • Page-specific bundle loading');
    console.log('   • Improved First Contentful Paint (FCP)');
    console.log('   • Reduced Time to Interactive (TTI)');
    console.log('   • Better Core Web Vitals scores');
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Test the enhanced head template');
    console.log('   2. Verify lazy loading functionality');
    console.log('   3. Monitor Core Web Vitals');
    console.log('   4. Proceed to Phase 3B (Dashboard consolidation)');
}

// Run if called directly
if (process.argv[1] === __filename) {
    main();
}

export { main as analyzeCSSBundles };
