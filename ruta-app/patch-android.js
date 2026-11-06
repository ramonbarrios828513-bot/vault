// Ajusta el proyecto Android generado por Capacitor: firma fija (para poder actualizar sin desinstalar),
// nombre visible y permisos. Se ejecuta en GitHub Actions después de «npx cap add android».
const fs = require('fs');
const path = require('path');
const gradle = path.join(__dirname, 'android', 'app', 'build.gradle');
let g = fs.readFileSync(gradle, 'utf8');
if (!g.includes('signingConfigs')) {
  const ks = process.env.RUTA_KS ? 'ruta-release.jks' : '../../keystore/ruta.jks';
  const pass = process.env.RUTA_KS_PASS || 'nissifarma-ruta';
  g = g.replace(/android\s*\{/, `android {
    signingConfigs {
        fija {
            storeFile file('${ks}')
            storePassword '${pass}'
            keyAlias 'ruta'
            keyPassword '${pass}'
        }
    }`);
  g = g.replace(/buildTypes\s*\{/, `buildTypes {
        debug { signingConfig signingConfigs.fija }`);
  g = g.replace(/release\s*\{/, `release {
            signingConfig signingConfigs.fija`);
  const run = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
  g = g.replace(/versionCode \d+/, 'versionCode ' + run).replace(/versionName "[^"]*"/, 'versionName "1.' + run + '"');
  fs.writeFileSync(gradle, g);
}
const mf = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
let m = fs.readFileSync(mf, 'utf8');
const perms = ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_LOCATION', 'POST_NOTIFICATIONS', 'WAKE_LOCK'];
perms.forEach((p) => { if (!m.includes(`android.permission.${p}"`)) m = m.replace('</manifest>', `    <uses-permission android:name="android.permission.${p}" />\n</manifest>`); });
fs.writeFileSync(mf, m);
console.log('Android ajustado');
