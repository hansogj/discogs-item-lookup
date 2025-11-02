# Discogs Item Lookup

A simple Node.js command-line tool and library to look up information about a specific music release from the Discogs API.

Given a Discogs Release ID, it returns:
- Artist name
- Item title (album/single name)
- A complete tracklist for that specific release
- The release year of the original master item

## Prerequisites

- Node.js (v18 or higher recommended)
- A Discogs Personal Access Token

### Getting a Discogs Token

1.  Log in to your Discogs account.
2.  Go to your [Developer Settings](https://www.discogs.com/settings/developers).
3.  Click "Generate new token".
4.  Copy the generated token. You will need it for configuration.

## Installation

You can clone the repository to run the tool.

```bash
git clone https://github.com/your-repo/discogs-lookup.git
cd discogs-lookup
npm install
```
After installation, you can run the CLI directly using `ts-node` or build it first.

## Configuration

The tool requires your Discogs token to authenticate with the API. Create a `.env` file in the root of the project and add your token:

```
# .env
DISCOGS_TOKEN=your_discogs_token_here
```

You can use the `.env.example` file as a template.

## Usage

### As a Command-Line Tool (CLI)

**Syntax:**
```bash
npx ts-node src/cli.ts <release-id> [options]
```

**Arguments:**
- `<release-id>`: (Required) The numeric ID of the release you want to look up. You can find this in the URL of a Discogs release page (e.g., for `https://www.discogs.com/release/249504-Daft-Punk-One-More-Time`, the ID is `249504`).

**Options:**
- `-t, --token <token>`: Use a specific Discogs token, overriding any token set in a `.env` file.
- `-h, --help`: Display help information.

**Example:**

```bash
$ npx ts-node src/cli.ts 249504

🔍 Looking up Discogs release ID: 249504...

--- Release Information ---
Artist:       Daft Punk
Title:        One More Time
Release Year: 2000
Master Year:  2001
Discogs URL:  https://www.discogs.com/release/249504
---------------------------

--- Tracklist ---
A     One More Time (Short Radio Edit)
B     One More Time (Unplugged)
-----------------
```

### As a Library

You can also use the core lookup function within your own Node.js projects.

**Example:**

```javascript
// my-script.ts
import { lookupRelease, DiscogsApiError } from './src/index';

async function getMyFavoriteAlbumInfo() {
  const releaseId = '249504';
  
  // The function automatically uses the DISCOGS_TOKEN from your .env file.
  // Alternatively, you can pass the token as a second argument:
  // const token = 'your_personal_token';
  // const data = await lookupRelease(releaseId, token);
  
  try {
    const data = await lookupRelease(releaseId);
    console.log(`Successfully fetched data for: ${data.artist} - ${data.title}`);
    console.log('Tracks:', data.tracks);
    console.log(`Originally released in ${data.masterYear}.`);
  } catch (error) {
    if (error instanceof DiscogsApiError) {
      console.error(`API Error: ${error.message}`);
    } else {
      console.error(`An unexpected error occurred:`, error);
    }
  }
}

getMyFavoriteAlbumInfo();
```

The `lookupRelease` function returns a promise that resolves to an object with the following structure:
```typescript
interface LookupResult {
  artist: string;
  title: string;
  tracks: { position: string; title: string }[];
  masterYear: number;
  releaseYear: number;
  discogsUrl: string;
}
```