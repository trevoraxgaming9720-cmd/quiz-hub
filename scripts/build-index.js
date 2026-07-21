const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const result = [];

function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (
        item.name === ".git" ||
        item.name === ".github" ||
        item.name === "scripts" ||
        item.name === "node_modules"
      ) continue;

      walk(full);

    } else if (
      item.isFile() &&
      item.name.endsWith(".html") &&
      item.name !== "index.html"
    ) {

      const relative = path.relative(ROOT, full).replace(/\\/g, "/");
      const parts = relative.split("/");

      let subject = "";
      let category = null;
      let chapter = "";
      let title = path.basename(item.name, ".html");

      // Subject/Chapter/Test.html
      if (parts.length === 3) {
        subject = parts[0];
        chapter = parts[1];
      }

      // Subject/Category/Chapter/Test.html
      else if (parts.length === 4) {
        subject = parts[0];
        category = parts[1];
        chapter = parts[2];
      }

      // बाकी Structure Ignore
      else {
        continue;
      }

      result.push({
        subject,
        category,
        chapter,
        title,
        path: relative
      });
    }
  }
}

walk(ROOT);

result.sort((a, b) =>
  a.subject.localeCompare(b.subject, undefined, { numeric: true }) ||
  (a.category || "").localeCompare(b.category || "", undefined, { numeric: true }) ||
  a.chapter.localeCompare(b.chapter, undefined, { numeric: true }) ||
  a.title.localeCompare(b.title, undefined, { numeric: true })
);

fs.writeFileSync(
  path.join(ROOT, "index.json"),
  JSON.stringify(result, null, 2)
);

console.log(`Generated ${result.length} quizzes.`);