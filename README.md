# Nimblesheets

A character sheet / lightweight encounter manager for [Nimble 2](https://nimblerpg.com/pages/nimble) TTRPG.

Also designed to be used as an [Owlbear Rodeo](https://owlbear.rodeo) extension.

---

## Google Drive Integration

Nimblesheets can back up and restore characters and NPCs directly to/from your Google Drive. This requires a Google Cloud project with an OAuth 2.0 client ID.

### 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a new project (or select an existing one).
2. Navigate to **APIs & Services → Library** and enable the **Google Drive API**.

### 2. Create an OAuth 2.0 Client ID

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
2. Set **Application type** to **Web application**.
3. Under **Authorized JavaScript origins**, add every origin the app will run on:
   - `http://localhost:5778` for local development
   - Your production domain (e.g. `https://nimblesheets.example.com`)
4. Leave **Authorized redirect URIs** empty — the integration uses the token (implicit) flow, not a redirect.
5. Click **Create** and copy the **Client ID**.

> If this is a new project you may also be prompted to configure the OAuth consent screen. Set it to **External**, fill in the app name and support email, and add the scope `https://www.googleapis.com/auth/drive.file`.

### 3. Configure the environment

Add the client ID to your `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Restart the dev server (`npm run dev`) after editing `.env`.

For a production build, set `VITE_GOOGLE_CLIENT_ID` in your hosting environment's environment variables (Cloudflare Pages: **Settings → Environment variables**).

### How it works

| Button              | Location                       | What it does                                                                                  |
|---------------------|--------------------------------|-----------------------------------------------------------------------------------------------|
| Cloud upload icon   | Next to **Export All/Selected** | Saves a JSON backup of the selected (or all) characters/NPCs to the root of your Google Drive |
| Cloud download icon | Next to **Import from file**   | Opens the Google Drive file picker filtered to `.json` files; imports the selected backup     |

The first time you use either button you will be asked to sign in to Google and grant the app access to files it creates (`drive.file` scope — it cannot read any other Drive content). The token is remembered for the remainder of the browser session so subsequent backups do not require re-authentication.
