// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";

export default withNuxt([
  {
    plugins: {
      prettier: prettierPlugin,
      "legacy-import": importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "vue/multi-word-component-names": "off",
      "legacy-import/no-restricted-paths": [
        "error",
        {
          zones: [
            // 1. Dumb UI Rule
            // Global UI cannot depend on feature modules or stores
            {
              target: "./app/components/**",
              from: "./modules/**",
              message: "Dumb UI components cannot depend on Modules",
            },
            {
              target: "./app/components/**",
              from: "./stores/**",
              message: "Dumb UI components cannot depend on Stores",
            },
            // 2. Module Independence (Explicit Zones)
            // Add similar explicit pairs as new modules are introduced.
            {
              target: "./modules/Auth/**",
              from: "./modules/Billing/**",
              message:
                "Modules must be isolated. Use a shared layer or events to communicate.",
            },
            {
              target: "./modules/Billing/**",
              from: "./modules/Auth/**",
              message:
                "Modules must be isolated. Use a shared layer or events to communicate.",
            },
            // 3. Module Components Cannot Import Stores
            {
              target: "./modules/*/components/**",
              from: "./modules/*/stores/**",
              message:
                "Module components must be dumb. Move store logic to screens.",
            },
            {
              target: "./modules/*/components/**",
              from: "./stores/**",
              message:
                "Module components must be dumb. Move store logic to screens.",
            },
            // 4. Thin Pages Rule
            {
              target: "./app/pages/**",
              from: "./app/components/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./app/composables/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./stores/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./utils/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./app/layouts/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./app/plugins/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./app/middleware/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./app/assets/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./modules/*/components/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./modules/*/composables/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./modules/*/stores/**",
              message: "Pages should only import from modules/*/screens.",
            },
            {
              target: "./app/pages/**",
              from: "./modules/*/utils/**",
              message: "Pages should only import from modules/*/screens.",
            },
          ],
        },
      ],
    },
  },
  // Overrides for Pages -> axios
  {
    files: ["app/pages/**/*.{js,ts,vue}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message:
                "Pages should only import from modules/*/screens. Move logic to a module.",
            },
          ],
        },
      ],
    },
  },
]);
