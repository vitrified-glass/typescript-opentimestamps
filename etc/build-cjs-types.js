// Derive the CommonJS declarations (dist/cjs/**/*.d.cts) from the ESM ones (dist/types/**/*.d.ts).
//
// The package is "type": "module", so every .d.ts in it describes an ES module, which a CommonJS
// consumer on NodeNext cannot require (TS1479). The .d.cts extension marks a declaration file as
// CommonJS whatever the package type is. Each relative specifier is rewritten from .js to .cjs so
// that it resolves to its sibling .d.cts, and each declaration map is carried over to match.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';

const from = './dist/types';
const to = './dist/cjs';

const relativeJsSpecifier = /((?:from\s+|import\()(['"])\.{1,2}\/[^'"]*?)\.js(\2)/g;

for (const entry of readdirSync(from, { recursive: true })) {
  const source = join(from, entry);
  const target = join(to, relative(from, source));

  if (source.endsWith('.d.ts')) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(
      target.replace(/\.d\.ts$/, '.d.cts'),
      readFileSync(source, 'utf8')
        .replace(relativeJsSpecifier, '$1.cjs$3')
        .replace(/(\/\/# sourceMappingURL=.*)\.d\.ts\.map$/m, '$1.d.cts.map'),
    );
  } else if (source.endsWith('.d.ts.map')) {
    const map = JSON.parse(readFileSync(source, 'utf8'));
    map.file = map.file.replace(/\.d\.ts$/, '.d.cts');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target.replace(/\.d\.ts\.map$/, '.d.cts.map'), JSON.stringify(map));
  }
}
