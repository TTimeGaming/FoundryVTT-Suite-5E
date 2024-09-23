import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { compilePack, extractPack } from '@foundryvtt/foundryvtt-cli';

const argv = yargs(hideBin(process.argv))
    .command(packageCommand())
    .help().alias(`help`, `h`)
    .argv
;

function packageCommand() {
    return {
        command: `package [action]`,
        describe: `Manage packages`,
        builder: (yargs) => {
            yargs.positional(`action`, {
                describe: `The action to perform.`,
                type: `string`,
                choices: [ `extract`, `compile` ]
            })
        },
        handler: async (argv) => {
            const { action } = argv;
            switch (action) {
                case `extract`: return await extractPacks();
                case `compile`: return await compilePacks();
            }
        }
    };
}

async function extractPacks() {
    const module = JSON.parse(fs.readFileSync(`./module.json`, { encoding: `utf8` }));
    for (const packInfo of module.packs) {
        const dest = `packs/_source/${packInfo.name}`;

        const folders = {};
        const containers = {};
        await extractPack(packInfo.path, dest, {
            log: false,
            transformEntry: (e) => {
                if (e._key.startsWith("!folders")) folders[e._id] = { name: slugify(e.name), folder: e.folder };
                else if (e.type === "container") containers[e._id] = { name: slugify(e.name), container: e.system?.container, folder: e.folder };
                return false;
            }
        });
        const buildPath = (collection, entry, parentKey) => {
            let parent = collection[entry[parentKey]];
            entry.path = entry.name;
            while (parent) {
                entry.path = path.join(parent.name, entry.path);
                parent = collection[parent[parentKey]];
            }
        };
        Object.values(folders).forEach((f) => buildPath(folders, f, "folder"));
        Object.values(containers).forEach((c) => {
            buildPath(containers, c, "container");
            const folder = folders[c.folder];
            if (folder) c.path = path.join(folder.path, c.path);
        });

        await extractPack(packInfo.path, dest, {
            log: true,
            transformEntry:cleanPackEntry,
            transformName: (e) => {
                if (e._id in folders) return `${folders[e._id].path}/_folder.json`;
                if (e._id in containers) return `${containers[e._id].path}/_container.json`;

                const outputName = slugify(e.name);
                const parent = containers[e.system?.container] ?? folders[e.folder];
                return `${(parent?.path ?? ``)}/${outputName}.json`;
            }
        });
    }
}

async function compilePacks() {
    const folders = fs.readdirSync(`packs/_source`, { withFileTypes: true }).filter(file => file.isDirectory());
    for (const folder of folders) {
        const src = `packs/_source/${folder.name}`;
        const dest = `packs/${folder.name}`;
        await compilePack(src, dest, {
            recursive: true,
            log: true,
            transformEntry: cleanPackEntry
        });
    }
}

function cleanPackEntry(data, { clearSourceId = true, ownership = 0 } = {}) {
    if (data.ownership) data.ownership = { default: ownership };
    if (clearSourceId) {
        delete data._stats?.compendiumSource;
        delete data.flags?.core?.sourceId;
    }
    delete data.flags?.importSource;
    delete data.flags?.exportSource;
    if (data._stats?.lastModifiedBy) data._stats.lastModifiedBy = "suite5ebuilder00";

    if (!data.flags) data.flags = {};
    Object.entries(data.flags).forEach(([key, contents]) => {
        if (Object.keys(contents).length === 0) delete data.flags[key];
    });

    if (data.system?.activation?.cost === 0) data.system.activation.cost = null;
    if (data.system?.duration?.value === "0") data.system.duration.value = "";
    if (data.system?.target?.value === 0) data.system.target.value = null;
    if (data.system?.target?.width === 0) data.system.target.width = null;
    if (data.system?.range?.value === 0) data.system.range.value = null;
    if (data.system?.range?.long === 0) data.system.range.long = null;
    if (data.system?.uses?.value === 0) data.system.uses.value = null;
    if (data.system?.uses?.max === "0") data.system.duration.value = "";
    if (data.system?.save?.dc === 0) data.system.save.dc = null;
    if (data.system?.capacity?.value === 0) data.system.capacity.value = null;
    if (data.system?.strength === 0) data.system.strength = null;

    if (["character", "npc"].includes(data.type) && data.img === "icons/svg/mystery-man.svg") {
        data.img = "";
        data.prototypeToken.texture.src = "";
    }

    if (data.effects) data.effects.forEach(i => cleanPackEntry(i, { clearSourceId: false }));
    if (data.items) data.items.forEach(i => cleanPackEntry(i, { clearSourceId: false }));
    if (data.pages) data.pages.forEach(i => cleanPackEntry(i, { ownership: -1 }));
    if (data.system?.description?.value) data.system.description.value = cleanString(data.system.description.value);
    if (data.label) data.label = cleanString(data.label);
    if (data.name) data.name = cleanString(data.name);
}

function cleanString(str) {
    return str.replace(/\u2060/gu, ``).replace(/[‘’]/gu, `'`).replace(/[“”]/gu, `"`);
}

function slugify(name) {
    return name.toLowerCase().replace(`'`, ``).replace(/[^a-z0-9]+/gi, ` `).trim().replace(/\s+|-{2,}/g, `-`);
}