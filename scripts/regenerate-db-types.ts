/**
 * database.ts Tables/Views 再生成 post-processing スクリプト
 * (commit-0: 整備 / commit-1: 実行)
 *
 * 目的:
 *   src/types/database.ts のうち Tables と Views のみを、実DB生成型
 *   (src/types/database.generated.ts = SoT) の内容へ差し替える。
 *
 * 保護対象（generate で上書きしない・現 database.ts の手書き定義を維持）:
 *   - Functions      : 手書き RPC 関数型（create_order_from_quotation 等）
 *   - Enums          : 手書き enum 約30個（うち約20個は実DB不存在の便宜型）
 *   - CompositeTypes : 空（実DBに composite type なし）
 *   - ヘッダ（Database型直前）: Json 型・業務 interface・order-status 再エクスポート
 *   - トレーラ（Database型直後..EOF）: Signature / BlogPost 等の拡張 interface
 *   - Database 型の構造（as const の有無・__InternalSupabase の有無）も現状維持
 *
 * 差し替え対象: Tables / Views（実DB generate 内容へ）
 * 除外: バックアップテーブル（_backup_* / blog_posts_backup_*）
 *
 * 使用法:
 *   pnpm exec ts-node --transpile-only scripts/regenerate-db-types.ts --dry-run   # 検証のみ（database.ts 変更なし）
 *   pnpm exec ts-node --transpile-only scripts/regenerate-db-types.ts --apply      # database.ts へ反映
 *
 * 方式: ts-morph AST。プロパティ名で識別（行番号に依存しない＝CRITICAL-3）。
 *       差し替えは `public` プロパティ宣言全体を1回の SourceFile.replaceText で置換。
 *       新 public ブロック = generate(Tables, Views) + 現状(Functions, Enums, CompositeTypes)。
 *       ※インデント不揃いが生じうるが TS として有効。整形は別途 prettier で実施。
 */

import {
  Project,
  SyntaxKind,
  TypeLiteralNode,
} from 'ts-morph';
import * as fs from 'fs';

// プロジェクトルートから起動（pnpm exec ts-node ...）する前提。
// ESM（type:module）では __dirname が未定義のため process.cwd() を使用。
const ROOT = process.cwd();
const GENERATED_PATH = ROOT + '/src/types/database.generated.ts';
const DATABASE_PATH = ROOT + '/src/types/database.ts';

/** バックアップテーブルのプレフィックス（Tables から除外） */
const BACKUP_PATTERN = /^(_backup_|blog_posts_backup_)/;

/** TypeLiteral 配下のプロパティ名一覧。 */
function propNames(node: TypeLiteralNode): string[] {
  const members: any[] = (node as any).getProperties
    ? (node as any).getProperties()
    : (node as any).getMembers();
  return members.map((m) => m.getName());
}

/** TypeAlias の型ノードから TypeLiteral を取り出す。as-const / 括弧付き型は unwrap。 */
function rootTypeLiteral(typeAlias: { getTypeNode(): any }): TypeLiteralNode {
  let node = typeAlias.getTypeNode();
  let guard = 0;
  while (node && node.getKind() !== SyntaxKind.TypeLiteral && guard < 10) {
    guard++;
    const kind = node.getKind();
    if (kind === SyntaxKind.AsExpression) {
      node = node.getExpression();
    } else if (kind === SyntaxKind.ParenthesizedType) {
      node = node.getTypeNode();
    } else {
      throw new Error(
        `rootTypeLiteral: 期待外のノード種別 ${node.getKindName?.() ?? kind}`
      );
    }
  }
  if (!node || node.getKind() !== SyntaxKind.TypeLiteral) {
    throw new Error('rootTypeLiteral: TypeLiteral が見つかりません');
  }
  return node as TypeLiteralNode;
}

