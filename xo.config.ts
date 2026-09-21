import {type FlatXoConfig} from 'xo';

export default [{
  space: 2,
  semicolon: true,
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
    reportUnusedInlineConfigs: 'error',
  },
}, {
  ignores: ['./*.*', './test/**'],
}] satisfies FlatXoConfig;
