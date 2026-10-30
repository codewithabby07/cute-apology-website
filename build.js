const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Safely parse .env if present
let envVars = {};
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        envVars[key] = val;
      }
    }
  });
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || envVars.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy static assets to dist
function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyFile(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
copyFile(path.join(__dirname, 'styles.css'), path.join(distDir, 'styles.css'));
copyFile(path.join(__dirname, 'intro.gif'), path.join(distDir, 'intro.gif'));
copyFile(path.join(__dirname, 'logo.webp'), path.join(distDir, 'logo.webp'));
copyDir(path.join(__dirname, 'assets'), path.join(distDir, 'assets'));
copyDir(path.join(__dirname, 'birthday-wish-template'), path.join(distDir, 'birthday-wish-template'));

// Build root bundle.js and dist/bundle.js
Promise.all([
  esbuild.build({
    entryPoints: ['src/index.jsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    outfile: 'bundle.js',
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
    }
  }),
  esbuild.build({
    entryPoints: ['src/index.jsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    outfile: 'dist/bundle.js',
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
    }
  })
]).then(() => {
  console.log('Build complete! Static assets and bundles prepared in root and dist/.');
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
