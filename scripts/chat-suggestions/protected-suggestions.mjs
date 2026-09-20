import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export function getProtectedSuggestionSnippets() {
  const sourcePath = path.join(
    process.cwd(),
    'src',
    'lib',
    'chat',
    'page-suggestions.ts',
  );
  const source = fs.readFileSync(sourcePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const protectedLabels = [];
  const protectedQuestions = [];
  const publicLabels = [];
  const publicQuestions = [];

  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'suggestion' &&
      node.arguments.length >= 5
    ) {
      const [, labelNode, questionNode, audienceNode] = node.arguments;
      const literal = (value) =>
        ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)
          ? value.text
          : undefined;
      const label = literal(labelNode);
      const question = literal(questionNode);
      const audience = literal(audienceNode);

      if (label && question && audience) {
        if (audience === 'public') {
          if (!publicLabels.includes(label)) publicLabels.push(label);
          if (!publicQuestions.includes(question)) publicQuestions.push(question);
        } else {
          if (!protectedLabels.includes(label)) protectedLabels.push(label);
          if (!protectedQuestions.includes(question)) protectedQuestions.push(question);
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  const overlapLabel = protectedLabels.find((protectedValue) =>
    publicLabels.some((publicValue) =>
      publicValue === protectedValue ||
      publicValue.includes(protectedValue) ||
      protectedValue.includes(publicValue)
    )
  );
  const overlapQuestion = protectedQuestions.find((protectedValue) =>
    publicQuestions.some((publicValue) =>
      publicValue === protectedValue ||
      publicValue.includes(protectedValue) ||
      protectedValue.includes(publicValue)
    )
  );
  const overlap = overlapLabel ?? overlapQuestion;
  if (overlap) {
    throw new Error(`Protected/public suggestion text overlaps: ${overlap}`);
  }

  const snippets = [...protectedLabels, ...protectedQuestions];
  if (snippets.length === 0) {
    throw new Error('No non-public suggestions found; protected manifest generation failed.');
  }

  return snippets;
}
