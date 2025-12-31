# Firebase Setup Guide - Step by Step

## ⚠️ IMPORTANT: Never Commit Credentials

**DO NOT:**

- ❌ Save the JSON file in your project folder
- ❌ Commit the JSON file to git
- ❌ Share the JSON file publicly

**DO:**

- ✅ Extract values from the JSON file
- ✅ Put them in a `.env` file (already in `.gitignore`)
- ✅ Keep the JSON file somewhere safe outside the project

---

## Step-by-Step Setup

### Step 1: Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the **gear icon** ⚙️ → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** in the popup
7. A JSON file will download (e.g., `your-project-firebase-adminsdk-xxxxx.json`)

### Step 2: Extract Values from JSON File

Open the downloaded JSON file. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

You need these 3 values:

- `project_id` → becomes `FIREBASE_PROJECT_ID`
- `client_email` → becomes `FIREBASE_CLIENT_EMAIL`
- `private_key` → becomes `FIREBASE_PRIVATE_KEY`

### Step 3: Create `.env` File

In your project root, create a `.env` file:

```bash
# Windows (PowerShell)
New-Item .env

# Windows (Command Prompt)
type nul > .env

# Mac/Linux
touch .env
```

### Step 4: Add Values to `.env`

Copy the values from the JSON file into your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**

- The `FIREBASE_PRIVATE_KEY` must be wrapped in **double quotes** `"`
- Keep all the `\n` characters (they represent newlines)
- Copy the ENTIRE private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Step 5: Verify `.env` File is Ignored

Check that `.env` is in your `.gitignore` (it should be already):

```bash
# Check .gitignore
cat .gitignore | grep .env
```

You should see `.env` listed. If not, add it.

### Step 6: Test Firebase Connection

```bash
npm install
npm run test:firebase
```

If you see ✅ messages, Firebase is working!

---

## What You've Tested So Far

✅ **Firebase Storage Layer** - The backend can read/write to Firestore  
✅ **API Endpoints** - Your serverless functions can use Firebase

❌ **Frontend → API Connection** - Not connected yet (frontend uses localStorage)

---

## Next Steps: Do You Need Step 4?

**You've already tested Firebase!** The `npm run test:firebase` command verified that:

- Firebase credentials work
- Firestore can create/read/update games
- The storage layer is functioning

**Step 4 is only needed if:**

- You want to test the API endpoints directly (with curl/Postman)
- You want to test the full app with frontend calling the API
- You're ready to connect the frontend to use Firebase instead of localStorage

**Currently your frontend uses `localStorage`**, so it doesn't call the API. If you want to use Firebase, you'll need to:

1. Modify the frontend to call API endpoints instead of localStorage
2. Then Step 4 becomes useful for local testing

**Options:**

- **Option A:** Skip Step 4, deploy to Vercel, and test there
- **Option B:** Do Step 4 to test API endpoints manually
- **Option C:** Connect frontend to API first, then do Step 4 to test everything locally

---

## Example: Converting JSON to .env

**From JSON file:**

```json
{
  "project_id": "golf-tracker-12345",
  "client_email": "firebase-adminsdk-abc123@golf-tracker-12345.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
}
```

**To .env file:**

```env
FIREBASE_PROJECT_ID=golf-tracker-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@golf-tracker-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## Where to Store the JSON File

Store the original JSON file somewhere safe:

- ✅ In a password manager (1Password, LastPass, etc.)
- ✅ In a secure cloud storage (encrypted)
- ✅ On your local machine (outside the project folder)
- ❌ NOT in the project folder
- ❌ NOT in git

If you lose it, you can always generate a new one from Firebase Console.

---

## Troubleshooting

### "Firebase credentials not set" error

- Make sure `.env` file exists in the project root
- Check that variable names are exactly: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Verify the private key is wrapped in double quotes

### "Invalid private key" error

- Make sure you copied the ENTIRE private key including the BEGIN/END lines
- Check that `\n` characters are present (they should be literal `\n` in the string)
- Verify the private key is wrapped in double quotes

### Private key format issues

The private key in the JSON file might have actual newlines. When copying to `.env`, you need to replace actual newlines with `\n`:

**In JSON (has real newlines):**

```
"private_key": "-----BEGIN PRIVATE KEY-----\n
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...
-----END PRIVATE KEY-----\n"
```

**In .env (use \n for newlines):**

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## Quick Checklist

- [ ] Downloaded JSON file from Firebase Console
- [ ] Extracted `project_id`, `client_email`, and `private_key`
- [ ] Created `.env` file in project root
- [ ] Added all 3 variables to `.env`
- [ ] Wrapped `FIREBASE_PRIVATE_KEY` in double quotes
- [ ] Verified `.env` is in `.gitignore`
- [ ] Stored JSON file somewhere safe (outside project)
- [ ] Ran `npm run test:firebase` and got ✅ messages

---

## For Vercel Deployment

When deploying to Vercel, add these same environment variables in:

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

The values are the same as in your `.env` file.