/** TypeLiteral 上のプロパティ値（TypeLiteral）を取得。 */
function requireBlock(parent: TypeLiteralNode, name: string): TypeLiteralNode {
  const prop = parent.getProperty(name);
  if (!prop) {
    throw new Error(
      `プロパティ "${name}" が見つかりません（存在プロパティ: ${propNames(parent).join(', ')}）`
    );
  }
  const value = prop.getTypeNode();
  if (!value || value.getKind() !== SyntaxKind.TypeLiteral) {
    throw new Error(
      `プロパティ "${name}" の値が TypeLiteral ではありません（${value?.getKindName?.() ?? 'undefined'}）`
    );
  }
  return value as TypeLiteralNode;
}

function fail(msg: string): never {
  console.error('\n[FAIL] ' + msg);
  process.exit(1);
}

function main(): void {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const apply = argv.includes('--apply');
  if (dryRun === apply) {
    console.error(
      '使用法: ts-node scripts/regenerate-db-types.ts --dry-run | --apply'
    );
    process.exit(2);
  }

  if (!fs.existsSync(GENERATED_PATH)) {
    fail(
      `生成ファイルが存在しません: ${GENERATED_PATH}\n先に Supabase MCP generate_typescript_types を実行してください。`
    );
  }
  if (!fs.existsSync(DATABASE_PATH)) {
    fail(`対象ファイルが存在しません: ${DATABASE_PATH}`);
  }

  const project = new Project({ useInMemoryFileSystem: true });

  // 両ファイルをメモリへロード（apply 時のみ最後に実ファイルへ書き戻す）
  const genFile = project.createSourceFile(
    GENERATED_PATH,
    fs.readFileSync(GENERATED_PATH, 'utf8'),
    { overwrite: true }
  );
  const curFile = project.createSourceFile(
    DATABASE_PATH,
    fs.readFileSync(DATABASE_PATH, 'utf8'),
    { overwrite: true }
  );

  const genAlias = genFile.getTypeAlias('Database');
  const curAlias = curFile.getTypeAlias('Database');
  if (!genAlias) fail('database.generated.ts に Database 型が見つかりません');
  if (!curAlias) fail('database.ts に Database 型が見つかりません');

  const genRoot = rootTypeLiteral(genAlias);
  const curRoot = rootTypeLiteral(curAlias);
  const genPublic = requireBlock(genRoot, 'public');
  const curPublic = requireBlock(curRoot, 'public');

  // --- generate 側: Tables / Views を取得し、Tables からバックアップを除外 ---
  const genTables = requireBlock(genPublic, 'Tables');
  const genViews = requireBlock(genPublic, 'Views');

  const removedBackups: string[] = [];
  for (const name of propNames(genTables)) {
    if (BACKUP_PATTERN.test(name)) {
      genTables.getProperty(name)?.remove();
      removedBackups.push(name);
    }
  }
  const genTableNames = propNames(genTables);
  const genViewNames = propNames(genViews);

  // --- 現 database.ts 側: 差し替え前の状態を記録 ---
  const oldTablesBlock = requireBlock(curPublic, 'Tables');
  const oldTableNames = propNames(oldTablesBlock);
  // 現 Views は { [_ in never]: never }（MappedType）の可能性 → TypeLiteral 时のみ列挙
  const oldViewsNode = curPublic.getProperty('Views')?.getTypeNode();
  const oldViewNames =
    oldViewsNode && oldViewsNode.getKind() === SyntaxKind.TypeLiteral
      ? propNames(oldViewsNode as TypeLiteralNode)
      : [];

  // 保護対象（Functions/Enums/CompositeTypes）の差し替え前テキスト
  const beforeFunctions = curPublic.getProperty('Functions')?.getText();
  const beforeEnums = curPublic.getProperty('Enums')?.getText();
  const beforeComposite = curPublic.getProperty('CompositeTypes')?.getText();

  // ヘッダ/トレーラ（Database 型の前後・手書き部分）
  const beforeFull = curFile.getFullText();
  const headerBefore = beforeFull.slice(0, curAlias.getStart());
  const trailerBefore = beforeFull.slice(curAlias.getEnd());

  // --- 差し替えテキスト構築 ---
  // 新 public ブロック = generate(Tables, Views) + 現状(Functions, Enums, CompositeTypes)
  // ※genTables へのバックアップ除外は AST 上で反映済みなので getText() はクリーン。
  const newPublicText =
    'public: {\n' +
    genPublic.getProperty('Tables')!.getText() +
    '\n' +
    genPublic.getProperty('Views')!.getText() +
    '\n' +
    beforeFunctions +
    '\n' +
    beforeEnums +
    '\n' +
    beforeComposite +
    '\n' +
    '}';

  // --- 差し替え実行: public プロパティ宣言全体を1回で置換 ---
  const publicProp = curRoot.getProperty('public');
  if (!publicProp) fail('現 database.ts の Database 型に public プロパティが見つかりません');
  curFile.replaceText([publicProp.getStart(), publicProp.getEnd()], newPublicText);

  // --- 検証（ノード参照は置換で無効化されたので再取得） ---
  const afterAlias = curFile.getTypeAlias('Database');
  if (!afterAlias) fail('差し替え後に Database 型が消失しました');
  const afterRoot = rootTypeLiteral(afterAlias);
  const afterPublic = requireBlock(afterRoot, 'public');
  const afterFunctions = afterPublic.getProperty('Functions')?.getText();
  const afterEnums = afterPublic.getProperty('Enums')?.getText();
  const afterComposite = afterPublic.getProperty('CompositeTypes')?.getText();
  const afterFull = curFile.getFullText();
  const headerAfter = afterFull.slice(0, afterAlias.getStart());
  const trailerAfter = afterFull.slice(afterAlias.getEnd());

  const functionsOk = beforeFunctions === afterFunctions;
  const enumsOk = beforeEnums === afterEnums;
  const compositeOk = beforeComposite === afterComposite;
  const headerOk = headerBefore === headerAfter;
  const trailerOk = trailerBefore === trailerAfter;

  const afterTables = requireBlock(afterPublic, 'Tables');
  const afterTableNames = propNames(afterTables);
  const remainingBackups = afterTableNames.filter((n) => BACKUP_PATTERN.test(n));
  const backupOk = remainingBackups.length === 0;

  const afterViews = requireBlock(afterPublic, 'Views');
  const afterViewNames = propNames(afterViews);
  const viewsOk =
    JSON.stringify(afterViewNames) === JSON.stringify(genViewNames);
  const tablesCountOk = afterTableNames.length === genTableNames.length;

  // --- レポート ---
  console.log('=== regenerate-db-types: post-processing report ===');
  console.log(`モード: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(
    `生成元: tables=${genTableNames.length} views=${genViewNames.length} (バックアップ除外 ${removedBackups.length} 件)`
  );
  console.log(
    `除外バックアップ: ${removedBackups.length ? removedBackups.join(', ') : '(なし)'}`
  );
  console.log('');
  console.log('--- 保護チェック（全て true であること） ---');
  console.log(`  Functions 保護           : ${functionsOk}`);
  console.log(`  Enums 保護               : ${enumsOk}`);
  console.log(`  CompositeTypes 保護      : ${compositeOk}`);
  console.log(`  ヘッダ不変               : ${headerOk}`);
  console.log(`  トレーラ不変             : ${trailerOk}`);
  console.log(
    `  バックアップ除外         : ${backupOk} (残: ${remainingBackups.length || 'なし'})`
  );
  console.log(`  Views 反映               : ${viewsOk}`);
  console.log(
    `  Tables 件数整合          : ${tablesCountOk} (${oldTableNames.length} -> ${afterTableNames.length})`
  );
  console.log('');
  console.log(
    `Views: [${oldViewNames.join(', ')}] -> [${afterViewNames.join(', ')}]`
  );

  const allOk =
    functionsOk &&
    enumsOk &&
    compositeOk &&
    headerOk &&
    trailerOk &&
    backupOk &&
    viewsOk &&
    tablesCountOk;

  if (!allOk) {
    fail('保護チェックまたは整合性チェックが失敗しました。database.ts は未変更です。');
  }

  if (apply) {
    fs.writeFileSync(DATABASE_PATH, curFile.getFullText());
    console.log('\n[APPLY] database.ts を更新しました。');
  } else {
    console.log('\n[DRY-RUN] database.ts は変更していません。--apply で書き込みます。');
  }
}

main();
