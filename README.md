# Discogs Item Lookup Web App

A simple web application to look up information about a specific music release from the Discogs API.

This application provides a user-friendly interface to fetch and display release details.

## Features

- **Artist Name:** Get the primary artist(s) for the release.
- **Item Title:** Find the album or single name.
- **Tracklist:** View the complete tracklist for the specific release version.
- **Release Years:** See both the year for this specific release and the year of the original master release.
- **Direct Link:** A convenient link to view the release directly on the Discogs website.

## How to Use

1.  Open the web application.
2.  Enter the numeric ID of the Discogs release you want to look up into the search bar. You can find this ID in the URL of a Discogs release page (e.g., for `https://www.discogs.com/release/249504-Daft-Punk-One-More-Time`, the ID is `249504`).
3.  Click the "Search" button or press Enter.
4.  The release information will be displayed on the screen.

## Configuration

This application requires a Discogs Personal Access Token to communicate with the Discogs API. The token must be provided as an environment variable named `DISCOGS_TOKEN` in the execution environment.

### Getting a Discogs Token

1.  Log in to your Discogs account.
2.  Go to your [Developer Settings](https://www.discogs.com/settings/developers).
3.  Click "Generate new token".
4.  Use this token for the `DISCOGS_TOKEN` environment variable.
