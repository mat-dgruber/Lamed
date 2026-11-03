module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: { pathNot: '^(node_modules)' },
      to: { circular: true },
    },
    {
      name: 'no-domain-to-infrastructure',
      severity: 'error',
      from: { path: '^frontend/src/app/(core|domain)/' },
      to: {
        path: '^frontend/src/app/(infrastructure|adapters)/|^(?:@angular/|firebase|rxjs|https?://)',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'frontend/tsconfig.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.js', '.json'] },
  },
};
