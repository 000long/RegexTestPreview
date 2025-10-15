import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Regex Test Preview extension is now active!');

    let disposable = vscode.commands.registerCommand('regex-test-preview.open', () => {
        const panel = vscode.window.createWebviewPanel(
            'regexTestPreview',
            'Regex Test Preview',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'testRegex':
                        const matches = testRegex(message.pattern, message.text, message.flags);
                        panel.webview.postMessage({ command: 'showMatches', matches: matches });
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function testRegex(pattern: string, text: string, flags: string): Array<{start: number, end: number, text: string}> {
    try {
        const regex = new RegExp(pattern, flags);
        const matches = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });

            // Avoid infinite loops with zero-length matches
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }
        }

        return matches;
    } catch (error) {
        console.error('Invalid regex pattern:', error);
        return [];
    }
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regex Test Preview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #1e1e1e;
            color: #d4d4d4;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 100%;
            height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
        }

        .input-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #ffffff;
        }

        .regex-input-row {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 15px;
        }

        .regex-input, .flags-input, .test-text {
            padding: 8px 12px;
            border: 1px solid #3c3c3c;
            background-color: #252526;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            border-radius: 3px;
            box-sizing: border-box;
        }

        .regex-input {
            flex: 1;
            height: 32px;
        }

        .flags-input {
            width: 80px;
            height: 32px;
            flex-shrink: 0;
        }

        .test-text-container {
            width: 100%;
            margin-bottom: 15px;
            position: relative;
        }

        .test-text {
            width: 100%;
            min-height: 300px;
            resize: vertical;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.5;
            overflow-y: auto;
        }

        .test-text:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
        }

        .regex-input:focus, .flags-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
        }

        .highlighted-text {
            width: 100%;
            min-height: 300px;
            padding: 8px 12px;
            border: 1px solid #3c3c3c;
            background-color: #252526;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            border-radius: 3px;
            box-sizing: border-box;
            resize: vertical;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.5;
            overflow-y: auto;
            cursor: text;
        }

        .match-highlight {
            background-color: #264f78;
            border-radius: 2px;
            padding: 1px 2px;
            margin: 0 1px;
            font-weight: bold;
        }

        .error {
            color: #f48771;
            font-size: 12px;
            margin-top: 5px;
        }

        .status {
            margin-top: 10px;
            font-size: 12px;
            color: #cccccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="input-group">
            <label for="regex">Regular Expression:</label>
            <div class="regex-input-row">
                <input type="text" id="regex" class="regex-input" placeholder="Enter regex pattern..." value="">
                <input type="text" id="flags" class="flags-input" placeholder="flags" value="g">
            </div>
        </div>

        <div class="input-group">
            <label for="testText">Test Text:</label>
            <div class="test-text-container">
                <div id="highlightedText" class="highlighted-text"></div>
                <textarea id="testText" class="test-text" style="position: absolute; left: -9999px;" placeholder="Enter text to test against the regex..."></textarea>
            </div>
        </div>

        <div id="error" class="error" style="display: none;"></div>
        <div id="status" class="status">Ready to test regex</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let debounceTimer;

        // Get elements
        const regexInput = document.getElementById('regex');
        const flagsInput = document.getElementById('flags');
        const testTextArea = document.getElementById('testText');
        const highlightedDiv = document.getElementById('highlightedText');
        const errorDiv = document.getElementById('error');
        const statusDiv = document.getElementById('status');

        // Debounce function to avoid too frequent updates
        function debounce(func, wait) {
            return function executedFunction(...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(this, args), wait);
            };
        }

        function testRegex() {
            const pattern = regexInput.value;
            const flags = flagsInput.value;
            const text = testTextArea.value;

            errorDiv.style.display = 'none';

            if (!pattern) {
                statusDiv.textContent = 'Ready to test regex';
                highlightedDiv.textContent = text;
                return;
            }

            statusDiv.textContent = 'Testing...';

            vscode.postMessage({
                command: 'testRegex',
                pattern: pattern,
                text: text,
                flags: flags
            });
        }

        function highlightMatches(matches, text) {
            if (matches.length === 0) {
                highlightedDiv.textContent = text;
                statusDiv.textContent = 'No matches found';
                return;
            }

            // Create highlighted HTML
            let highlightedText = '';
            let lastIndex = 0;

            matches.forEach(match => {
                // Add text before the match
                highlightedText += escapeHtml(text.substring(lastIndex, match.start));
                // Add the highlighted match
                highlightedText += '<span class="match-highlight">' + escapeHtml(match.text) + '</span>';
                lastIndex = match.end;
            });

            // Add remaining text
            highlightedText += escapeHtml(text.substring(lastIndex));

            highlightedDiv.innerHTML = highlightedText;
            statusDiv.textContent = \`Found \${matches.length} match(es)\`;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function syncTextToTextarea() {
            testTextArea.value = highlightedDiv.textContent;
        }

        function syncTextareaToText() {
            highlightedDiv.textContent = testTextArea.value;
        }

        // Event listeners for real-time updates
        const debouncedTestRegex = debounce(testRegex, 300);

        regexInput.addEventListener('input', debouncedTestRegex);
        flagsInput.addEventListener('input', debouncedTestRegex);
        testTextArea.addEventListener('input', () => {
            syncTextareaToText();
            debouncedTestRegex();
        });

        // Handle highlighted div editing
        highlightedDiv.addEventListener('click', () => {
            // Switch to textarea for editing
            testTextArea.style.position = 'static';
            highlightedDiv.style.display = 'none';
            testTextArea.style.display = 'block';
            testTextArea.focus();
        });

        testTextArea.addEventListener('blur', () => {
            // Switch back to highlighted div
            syncTextToTextarea();
            testTextArea.style.position = 'absolute';
            testTextArea.style.left = '-9999px';
            highlightedDiv.style.display = 'block';
            testTextArea.style.display = 'none';
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.command) {
                case 'showMatches':
                    highlightMatches(message.matches, testTextArea.value);
                    break;
                case 'showError':
                    errorDiv.textContent = message.error;
                    errorDiv.style.display = 'block';
                    statusDiv.textContent = 'Error in regex pattern';
                    break;
            }
        });

        // Initial test
        debouncedTestRegex();
    </script>
</body>
</html>`;
}

export function deactivate() {}