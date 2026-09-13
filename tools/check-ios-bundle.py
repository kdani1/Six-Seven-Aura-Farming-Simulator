"""Check the actual static export and native identity, without Apple access."""
from pathlib import Path
import json
import plistlib
import re
from urllib.parse import unquote, urlsplit

root = Path(__file__).resolve().parents[1]
export = root / 'out'
html = (export / 'index.html').read_text(encoding='utf-8')
assets = re.findall(r'(?:src|href)="([^"]+)"', html)
for asset in assets:
    path = urlsplit(asset).path
    if path.startswith('/_next/'):
        target = export / unquote(path.lstrip('/'))
        assert target.is_file(), f'Missing exported asset: {path}'
assert not list(export.rglob('*.apk')), 'Do not bundle Android release APKs in iOS'
config = json.loads((root / 'ios/App/App/capacitor.config.json').read_text(encoding='utf-8'))
assert config['appId'] == 'com.sixtyseven.clicker'
assert not config.get('server', {}).get('url'), 'The app must use bundled assets'
assert not config.get('server', {}).get('allowNavigation'), 'Unexpected navigation allowlist'
assert (root / 'ios/App/App/public/index.html').read_bytes() == (export / 'index.html').read_bytes()
info = plistlib.loads((root / 'ios/App/App/Info.plist').read_bytes())
assert info['CFBundleDisplayName'] == '6-7 Aura Farm'
assert info['CFBundleVersion'] == '$(CURRENT_PROJECT_VERSION)'
assert info['CFBundleShortVersionString'] == '$(MARKETING_VERSION)'
assert not any(key.endswith('UsageDescription') for key in info), 'Game requires no sensitive permissions'
project = (root / 'ios/App/App.xcodeproj/project.pbxproj').read_text()
assert project.count('PRODUCT_BUNDLE_IDENTIFIER = com.sixtyseven.clicker;') == 2
assert project.count('MARKETING_VERSION = 0.1.0;') == 2
print('PASS: bundled static assets, native identity, dynamic build number and permission-free configuration')
