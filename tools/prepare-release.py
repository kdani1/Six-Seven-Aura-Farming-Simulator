from pathlib import Path
import os, re

path = Path('ios/App/App.xcodeproj/project.pbxproj')
number = os.environ['IOS_BUILD_NUMBER']
if not number.isdecimal() or int(number) < 1:
    raise ValueError('Invalid IOS_BUILD_NUMBER')
text, count = re.subn(r'CURRENT_PROJECT_VERSION = [0-9]+;', f'CURRENT_PROJECT_VERSION = {number};', path.read_text())
if count != 2:
    raise RuntimeError('Expected Debug and Release build number settings')
path.write_text(text)
