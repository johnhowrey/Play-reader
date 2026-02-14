export default function ScriptFormats() {
  return (
    <>
      <h1>Script Formats</h1>
      <p>
        Play Reader supports three import methods. The parser automatically
        detects which format you&apos;re using based on the content.
      </p>

      <h2>Fountain Format</h2>
      <p>
        <a href="https://fountain.io/syntax">Fountain</a> is the industry-standard
        plain text screenplay format. Play Reader implements the core Fountain spec:
      </p>

      <h3>Title Page</h3>
      <pre><code>{`Title: My Screenplay
Author: Jane Smith
Draft date: 2024-01-15`}</code></pre>
      <p>Key-value pairs at the top of the file. The <code>Title:</code> value becomes the script title.</p>

      <h3>Scene Headings</h3>
      <pre><code>{`INT. COFFEE SHOP - DAY
EXT. PARK - NIGHT
INT./EXT. CAR - CONTINUOUS`}</code></pre>
      <p>
        Lines starting with <code>INT.</code>, <code>EXT.</code>, <code>EST.</code>,
        or <code>INT./EXT.</code> are recognized as scene headings. You can also force
        a heading with a leading period: <code>.FLASHBACK</code>
      </p>

      <h3>Characters &amp; Dialogue</h3>
      <pre><code>{`JOHN
Hello there! How are you doing today?

MARY (V.O.)
I've been better, honestly.

JOHN
(concerned)
What happened?`}</code></pre>
      <p>
        Character names must be <strong>ALL CAPS</strong> on their own line. Dialogue
        follows on subsequent lines until a blank line. Character extensions like
        <code>(V.O.)</code>, <code>(O.S.)</code>, and <code>(CONT&apos;D)</code> are
        recognized.
      </p>

      <h3>Parentheticals</h3>
      <pre><code>{`JOHN
(whispering)
Can you hear me?`}</code></pre>
      <p>Lines wrapped in parentheses within a dialogue block.</p>

      <h3>Transitions</h3>
      <pre><code>{`CUT TO:
FADE OUT.

>INTERCUT WITH:`}</code></pre>
      <p>Lines ending with <code>TO:</code> in all caps, or forced with a leading <code>&gt;</code>.</p>

      <h3>Action</h3>
      <p>Everything that doesn&apos;t match the above patterns is treated as action/description.</p>

      <h2>Plain Text Format</h2>
      <p>
        For scripts that don&apos;t follow Fountain conventions, the plain text
        parser recognizes common play script formatting:
      </p>

      <h3>Colon Format (Most Common)</h3>
      <pre><code>{`JOHN: Hello there! How are you doing?
MARY: I've been better.
JOHN: What happened?`}</code></pre>
      <p>Character name in ALL CAPS followed by a colon, then dialogue on the same line. Continuation lines are included until a blank line or new character.</p>

      <h3>Indented Format</h3>
      <pre><code>{`JOHN
    Hello there! How are you doing?

MARY
    I've been better.`}</code></pre>
      <p>ALL CAPS name on its own line, dialogue on subsequent lines.</p>

      <h3>Stage Directions</h3>
      <pre><code>{`[John enters from stage left]
(The lights dim slowly)`}</code></pre>
      <p>Text in square brackets <code>[ ]</code> or parentheses <code>( )</code> on its own line.</p>

      <h3>Headings</h3>
      <pre><code>{`ACT I
SCENE 1
ACT II
SCENE IV
PROLOGUE
EPILOGUE`}</code></pre>
      <p>Lines starting with ACT, SCENE, PROLOGUE, EPILOGUE, or INTERMISSION.</p>

      <h2>Scrivener Projects</h2>
      <p>
        Scrivener stores projects as <code>.scriv</code> bundles (folders).
        Play Reader reads these by:
      </p>
      <ol>
        <li>Finding the <code>.scrivx</code> XML project file</li>
        <li>Parsing the binder structure to determine document order</li>
        <li>Reading <code>content.txt</code> files from each document&apos;s data folder</li>
        <li>Concatenating text in the correct order</li>
        <li>Auto-detecting whether the combined text is Fountain or plain text</li>
      </ol>

      <blockquote>
        <strong>Note:</strong> Scrivener&apos;s native format uses RTF internally.
        If your project only contains RTF files (no plain text), use
        Scrivener&apos;s <strong>Compile</strong> feature or <strong>Sync with
        External Folder</strong> to export as <code>.txt</code> or <code>.fountain</code> first.
      </blockquote>

      <h2>Format Detection</h2>
      <p>
        When you upload a <code>.txt</code> file or paste text, Play Reader
        scores the content to decide which parser to use:
      </p>
      <ul>
        <li>Scene headings (<code>INT.</code>/<code>EXT.</code>) score +3 points toward Fountain</li>
        <li><code>Title:</code> header scores +2</li>
        <li>Other Fountain metadata (<code>Author:</code>, etc.) scores +1</li>
        <li>A score of 3+ triggers the Fountain parser; otherwise plain text</li>
      </ul>
      <p>
        Files with <code>.fountain</code> or <code>.spmd</code> extensions always
        use the Fountain parser regardless of content.
      </p>
    </>
  );
}
