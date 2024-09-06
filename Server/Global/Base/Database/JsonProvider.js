const Path = require("path");
const { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } = require("fs");
const { set, get, unset, } = require("lodash");

class ErtuDatabase {

    constructor({ path = "Global/Settings/Database.json" } = {}) {

        path = path.replaceAll("/", Path.sep).replaceAll("\\", Path.sep)
        let basePath = Path.join(process.cwd(), '')

        if (path.startsWith(basePath)) {
            path = path.replace(basePath, "");
        }

        if (path.startsWith(`.${Path.sep}`)) {
            path = path.slice(1);
        }

        if (!path.startsWith(Path.sep)) {
            path = Path.sep + path;
        }

        if (!path.endsWith(".json")) {
            if (path.endsWith(Path.sep)) {
                path += "database.json";
            } else {
                path += ".json";
            }
        }

        basePath = `${basePath}${path}`;

        const dirNames = path.split(Path.sep).slice(1);

        const length = dirNames.length;

        if (length > 1) {
            dirNames.pop();

            const firstResolvedDir = Path.resolve(dirNames[0]);

            if (!existsSync(firstResolvedDir)) {
                mkdirSync(firstResolvedDir);
            }

            dirNames.splice(0, 1);

            let targetDirPath = firstResolvedDir;

            for (const dirName of dirNames) {
                const currentPath = `${targetDirPath}${Path.sep}${dirName}`;

                if (!existsSync(currentPath)) {
                    mkdirSync(currentPath);
                }

                targetDirPath = `${targetDirPath}${Path.sep}${dirName}`;
            }
        }

        this.path = basePath;

        if (!existsSync(this.path)) {
            writeFileSync(this.path, "{}");
        }
    }

    set(key, value) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }

        if (
            value === "" ||
            value === undefined ||
            value === null
        ) {
            throw new Error("Please Specify String For Value");
        }

        const jsonData = this.toJSON();

        set(jsonData, key, value);

        writeFileSync(this.path, JSON.stringify(jsonData, null, 4));

        return value;
    };

    push(key, value) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }

        if (
            value === "" ||
            value === undefined ||
            value === null
        ) {
            throw new Error("Please Specify String For Value");
        }

        const jsonData = this.toJSON();

        const data = get(jsonData, key);

        if (!data) {
            return this.set(key, [value]);
        }

        if (!Array.isArray(data)) throw new Error(`${key} ID data is not a array type data.`);

        data.push(value);

        return this.set(key, data);
    };

    get(key) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }

        const jsonData = this.toJSON();

        const data = get(jsonData, key);
        return data;
    }

    has(key) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }
        
        return this.toJSON().hasOwnProperty(key);
    }

    all(limit = 0) {
        if (typeof limit !== "number") {
            throw new Error("Please Specify Number For Limit");
        }

        const jsonData = JSON.parse(readFileSync(this.path, "utf-8"));

        const arr = [];
        for (const key in jsonData) {
            arr.push({
                ID: key,
                data: jsonData[key]
            });
        }

        return limit > 0 ? arr.splice(0, limit) : arr;
    }

    toJSON(limit) {
        const allData = this.all(limit);

        const json = {};
        for (const element of allData) {
            json[element.ID] = element.data;
        }
        return json;
    }

    delete(key) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }

        const jsonData = this.toJSON();

        unset(jsonData, key);

        writeFileSync(this.path, JSON.stringify(jsonData, null, 4));

        return;
    }

    clear() {
        writeFileSync(this.path, "{}");
        return;
    }

    type(key) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }

        const data = this.get(key);

        if (Array.isArray(data)) return "array";

        else return typeof data;
    }

    add(key, value) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }

        if (Array.isArray(value) || isNaN(value)) {
            throw new Error("Please Specify Number For Value");
        }

        if(value <= 0) {
            throw new Error("Please Specify Number Higher Than 0 For Value");
        }

        value = Number(value)

        let data = this.get(key);
        if (!data) {
            return this.set(key, value);
        }

        if (Array.isArray(data) || isNaN(data)) throw new Error(`${key} ID data is not a number type data.`);

        data = Number(data);

        data += value;

        return this.set(key, data);
    }

    substr(key, value, goToNegative) {
        if (key === "" || typeof key !== "string") {
            throw new Error("Please Specify String For Key");
        }

        if (Array.isArray(value) || isNaN(value)) {
            throw new Error("Please Specify Number For Value");
        }

        if(value <= 0) {
            throw new Error("Please Specify Number Higher Than 0 For Value");
        }

        value = Number(value)

        let data = this.get(key);
        if (!data) {
            return this.set(key, value);
        }

        if (Array.isArray(data) || isNaN(data)) throw new Error(`${key} ID data is not a number type data.`);

        data = Number(data);

        data -= value;

        return this.set(key, data);
    }

    includes(key) {
        return this.filter((element) => element.ID.includes(key));
    }

    startsWith(key) {
        return this.filter((element) => element.ID.startsWith(key));
    }

    endsWith(key) {
        return this.filter((element) => element.ID.endsWith(key));
    }

    filter(callbackfn, thisArg) {
        if (thisArg) callbackfn = callbackfn.bind(thisArg);
        return this.all().filter(callbackfn);
    }
}

module.exports = ErtuDatabase;