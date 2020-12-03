const svgr = require("@svgr/core").default;
const jsx = require("@svgr/plugin-jsx").default;
const svgo = require("@svgr/plugin-svgo").default;
const prettier = require("@svgr/plugin-prettier").default;
const glob = require("glob");

const OUT_DIR = "components";

const path = require("path");
const fs = require("fs").promises;

const config = {
  plugins: [svgo, jsx, prettier],
  native: true,
  typescript: true,
};

function getFilepaths() {
  return new Promise((resolve, reject) => {
    glob("./node_modules/bootstrap-icons/icons/*.svg", (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}

function toPascalCase(text) {
  return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text) {
  return text.replace(/-/, "").toUpperCase();
}

function generateComponentName(filePath) {
  const filename = path.parse(filePath).name;
  return toPascalCase(filename);
}

async function transform(filepath) {
  const code = await fs.readFile(filepath, { encoding: "utf8" });
  const output = await svgr(code, config, {
    componentName: generateComponentName(filepath),
  });
  const filename = path.basename(filepath);
  await fs.writeFile(
    path.join(OUT_DIR, `${path.parse(filename).name}.tsx`),
    output
  );
}

(async () => {
  try {
    const files = await getFilepaths();
    await fs.mkdir(OUT_DIR);
    await Promise.all(files.map(transform));
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
})();
