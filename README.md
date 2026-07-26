# EasyAutoFill

A free, open-source browser extension that auto-fills any form using your profile data. Supports multiple file formats (Markdown, JSON, TXT, CSV). 100% local — no data ever leaves your computer.

## Features

- **Multi-format profiles** — Upload your data as `.md`, `.json`, `.txt`, or `.csv`
- **Smart field detection** — Keyword, type-based, and fuzzy matching to map form fields to your data
- **Multiple profiles** — Switch between different profiles (e.g., "Tech", "Academic")
- **Per-domain mappings** — Save custom field mappings for specific websites
- **Visual feedback** — Fields highlight green when filled, yellow when unmatched
- **React/Angular/Vue compatible** — Dispatches native events so modern frameworks detect changes
- **Privacy first** — All data stored locally in IndexedDB. Zero tracking, zero telemetry
- **Export/Import** — Back up and restore your profiles as JSON

## Install (Chrome/Edge)

1. Download or clone this repo
2. Open `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select the `EasyAutoFill` folder
5. The extension icon appears in your toolbar

## Usage

1. Click the extension icon
2. Upload a profile file (see formats below)
3. Navigate to any form
4. Click the extension icon again → detected fields appear
5. Click **Auto-Fill All Fields**

## Supported Profile Formats

### Markdown (.md)
```markdown
# My Profile

## Personal Info
- Name: Jane Smith
- Email: jane@example.com
- Phone: +1-555-0100

## Professional Summary
Software engineer with 5 years of experience...

## Work Experience
### Senior Developer
**Company:** Acme Corp
**Duration:** 2022-Present
**Description:** Led frontend architecture...

## Education
- MSc Computer Science | MIT (2018-2020)
- BSc Mathematics | Stanford (2014-2018)

## Links
- LinkedIn: https://linkedin.com/in/janesmith
- GitHub: https://github.com/janesmith
```

### JSON (.json)
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0100",
  "summary": "Software engineer with 5 years...",
  "linkedin": "https://linkedin.com/in/janesmith"
}
```

### Plain Text (.txt)
```
Name: Jane Smith
Email: jane@example.com
Phone: +1-555-0100
Summary: Software engineer with 5 years...
```

### CSV (.csv)
```csv
name,email,phone,summary
Jane Smith,jane@example.com,+1-555-0100,Software engineer...
```

## File Structure

```
EasyAutoFill/
├── manifest.json
├── src/
│   ├── popup/          # Extension popup UI
│   ├── content/        # Page injection & field detection
│   ├── background/     # Service worker & IndexedDB
│   ├── utils/          # File parsing & field matching
│   └── icons/          # Extension icons
```

## How Matching Works

Fields are matched using a multi-strategy approach (highest confidence wins):

1. **Input type** — `type="email"` → profile email (95% confidence)
2. **Keyword map** — Label "Full Name" → profile name (70-95%)
3. **Direct key** — Field name tokens match profile key tokens (60-80%)
4. **Fuzzy match** — Levenshtein distance for typos/variations (50-60%)

## Privacy

- All data stored locally in your browser's IndexedDB
- No backend server, no API calls, no analytics
- No data collection of any kind
- Open source — audit the code yourself

## License

MIT
