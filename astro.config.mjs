import astrobook from "astrobook";
import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import netlify from "@astrojs/netlify";
import fs from "fs";
import path from "path";
import sass from "sass";

const srcScssDir = path.resolve("src/scss");
const devOutCssDir = path.resolve("public/styles");
const buildOutCssDir = path.resolve("dist/styles");

/** 🔄 SCSS 파일 전체 탐색 (재귀적) */
function walkScssFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkScssFiles(fullPath);
    if (entry.name.endsWith(".scss") && !path.basename(entry.name).startsWith("_")) {
      return [fullPath];
    }
    return [];
  });
}

/** 🔧 SCSS → CSS 컴파일 후 저장 */
function compileScss(filePath, isBuild = false) {
  if (path.basename(filePath).startsWith("_")) {
    console.log(`[SCSS] 🚫 Ignored: ${filePath} (starts with _)`);
    return;
  }

  try {
    const relativePath = path.relative(srcScssDir, filePath);
    const cssPath = path.resolve(
      isBuild ? buildOutCssDir : devOutCssDir,
      relativePath.replace(/\.scss$/, ".css"),
    );
    const result = sass.compile(filePath, { style: "expanded" });

    fs.mkdirSync(path.dirname(cssPath), { recursive: true });
    fs.writeFileSync(cssPath, result.css);

    console.log(`[SCSS] ✅ Compiled: ${relativePath}`);
  } catch (err) {
    console.error(`[SCSS] ❌ Error compiling ${filePath}: ${err.message}`);
  }
}

/** 🗑️ SCSS 삭제 시 대응되는 CSS도 제거 */
function deleteCss(filePath, isBuild = false) {
  const relativePath = path.relative(srcScssDir, filePath);
  const cssPath = path.resolve(
    isBuild ? buildOutCssDir : devOutCssDir,
    relativePath.replace(/\.scss$/, ".css"),
  );

  if (fs.existsSync(cssPath)) {
    fs.unlinkSync(cssPath);
    console.log(`[SCSS] 🗑️ Deleted: ${relativePath}`);
  }
}

/** 🔥 Windows 대응: fs.watch를 사용하여 변경 감지 */
function watchScssFiles(server) {
  console.log("[SCSS] 👀 Watching SCSS files with fs.watch...");

  fs.watch(srcScssDir, { recursive: true }, (eventType, filename) => {
    // ⚠️ filename이 없으면 무시 (Windows에서 종종 발생)
    if (!filename) return;

    const fullPath = path.resolve(srcScssDir, filename);

    // ⚠️ scss 파일만 처리
    if (!fullPath.endsWith(".scss")) return;

    // ⚠️ 언더바로 시작하는 파일은 무시
    if (path.basename(fullPath).startsWith("_")) {
      console.log(`[SCSS] 🚫 Ignored: ${fullPath} (partial)`);
      return;
    }

    // 📦 파일이 새로 생기거나 삭제된 경우
    if (eventType === "rename") {
      if (fs.existsSync(fullPath)) {
        console.log(`[SCSS][add] ${fullPath}`);
        compileScss(fullPath);
      } else {
        console.log(`[SCSS][unlink] ${fullPath}`);
        deleteCss(fullPath);
      }
      server.ws.send({ type: "full-reload" });
    }

    // 📝 파일 내용이 수정된 경우
    if (eventType === "change") {
      console.log(`[SCSS][change] ${fullPath}`);
      compileScss(fullPath);
      server.ws.send({ type: "full-reload" });
    }
  });

  // 🚀 초기 SCSS 전체 컴파일
  walkScssFiles(srcScssDir).forEach((file) => compileScss(file));
}

export default defineConfig({
  integrations: [
    // On development, Astrobook is available at http://localhost:4321/astrobook.
    // On production, Astrobook is not included.
    process.env.NODE_ENV === "development"
      ? astrobook({
          directory: "src/stories",
          subpath: "/astrobook",
        })
      : null,
  ],
  vite: {
    publicDir: "public", // ✅ public 폴더 직접 관리
    plugins: [
      // ✅ 빌드 시 모든 SCSS → CSS 변환 후 dist/styles에 저장
      {
        name: "astro-scss-build",
        apply: "build",
        buildStart() {
          console.log("[SCSS] 🚀 Building SCSS files...");
          const allScssFiles = walkScssFiles(srcScssDir);
          for (const file of allScssFiles) {
            compileScss(file, true); // isBuild = true
          }
        },
      },

      // ✅ 개발 서버 실행 시 SCSS Watcher 활성화
      {
        name: "astro-scss-watch",
        apply: "serve",
        configureServer(server) {
          console.log("[SCSS] 👀 Watching SCSS files...");
          // ✅ fs.watch 사용
          watchScssFiles(server);
        },
      },
    ],
    build: {
      minify: false,
      cssMinify: false,
      cssCodeSplit: true,

      rollupOptions: {
        input: {
          main: "./src/pages/index.astro",
        },
        output: {
          assetFileNames: "[name][extname]", // 해시 제거
        },
      },
    },
  },
  build: {
    format: "preserve",
    inlineStylesheets: "never",
  },
  compressHTML: false,
  output: "static",
  adapter: netlify(),
  server: { port: 7777 },
});
