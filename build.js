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
}).then(() => {
  console.log('Build complete! bundle.js generated successfully.');
}).catch(() => process.exit(1));
