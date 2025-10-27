import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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

        panel.webview.html = getSimpleHTML();

        panel.webview.onDidReceiveMessage(
            message => {
                if (message.command === 'testRegex') {
                    try {
                        const matches = testRegex(message.pattern, message.text, message.flags);
                        panel.webview.postMessage({ command: 'showMatches', matches: matches });
                    } catch (error) {
                        panel.webview.postMessage({
                            command: 'showError',
                            error: error instanceof Error ? error.message : 'Unknown error'
                        });
                    }
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

            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }
        }

        return matches;
    } catch (error) {
        throw error;
    }
}

function getSimpleHTML(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
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
            color: #fff;
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
            box-shadow: 0 0 0 2px rgba(0,120,212,0.2);
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
        #textEditor {
            position: relative;
            z-index: 1;
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
            font-family: 'Consolas', 'Microsoft YaHei', 'SimHei', monospace;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
            overflow-y: auto;
        }
        #textEditor:focus {
            outline: none;
        }
        .highlight {
            background-color: yellow;
            color: black;
            font-weight: bold;
            border-radius: 2px;
            padding: 0 2px;
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
            <label for="pattern">Regular Expression:</label>
            <div class="regex-input-row">
                <input type="text" id="pattern" class="regex-input" placeholder="Enter regex pattern..." value="">
                <input type="text" id="flags" class="flags-input" placeholder="flags" value="g">
            </div>
        </div>

        <div class="input-group">
            <label for="textEditor">Test Text:</label>
            <div class="editor-container">
                <div id="textEditor" contenteditable="true" spellcheck="false" placeholder="Enter text to test against the regex..."></div>
            </div>
        </div>

        <div id="status" class="status">Ready to test regex</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const patternInput = document.getElementById('pattern');
        const flagsInput = document.getElementById('flags');
        const textEditor = document.getElementById('textEditor');
        const statusDiv = document.getElementById('status');

        let currentText = '';
        let currentMatches = [];

        function getPlainContent(element) {
            return element.innerText || element.textContent || '';
        }

        function testRegex() {
            const pattern = patternInput.value;
            const flags = flagsInput.value;
            currentText = getPlainContent(textEditor);

            if (!pattern) {
                statusDiv.textContent = 'Please enter a regex pattern';
                return;
            }

            statusDiv.textContent = 'Testing...';

            vscode.postMessage({
                command: 'testRegex',
                pattern: pattern.trim(),
                text: currentText,
                flags: flags
            });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function applyHighlights(matches) {
            if (!matches || matches.length === 0) {
                textEditor.innerHTML = escapeHtml(currentText);
                return;
            }

            // 保存当前光标位置
            const selection = window.getSelection();
            const cursorOffset = getCursorOffset(textEditor);
            const cursorNode = selection.anchorNode;
            const cursorOffsetInNode = selection.anchorOffset;

            let highlightedHTML = '';
            let lastEnd = 0;

            matches.forEach((match, index) => {
                // 添加匹配前的文本
                highlightedHTML += escapeHtml(currentText.substring(lastEnd, match.start));
                // 添加高亮的匹配文本
                highlightedHTML += '<span class="highlight">' + escapeHtml(match.text) + '</span>';
                lastEnd = match.end;
            });

            // 添加剩余的文本
            highlightedHTML += escapeHtml(currentText.substring(lastEnd));

            textEditor.innerHTML = highlightedHTML;

            // 恢复光标位置
            setTimeout(() => {
                setCursorPosition(textEditor, cursorOffset);
            }, 0);
        }

        function getCursorOffset(element) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return 0;

            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);

            const textContent = element.innerText || element.textContent || '';
            const plainText = preCaretRange.toString();
            return plainText.length;
        }

        function setCursorPosition(element, offset) {
            const textContent = element.innerText || element.textContent || '';
            const maxOffset = Math.min(offset, textContent.length);

            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let currentOffset = 0;
            let targetNode = null;
            let targetOffset = 0;

            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent.length;

                if (currentOffset + nodeLength >= maxOffset) {
                    targetNode = node;
                    targetOffset = maxOffset - currentOffset;
                    break;
                }

                currentOffset += nodeLength;
            }

            if (targetNode) {
                const range = document.createRange();
                const selection = window.getSelection();
                range.setStart(targetNode, targetOffset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        window.addEventListener('message', event => {
            const message = event.data;

            if (message.command === 'showMatches') {
                currentMatches = message.matches;
                applyHighlights(currentMatches);
                statusDiv.textContent = 'Found ' + currentMatches.length + ' match(es)';
            } else if (message.command === 'showError') {
                statusDiv.textContent = 'Error: ' + message.error;
            }
        });

        // 实时测试
        patternInput.addEventListener('input', () => {
            if (patternInput.value && currentText) {
                testRegex();
            }
        });

        textEditor.addEventListener('input', () => {
            currentText = getPlainContent(textEditor);
            if (patternInput.value) {
                testRegex();
            }
        });

        // 初始化
        patternInput.value = '';
        currentText = '';
        textEditor.innerHTML = '';
    </script>
</body>
</html>`;
}

export function deactivate() {}