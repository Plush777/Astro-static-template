import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { fileURLToPath } from "url";
import prettier from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

const assetFolders = ["styles", "js", "images", "lib", "fonts"];

/** HTML 파일 기준 상대 경로 접두어 생성 */
function getRelativePrefix(filePath) {
  const relativePath = path.relative(distDir, path.dirname(filePath));
  const depth = relativePath === "" ? 0 : relativePath.split(path.sep).length;
  return depth === 0 ? "./" : "../".repeat(depth);
}

/** 자산 파일의 실제 경로 추적 */
function findAssetFolder(filename) {
  for (const folder of assetFolders) {
    const fullPath = path.join(distDir, folder);
    const found = globSync(`${fullPath}/**/${filename}`);
    if (found.length > 0) {
      const relativePath = path.relative(distDir, found[0]);
      return path.dirname(relativePath).replace(/\\/g, "/");
    }
  }
  return null;
}

/** JS에서 이동할 대상 경로 → JS 기준 상대경로 반환 */
function getRelativePathFromJsToTarget(htmlPath, targetPath) {
  const jsOutputPath = path.resolve(path.dirname(htmlPath), "js/ui.js");
  const fullTargetPath = path.resolve(distDir, targetPath, "index.html");
  const relativePath = path.relative(path.dirname(jsOutputPath), fullTargetPath);
  return relativePath.replace(/\\/g, "/");
}

/** HTML 위치 기준 JS 복제본 만들고 경로 보정 */
function patchJsFile(htmlPath, jsSrcPath) {
  const htmlDir = path.dirname(htmlPath);
  const jsFullPath = path.resolve(distDir, jsSrcPath);
  if (!fs.existsSync(jsFullPath)) return;

  let jsContent = fs.readFileSync(jsFullPath, "utf-8");

  jsContent = jsContent
    .replace(
      /window\.open\(["']\/([^"']+)["']\s*,\s*["']_blank["']\)/g,
      (_, pathStr) =>
        `window.open("${getRelativePathFromJsToTarget(htmlPath, pathStr)}", "_blank")`,
    )
    .replace(
      /location\.href\s*=\s*["']\/([^"']+)["']/g,
      (_, pathStr) => `location.href = "${getRelativePathFromJsToTarget(htmlPath, pathStr)}"`,
    )
    .replace(
      /location\.replace\(["']\/([^"']+)["']\)/g,
      (_, pathStr) => `location.replace("${getRelativePathFromJsToTarget(htmlPath, pathStr)}")`,
    )
    .replace(
      /form\.action\s*=\s*["']\/([^"']+)["']/g,
      (_, pathStr) => `form.action = "${getRelativePathFromJsToTarget(htmlPath, pathStr)}"`,
    );

  const targetJsPath = path.resolve(htmlDir, "js/ui.js");
  fs.mkdirSync(path.dirname(targetJsPath), { recursive: true });
  fs.writeFileSync(targetJsPath, jsContent, "utf-8");

  return "js/ui.js";
}

/** HTML 전체 경로 수정 및 정렬 */
async function patchHTMLFiles() {
  const htmlFiles = globSync(`${distDir}/**/*.html`);

  for (const file of htmlFiles) {
    let content = fs.readFileSync(file, "utf-8");
    const prefix = getRelativePrefix(file);

    // hashed 자산 경로 보정
    const hashedAssetRegex =
      /(["'(])(?:\.\/)?(?:\d+\/)?[^\/]+\/([^\/]+\.(css|js|png|jpg|jpeg|svg|webp|woff2?))/g;
    content = content.replace(hashedAssetRegex, (match, p1, filename) => {
      const assetPath = findAssetFolder(filename);
      return assetPath ? `${p1}${prefix}${assetPath}/${filename}` : match;
    });

    // 절대경로 자산 보정
    const absoluteAssetRegex = /(["'(])\/(styles|js|images|lib|fonts)\/([^"')]+)/g;
    content = content.replace(absoluteAssetRegex, (match, p1, folder, rest) => {
      return `${p1}${prefix}${folder}/${rest}`;
    });

    // favicon.ico
    content = content.replace(/href="\/favicon\.ico"/g, `href="${prefix}favicon.ico"`);

    // 내부 링크 (a href="/something")
    content = content.replace(
      /<a\s+[^>]*href="\/([^\/"][^"]*)"(.*?)>/g,
      `<a href="${prefix}$1.html"$2>`,
    );

    // <script src=".../ui.js"> → 상대 위치 복제본 연결
    content = content.replace(
      /<script\s+[^>]*src="([^"]*ui\.js)"[^>]*><\/script>/,
      (match, srcPath) => {
        const newJsRelPath = patchJsFile(file, srcPath);
        return newJsRelPath ? match.replace(srcPath, newJsRelPath) : match;
      },
    );

    // HTML 정렬
    const formatted = await prettier.format(content, {
      parser: "html",
      tabWidth: 2,
      useTabs: false,
      printWidth: 100,
      htmlWhitespaceSensitivity: "ignore",
    });

    fs.writeFileSync(file, formatted, "utf-8");
    console.log(`✅ Patched & Formatted: ${path.relative(distDir, file)}`);
  }
}

patchHTMLFiles();
