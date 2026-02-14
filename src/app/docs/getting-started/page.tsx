export default function GettingStarted() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>
        Get your first script playing in under a minute. No account needed, no
        API keys — everything runs in your browser.
      </p>

      <h2>Step 1: Import a Script</h2>
      <p>From the home screen, tap <strong>Import Script</strong>. You have three options:</p>
      <ol>
        <li>
          <strong>Upload File</strong> — Drag and drop (desktop) or tap to select a
          <code>.fountain</code> or <code>.txt</code> file
        </li>
        <li>
          <strong>Paste Text</strong> — Copy-paste your script directly. The parser
          auto-detects whether it&apos;s Fountain or plain text format.
        </li>
        <li>
          <strong>Scrivener Folder</strong> — Select your <code>.scriv</code> project folder.
          Reads the project structure and extracts text content.
        </li>
      </ol>

      <h2>Step 2: Review the Cast</h2>
      <p>
        After parsing, you&apos;ll see a review screen showing:
      </p>
      <ul>
        <li>Total character count, dialogue lines, and overall line count</li>
        <li>A <strong>Cast of Characters</strong> list with color coding and line proportions</li>
        <li>A <strong>Script Preview</strong> showing the formatted output</li>
      </ul>
      <p>If everything looks right, tap <strong>Save Script</strong> to store it locally.</p>

      <h2>Step 3: Assign Voices</h2>
      <p>
        In the reader, open the <strong>Voice Casting</strong> panel. Each character is
        auto-assigned a voice, but you can change any assignment:
      </p>
      <ul>
        <li>Use the dropdown to select from available browser voices</li>
        <li>Tap the play button next to each voice to preview it</li>
        <li>Voices are grouped by English vs. other languages</li>
        <li>Gender indicators (&#9794;/&#9792;) help you pick appropriate voices</li>
      </ul>

      <h2>Step 4: Play</h2>
      <p>
        Hit the play button. The script reads line by line, switching voices per
        character. The current line highlights and the view auto-scrolls.
      </p>

      <h3>Controls</h3>
      <table>
        <thead>
          <tr>
            <th>Input</th>
            <th>Desktop</th>
            <th>Mobile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Play / Pause</td>
            <td><code>Space</code></td>
            <td>Tap play button</td>
          </tr>
          <tr>
            <td>Stop</td>
            <td><code>Escape</code></td>
            <td>Tap stop button</td>
          </tr>
          <tr>
            <td>Skip forward</td>
            <td><code>→</code> arrow</td>
            <td>Skip button or swipe left</td>
          </tr>
          <tr>
            <td>Skip back</td>
            <td><code>←</code> arrow</td>
            <td>Skip button or swipe right</td>
          </tr>
          <tr>
            <td>Speed up</td>
            <td><code>↑</code> arrow</td>
            <td>Speed slider</td>
          </tr>
          <tr>
            <td>Slow down</td>
            <td><code>↓</code> arrow</td>
            <td>Speed slider</td>
          </tr>
          <tr>
            <td>Jump to line</td>
            <td>Click any line</td>
            <td>Tap any line</td>
          </tr>
          <tr>
            <td>Shortcut help</td>
            <td><code>?</code></td>
            <td>N/A</td>
          </tr>
        </tbody>
      </table>

      <h2>Step 5: Annotate</h2>
      <p>
        While listening (or any time), tap the <strong>+</strong> icon on any line to
        add a note. You can:
      </p>
      <ul>
        <li>Add a <strong>Note</strong> — general comment or idea</li>
        <li>Flag as <strong>Revisit</strong> — amber marker for lines you want to come back to</li>
        <li>View all notes via the <strong>Notes</strong> panel (sidebar on desktop, bottom sheet on mobile)</li>
        <li>Export all notes as a Markdown file via the download button in the header</li>
      </ul>

      <h2>Installing as a PWA</h2>
      <p>
        Play Reader is a Progressive Web App. To install it on your device:
      </p>
      <ul>
        <li><strong>iOS Safari</strong> — Tap Share → &quot;Add to Home Screen&quot;</li>
        <li><strong>Android Chrome</strong> — Tap the menu → &quot;Install app&quot; or &quot;Add to Home Screen&quot;</li>
        <li><strong>Desktop Chrome/Edge</strong> — Click the install icon in the address bar</li>
      </ul>
      <p>Once installed, Play Reader runs in its own window with lock screen playback controls.</p>
    </>
  );
}
