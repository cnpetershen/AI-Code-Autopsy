import * as vscode from 'vscode';
import { AntiAIRuntime } from '@ai-code-autopsy/core';

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('ai-code-autopsy');
  context.subscriptions.push(diagnosticCollection);

  const scanCommand = vscode.commands.registerCommand('ai-code-autopsy.scan', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const runtime = new AntiAIRuntime();
    const source = editor.document.getText();
    const result = await runtime.scan(source);

    updateDiagnostics(editor.document.uri, result);
    showResultPanel(result);
  });

  const fixCommand = vscode.commands.registerCommand('ai-code-autopsy.fix', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const runtime = new AntiAIRuntime();
    runtime.setPreset('strict');
    const source = editor.document.getText();
    const result = await runtime.fix(source);

    if (result.transform?.success) {
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        editor.document.positionAt(0),
        editor.document.positionAt(source.length)
      );
      edit.replace(editor.document.uri, fullRange, result.transform.code);
      await vscode.workspace.applyEdit(edit);
      vscode.window.showInformationMessage(
        `AI Code Autopsy: Applied ${result.transform.changes.length} fixes`
      );
    } else {
      vscode.window.showInformationMessage('AI Code Autopsy: No fixes needed');
    }
  });

  const onChangeDocument = vscode.workspace.onDidChangeTextDocument(async (event) => {
    const config = vscode.workspace.getConfiguration('ai-code-autopsy');
    const debounceMs = config.get<number>('debounceMs', 500);

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.uri !== event.document.uri) return;

      const runtime = new AntiAIRuntime();
      const preset = vscode.workspace.getConfiguration('ai-code-autopsy').get<string>('preset', 'balanced');
      runtime.setPreset(preset);

      const source = event.document.getText();
      const result = await runtime.scan(source);
      updateDiagnostics(editor.document.uri, result);
    }, debounceMs);
  });

  context.subscriptions.push(scanCommand, fixCommand, onChangeDocument);
}

function updateDiagnostics(uri: vscode.Uri, result: any) {
  const diagnostics: vscode.Diagnostic[] = [];

  for (const finding of result.analysis.findings) {
    const severity = finding.severity === 'critical' || finding.severity === 'high'
      ? vscode.DiagnosticSeverity.Error
      : finding.severity === 'medium'
        ? vscode.DiagnosticSeverity.Warning
        : vscode.DiagnosticSeverity.Information;

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 0),
      `[AI UI] ${finding.message}`,
      severity
    );
    diagnostic.code = finding.id;
    diagnostic.source = 'ai-code-autopsy';
    diagnostics.push(diagnostic);
  }

  diagnosticCollection.set(uri, diagnostics);
}

function showResultPanel(result: any) {
  const panel = vscode.window.createWebviewPanel(
    'aiCodeAutopsyResult',
    'AI Code Autopsy Report',
    vscode.ViewColumn.Beside,
    { enableScripts: false }
  );

  const score = (result.analysis.score * 100).toFixed(0);
  const findings = result.analysis.findings.length;

  panel.webview.html = `<!DOCTYPE html>
<html>
<head><style>
body { font-family: -apple-system, sans-serif; padding: 16px; background: #1e1e1e; color: #ccc; }
.score { font-size: 48px; font-weight: bold; }
.good { color: #4caf50; }
.warn { color: #ff9800; }
.bad { color: #f44336; }
.finding { margin: 8px 0; padding: 8px; background: #2d2d2d; border-radius: 4px; }
.severity-high { border-left: 3px solid #f44336; }
.severity-medium { border-left: 3px solid #ff9800; }
.severity-low { border-left: 3px solid #2196f3; }
h2 { color: #fff; }
</style></head>
<body>
  <h1>AI Code Autopsy Report</h1>
  <div class="score ${score > 60 ? 'bad' : score > 30 ? 'warn' : 'good'}">${score}/100</div>
  <p>${findings} pattern(s) detected</p>
  <h2>Findings</h2>
  ${result.analysis.findings.slice(0, 20).map((f: any) => `
    <div class="finding severity-${f.severity}">
      <strong>${f.severity.toUpperCase()}</strong>: ${f.message}
      <p style="font-size:12px;color:#999">${f.explanation}</p>
    </div>
  `).join('')}
</body>
</html>`;
}

export function deactivate() {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (diagnosticCollection) diagnosticCollection.dispose();
}
