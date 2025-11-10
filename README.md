### Dreamlink Forms

A form management system for DreamLink

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch main
bench --site dreamlink.localhost install-app dreamlink_forms
```

### Set Up

1. In the bench directory, create a file called build-and-start.sh
```bash
touch build-and-start.sh
```
2. Add the following shell script snippet to this file and save it.
```bash
#!/bin/bash
set -e
echo "→ Building React app..."
cd apps/dreamlink_forms/frontend/form_manager_app
npm install
npm run build
echo "✓ React build done."

echo "→ Building Frappe Bench..."
cd ../../../..
bench --site dreamlink.localhost clear-cache
bench build
echo "✓ Frappe build done."

echo "→ Starting Frappe Bench..."
bench start
```
3. From the bench directory, navigate to `apps/dreamlink_forms/frontend/form_manager_app`.
```bash
cd apps/dreamlink_forms/frontend/form_manager_app
```
4. Clone the `dreamlink-forms` project
```bash
git clone https://github.com/raneesh-gomez/dreamlink-forms.git
```
5. Overwrite the `vite.config.ts` file with the following
```json
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/assets/dreamlink_forms/form_manager_app/',
  build: {
    outDir: path.resolve(__dirname, '../../dreamlink_forms/public/form_manager_app'),
    emptyOutDir: true,
    manifest: 'manifest.json', // Explicitly set manifest name
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
})
```

6. Create a `.env.local` file in the project root and add the following env vars.
```env
VITE_FRAPPE_URL=http://dreamlink.localhost:8000
VITE_FRAPPE_TOKEN=<frappe token goes here>
VITE_GOOGLE_MAPS_API_KEY=<google maps api key goes here>
```

### Running Frappe

1. From the bench directory, run `./build-and-start.sh`.
2. Navigate to dreamlink.localhost:8000 in your browser.


### License

MIT
