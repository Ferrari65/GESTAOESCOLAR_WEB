import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-implicit-any-catch": "off",
      
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      
      "prefer-const": "off",
      "no-var": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-alert": "off",
      
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
      
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-key": "warn",

      "import/no-anonymous-default-export": "off",
      "import/no-unresolved": "off",
    },
  },
];

export default eslintConfig;