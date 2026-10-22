// Phosphor 3.0.6's direct source exports pass a web-only className to native Svg.
// Remove that unsupported prop; keep the upstream types and icon drawing intact.
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '../node_modules/phosphor-react-native/src/lib/icon-base.tsx');
const source = fs.readFileSync(file, 'utf8');
const prop = '      className={`${name}-${weight}__svg-icon-phosphor`}\n';
if (source.includes(prop)) fs.writeFileSync(file, source.replace(prop, ''));
else if (source.includes('className=')) throw new Error('Phosphor source changed. Review its native Svg props.');
