# Internal iPhone testing

The iOS app bundles the existing Next.js static export in Capacitor 8. No game
server, login service, real advertising SDK, or paid purchase integration is added.
Game progress retains the `sixty-seven-aura-farm-v2` localStorage key. Android
package identity and gameplay are unchanged.

- Suggested App Store Connect name: **Six Seven Aura Farm Preview**
- Native display name: **6-7 Aura Farm**
- Bundle identifier: **com.sixtyseven.clicker**
- Marketing version: **0.1.0**
- iOS minimum: **15.0**; iPhone and iPad
- Apple team: **MM9BHUH2D5**
- App Store Connect ID: **6811652035**
- App Store provisioning profile: **T97Y36GADX** (created in Apple Developer)
- Xcode project / scheme: `ios/App/App.xcodeproj` / `App`
- Codemagic workflow: **ios-testflight**, internal testing only

The Apple app record and bundle profile have been created. The workflow requires
the existing **Pocket Codex Codemagic** integration and the App Store distribution
provisioning profile for this bundle to be available in Codemagic. No key or
certificate is stored in this repository. Add the user's existing internal tester
to the app's testing group and enable automatic build distribution there.

The release helper queries Apple's latest build across versions before assigning a
new build number, validates the archived IPA number, and performs one upload
attempt. Investigate an uncertain upload instead of uploading the same binary again.

## Local checks

```sh
npm ci
npm run lint
npm run build:web
npx cap sync ios
python3 tools/check-ios-bundle.py
python3 tools/test_testflight_release.py
```

The exported HTML, fonts, JavaScript and CSS are bundled. `next/font/google` downloads
the existing fonts during the build; it does not add runtime Google Font requests.
The app icon is rasterized from the repository's existing `public/icon.svg`.

The original source references `/sfx/six.mp3` and `/sfx/seven.mp3`, but neither
recording exists in the repository. Its existing Web Speech fallback remains in
place. Test audio, taps, reward-overlay completion, saved progress after restart,
safe-area layout and rotation on a physical iPhone before wider testing. These
checks do not claim that a Windows build has validated native iOS execution.

An initial scan of 72 tracked files found no common private-key, OpenAI, GitHub,
AWS access-key or Google API-key patterns. This is a scoped pattern scan, not proof
that all forms of secrets or release risks are absent. The build-tool dependency
`xcode` uses an override to uuid 11.1.1, matching the existing game pipelines.
