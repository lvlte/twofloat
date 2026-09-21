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
}, {
  rules: {
    'capitalized-comments': 'off',
    'no-implicit-coercion': ['error', {
      allow: ['+'],
    }],
    'new-cap': ['error', {
      capIsNewExceptionPattern: '^DW',
    }],
    '@stylistic/brace-style': ['error', 'stroustrup', {
      allowSingleLine: true,
    }],
    '@stylistic/object-curly-spacing': 'off',
    '@stylistic/object-curly-newline': 'off',
    '@stylistic/no-multi-spaces': ['error', {
      ignoreEOLComments: true,
    }],
    '@stylistic/space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
      catch: 'always',
    }],
    '@stylistic/space-infix-ops': ['warn', {
      ignoreOperators: ['*', '/', '**', '+='],
    }],
    '@stylistic/no-mixed-operators': ['error', {
      groups: [
        ['&', '|', '^', '~', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
        ['&&', '||'],
        ['in', 'instanceof'],
      ],
      allowSamePrecedence: true,
    }],
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': ['error', {
      allowDefaultCaseForExhaustiveSwitch: false,
      considerDefaultExhaustiveForUnions: false,
      requireDefaultForNonUnion: false,
    }],
    '@typescript-eslint/strict-boolean-expressions': ['error', {
      allowAny: false,
      allowNullableBoolean: false,
      allowNullableEnum: false,
      allowNullableNumber: false,
      allowNullableObject: true,
      allowNullableString: false,
      allowNumber: true,
      allowString: true,
    }],
    'jsdoc/check-indentation': 'off',
    'jsdoc/require-asterisk-prefix': 'off',
    'unicorn/name-replacements': 'off',
    'unicorn/prefer-math-constants': 'off',
    'unicorn/consistent-boolean-name': 'off',
    'unicorn/no-negated-condition': 'off',
    'unicorn/no-constant-zero-expression': 'off',
    'unicorn/prefer-number-is-safe-integer': 'off',
    'unicorn/prefer-simple-condition-first': 'off',
    'unicorn/switch-case-braces': ['error', 'avoid'],
    'unicorn/numeric-separators-style': ['error', {
      onlyIfContainsSeparator: true,
    }],
  },
}, {
  files: ['src/pre/*'],
  rules: {
    '@stylistic/max-len': 'off',
    'unicorn/no-zero-fractions': 'off',
  },
}] satisfies FlatXoConfig;
