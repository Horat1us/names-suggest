import fs from "fs";
import path from "path";

export const loadData = () => {
    const dataDir = path.resolve('./data');

    return fs.readdirSync(dataDir)
        .filter((file) => file.match(/\.value\.json$/))
        .map((file) => fs.readFileSync(path.join(dataDir, file)))
        .map((content) => JSON.parse(content));
};
