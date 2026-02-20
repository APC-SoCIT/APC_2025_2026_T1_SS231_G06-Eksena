# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Deploy & preview the website

### 1. Preview locally (see your changes in the browser)

Build the static site, then serve it:

```bash
npm run build:web
npx serve dist
```

Open **http://localhost:3000** (or the URL shown in the terminal) to view the site.

After you make changes, run `npm run build:web` again, then refresh the browser.

### 2. Deploy to the internet (Vercel – free)

1. Create a free account at [vercel.com](https://vercel.com).
2. Install Vercel CLI: `npm i -g vercel` (or use `npx vercel`).
3. From the project folder run:
   ```bash
   npm run build:web
   npx vercel
   ```
4. Follow the prompts (link to your Vercel account if asked). Vercel will use the existing `vercel.json` (build command and `dist` output).
5. You’ll get a live URL like `https://e-ksena-xxx.vercel.app`.

To deploy again after changes: run `npm run build:web`, then `npx vercel --prod` for production.

### 3. Deploy with Expo EAS Hosting

If you use an Expo account:

```bash
npm run build:web
npx eas deploy
```

Use `npx eas deploy --prod` for a production URL. See [Expo Deploy](https://docs.expo.dev/deploy/web/).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
