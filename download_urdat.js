const fetch = require("node-fetch");
const fs = require("fs");

const urls = [
  {
    url: "http://trapteam-tablet.activision.com/Tablet2014/iosa/ContentDeploymentManifest.xml.15BF41D1C3C1BAB51ADDB400DB148B5E",
    foldername: "iosa",
    baseUrl: "http://trapteam-tablet.activision.com/",
  },
];

async function createFolder(foldername) {
  if (!fs.existsSync(foldername)) {
    fs.mkdirSync(foldername);
  }
}

async function downloadFile(url, foldername) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  createFolder(foldername);
  fs.writeFileSync(`${foldername}/ContentDeploymentManifest.xml`, buffer);
  const contents = fs.readFileSync(
    `${foldername}/ContentDeploymentManifest.xml`,
    "utf-8"
  );
  return contents;
}

async function parseXML(contents) {
  const splitContents = contents.split("\n");
  console.log("there are ", splitContents.length, " lines");
  const filteredContents = splitContents.filter((line) => {
    return line.includes("http://trapteam-tablet.activision.com/");
  });
  console.log("there are ", filteredContents.length, " lines with the url");
  const urls = filteredContents.map((line) => {
    const url = line.split(">")[1].split("<")[0];
    const filename = url.split("/").pop();
    return {
      url,
      filename,
    };
  });
  return urls
}

async function downloadAllFiles(urls, foldername) {
  for (const url of urls) {
    console.log("Downloading", url.url);
    const response = await fetch(url.url);
    const buffer = await response.buffer();
    const filename = url.filename;
    fs.writeFileSync(`${foldername}/${filename}`, buffer);
    console.log(
      `Downloaded ${filename} (${buffer.length} bytes) (${
        urls.indexOf(url) + 1
      }/${urls.length})`
    );
  }
}

async function main() {
    for (const url of urls) {
        console.log("Downloading", url.url);
        const contents = await downloadFile(url.url, url.foldername);
        const urls = await parseXML(contents);
        await downloadAllFiles(urls, url.foldername);
    }
}

main();
