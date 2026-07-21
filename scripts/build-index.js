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

      if (parts.length < 3) continue;

      result.push({
        subject: parts[0],
        chapter: parts[1],
        title: path.basename(item.name, ".html"),
        path: relative
      });
    }
  }
}

walk(ROOT);

result.sort((a, b) =>
  a.subject.localeCompare(b.subject) ||
  a.chapter.localeCompare(b.chapter) ||
  a.title.localeCompare(b.title)
);

fs.writeFileSync(
  path.join(ROOT, "index.json"),
  JSON.stringify(result, null, 2)
);

console.log(`Generated ${result.length} quizzes.`);
