# Automatic Android delivery

Every push to `main` runs tests in GitHub Actions, then uploads that checkout to
the EAS workflow. EAS calculates the native fingerprint and looks for a successful
Android build with the same fingerprint, preview profile, and preview channel:

- No compatible build: produce an internally distributed APK.
- Compatible build: publish an Android-only over-the-air update to `preview`.

This follows Expo's [build-or-update workflow](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/)
and [GitHub Actions integration](https://expo.dev/blog/how-to-integrate-eas-workflows-with-github-actions).
There is no app-store submission. Production uses a separate channel.

## One-time setup

1. Sign in to the Expo account with access to the project already linked in
   `app.json` (`70293d4a-420f-4c74-b476-ac57b7927d90`).
2. Create an Expo access token and add it as the environment secret
   `EXPO_TOKEN` under **Settings → Environments → production → Environment secrets**
   in GitHub. The deployment job references this environment. Never commit
   the token. See [Expo's CI setup](https://docs.expo.dev/build/building-on-ci/).
3. If this project has no Android signing credentials in EAS, run
   `npx eas-cli@latest build --platform android --profile preview` once from an
   authenticated terminal and complete the keystore prompts. Retain the existing
   signing key if you already distribute this app.
4. Push these files to `main`. You can also use **Actions → Android preview → Run
   workflow** on `main` to retry after configuring credentials.

GitHub Actions uploads the checkout using `eas workflow:run`; linking the Expo
GitHub App is not required. Do not add a second push trigger to the EAS workflow.
The GitHub environment `production` supplies the token; the EAS build profile,
environment, and update channel are still `preview`. If you configure GitHub
environment protection rules, allow `main`; required reviewers must approve
each deployment before it can run.

## Installing and checking progress remotely

Open the repository's **Actions → Android preview** run from any browser. The EAS
step prints the workflow link, and GitHub waits for EAS success or failure. Open
that link to inspect individual jobs and download/install a new APK.

Install the first APK built with this configuration: older APKs do not have EAS
Update enabled. Compatible updates download on launch and normally take effect
on the next restart. When native dependencies or configuration change, install
the new APK; an OTA update cannot add native modules to an old installation.

## Native project handling

EAS uploads exclude `android/` and `ios/` via `.easignore`. Cloud builds generate
native projects from `app.json` and installed dependencies, ensuring the update
URL and fingerprint runtime policy are applied. The checked-in native projects
remain available for local work, but edits made only inside those directories do
not affect cloud builds. Express cloud native changes through Expo configuration
or config plugins. Use `npx expo prebuild --clean` only when you intend to replace
your local native projects with generated versions.

Builds, fingerprints, and updates use the `preview` EAS environment. Keep native
configuration variables consistent there. GitHub serializes deployments without
canceling an active EAS run; GitHub may replace an older pending run with the newest
push. If a GitHub job is manually canceled or times out, check/cancel its EAS run
before retrying, since the remote job can continue independently.
