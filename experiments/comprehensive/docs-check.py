"""Check local doc paths/anchors and preserved Git object links without networking."""
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parents[2]
files = [root / 'README.md', root / 'lithent-agent-addon.md']
files += list((root / 'docs/performance-improvement').glob('*.md'))
files += [root / 'docs/benchmark/HANDOFF.md', root / 'docs/benchmark/COMPREHENSIVE_RESULTS.md', root / 'experiments/comprehensive/README.md', root / 'skills/lithent/SKILL.md', root / 'skills/lithent/reference/events.md', root / 'e2e/README.md']

def anchors(file):
    result = set()
    counts = {}
    fenced = False
    for line in file.read_text().splitlines():
        if line.lstrip().startswith('```'):
            fenced = not fenced
        if fenced:
            continue
        match = re.match(r'^#{1,6}\s+(.*)', line)
        if match:
            text = re.sub(r'[^\w\- ]', '', match[1].strip().lower())
            slug = text.replace(' ', '-')
            count = counts.get(slug, 0)
            counts[slug] = count + 1
            result.add(slug + ('-' + str(count) if count else ''))
        result.update(re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)', line))
    return result

local = 0
git = set()
for file in files:
    text = re.sub(r'```[^\n]*\n[\s\S]*?```', '', file.read_text())
    for link in re.findall(r'(?<!!)\[[^\]\n]+\]\(([^)]+)\)', text):
        link = link.strip().strip('<>')
        match = re.match(r'https://github.com/superlucky84/lithent/blob/([0-9a-f]{40})/(.+)', link)
        if match:
            git.add(match[1] + ':' + match[2].split('#')[0])
        if re.match(r'^[a-z]+:', link) or link.startswith('//'):
            continue
        name, _, anchor = link.partition('#')
        target = (file.parent / name).resolve() if name else file
        assert target.exists(), (file.relative_to(root), link)
        if anchor and target.suffix == '.md':
            assert anchor in anchors(target), (file.relative_to(root), link, sorted(anchors(target)))
        local += 1
for object_name in git:
    subprocess.run(['git', 'cat-file', '-e', object_name], cwd=root, check=True)
print({'localLinksAndAnchors': local, 'preservedGitObjects': len(git), 'pass': True})
