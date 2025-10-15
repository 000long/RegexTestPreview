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
                        try {
                            const matches = testRegex(message.pattern, message.text, message.flags);
                            panel.webview.postMessage({ command: 'showMatches', matches: matches });
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            panel.webview.postMessage({
                                command: 'showError',
                                error: errorMessage
                            });
                        }
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
    if (!pattern || pattern.trim() === '') {
        return [];
    }

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
        throw error;
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

        .regex-input, .flags-input {
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

        .regex-input:focus, .flags-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
        }

        .editor-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            border: 1px solid #3c3c3c;
            border-radius: 3px;
            overflow: hidden;
            min-height: 300px;
            position: relative;
        }

        .canvas-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .test-text {
            position: relative;
            z-index: 2;
            width: 100%;
            flex: 1;
            resize: none;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.5;
            padding: 8px 12px;
            border: none;
            background: transparent;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
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
        <h1>Regex Test Preview</h1>

        <div class="input-group">
            <label for="regex">Regular Expression:</label>
            <div class="regex-input-row">
                <input type="text" id="regex" class="regex-input" placeholder="Enter regex pattern..." value="">
                <input type="text" id="flags" class="flags-input" placeholder="flags" value="g">
            </div>
        </div>

        <div class="input-group">
            <label for="testText">Test Text:</label>
            <div class="editor-container">
                <canvas id="highlightCanvas" class="canvas-background"></canvas>
                <textarea id="testText" class="test-text" placeholder="Enter text to test against the regex...">Hello World! This is a test. Test 123 456 789.</textarea>
            </div>
        </div>

        <div id="error" class="error" style="display: none;"></div>
        <div id="status" class="status">Ready to test regex</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let debounceTimer;
        let currentMatches = [];

        // Get elements
        const regexInput = document.getElementById('regex');
        const flagsInput = document.getElementById('flags');
        const testTextArea = document.getElementById('testText');
        const highlightCanvas = document.getElementById('highlightCanvas');
        const ctx = highlightCanvas.getContext('2d');
        const errorDiv = document.getElementById('error');
        const statusDiv = document.getElementById('status');

        // Text measurement cache for performance
        const textMetricsCache = new Map();

        // Get accurate text measurements
        function getTextMetrics(text) {
            if (!textMetricsCache.has(text)) {
                ctx.font = '14px Consolas, Monaco, monospace';
                const metrics = ctx.measureText(text);
                textMetricsCache.set(text, metrics);

                // Clear cache if it gets too large
                if (textMetricsCache.size > 1000) {
                    textMetricsCache.clear();
                }
            }
            return textMetricsCache.get(text);
        }

        // Canvas setup and text metrics
        function setupCanvas() {
            const computedStyle = window.getComputedStyle(testTextArea);
            const rect = testTextArea.getBoundingClientRect();

            // Set canvas size to match textarea with device pixel ratio for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            highlightCanvas.width = rect.width * dpr;
            highlightCanvas.height = rect.height * dpr;
            highlightCanvas.style.width = rect.width + 'px';
            highlightCanvas.style.height = rect.height + 'px';

            // Scale context for sharp rendering
            ctx.scale(dpr, dpr);

            // Set font to match textarea
            ctx.font = '14px Consolas, Monaco, monospace';
            ctx.textBaseline = 'alphabetic';

            // Clear canvas
            ctx.clearRect(0, 0, rect.width, rect.height);
        }

        // Calculate accurate text position using measurements
        function getTextPosition(text, index) {
            const lines = text.substring(0, index).split('\\n');
            const currentLine = lines.length - 1;
            const lineText = lines[lines.length - 1];

            // Measure actual text width
            const textMetrics = getTextMetrics(lineText);
            const textWidth = textMetrics.width;

            const fontSize = 14;
            const lineHeight = 21; // 1.5 * font-size
            const padding = 12; // 12px padding

            return {
                x: textWidth + padding,
                y: currentLine * lineHeight + lineHeight - 2 // Adjust for better alignment
            };
        }

        // Get text width for a specific range
        function getTextWidth(text, start, end) {
            const substring = text.substring(start, end);
            const metrics = getTextMetrics(substring);
            return metrics.width;
        }

        // Draw highlights on canvas with improved accuracy
        function drawHighlights(matches, text) {
            if (!matches || matches.length === 0) {
                ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
                return;
            }

            // Clear canvas
            const rect = testTextArea.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            // Set highlight style
            ctx.fillStyle = 'rgba(38, 79, 120, 0.6)';

            // Group matches by line for better rendering
            const matchesByLine = new Map();

            matches.forEach(match => {
                if (typeof match.start === 'number' &&
                    typeof match.end === 'number' &&
                    typeof match.text === 'string') {

                    try {
                        const startLines = text.substring(0, match.start).split('\\n');
                        const endLines = text.substring(0, match.end).split('\\n');
                        const startLine = startLines.length - 1;
                        const endLine = endLines.length - 1;

                        if (!matchesByLine.has(startLine)) {
                            matchesByLine.set(startLine, []);
                        }

                        matchesByLine.get(startLine).push({
                            start: match.start,
                            end: match.end,
                            text: match.text,
                            startLine: startLine,
                            endLine: endLine,
                            startColumn: startLines[startLines.length - 1].length,
                            endColumn: endLines[endLines.length - 1].length
                        });
                    } catch (error) {
                        console.error('Error processing match:', error);
                    }
                }
            });

            // Draw highlights line by line
            const fontSize = 14;
            const lineHeight = 21;
            const padding = 12;

            matchesByLine.forEach((lineMatches, lineNumber) => {
                lineMatches.forEach(match => {
                    const startPos = getTextPosition(text, match.start);

                    if (match.startLine === match.endLine) {
                        // Single line match
                        const matchWidth = getTextWidth(text, match.start, match.end);

                        ctx.beginPath();
                        ctx.roundRect(
                            startPos.x,
                            startPos.y - lineHeight + 3,
                            matchWidth,
                            lineHeight - 1,
                            2
                        );
                        ctx.fill();
                    } else {
                        // Multi-line match - draw from start to end of line
                        const lineText = text.split('\\n')[match.startLine];
                        const endOfLineWidth = getTextWidth(lineText, 0, lineText.length);

                        ctx.beginPath();
                        ctx.roundRect(
                            startPos.x,
                            startPos.y - lineHeight + 3,
                            endOfLineWidth - getTextWidth(lineText, 0, match.startColumn),
                            lineHeight - 1,
                            2
                        );
                        ctx.fill();
                    }
                });
            });
        }

        // Debounce function
        function debounce(func, wait) {
            return function executedFunction(...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Test regex and update highlights
        function testRegex() {
            const pattern = regexInput.value;
            const flags = flagsInput.value;
            const text = testTextArea.value;

            errorDiv.style.display = 'none';

            if (!pattern || pattern.trim() === '') {
                statusDiv.textContent = 'Ready to test regex';
                ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
                return;
            }

            statusDiv.textContent = 'Testing...';

            vscode.postMessage({
                command: 'testRegex',
                pattern: pattern.trim(),
                text: text,
                flags: flags
            });
        }

        // Update matches and redraw highlights
        function updateMatches(matches) {
            currentMatches = matches;
            const text = testTextArea.value;

            setupCanvas();
            drawHighlights(matches, text);

            if (matches.length === 0) {
                statusDiv.textContent = 'No matches found';
            } else {
                statusDiv.textContent = \`Found \${matches.length} match(es)\`;
            }
        }

        // Handle resize with debouncing
        const debouncedHandleResize = debounce(() => {
            const text = testTextArea.value;
            setupCanvas();
            drawHighlights(currentMatches, text);
        }, 100);

        function handleResize() {
            debouncedHandleResize();
        }

        // Event listeners
        const debouncedTestRegex = debounce(testRegex, 300);

        regexInput.addEventListener('input', debouncedTestRegex);
        flagsInput.addEventListener('input', debouncedTestRegex);
        testTextArea.addEventListener('input', debouncedTestRegex);

        // Handle resize
        window.addEventListener('resize', handleResize);

        // Handle textarea scroll with synchronization
        testTextArea.addEventListener('scroll', () => {
            highlightCanvas.style.transform = \`translate(-\${testTextArea.scrollLeft}px, -\${testTextArea.scrollTop}px)\`;
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.command) {
                case 'showMatches':
                    updateMatches(message.matches);
                    break;
                case 'showError':
                    errorDiv.textContent = message.error || 'Unknown error occurred';
                    errorDiv.style.display = 'block';
                    statusDiv.textContent = 'Error in regex pattern';
                    break;
            }
        });

        // Initialize on load
        window.addEventListener('load', () => {
            testTextArea.value = 'Hello World! This is a test. Test 123 456 789.';

            // Setup canvas after a brief delay to ensure proper sizing
            setTimeout(() => {
                setupCanvas();
                testRegex();
            }, 100);
        });

        // Add roundRect polyfill if needed
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
                if (width < 2 * radius) radius = width / 2;
                if (height < 2 * radius) radius = height / 2;
                this.beginPath();
                this.moveTo(x + radius, y);
                this.arcTo(x + width, y, x + width, y + height, radius);
                this.arcTo(x + width, y + height, x, y + height, radius);
                this.arcTo(x, y + height, x, y, radius);
                this.arcTo(x, y, x + width, y, radius);
                this.closePath();
                return this;
            };
        }
    </script>
</body>
</html>`;
}

export function deactivate() {}