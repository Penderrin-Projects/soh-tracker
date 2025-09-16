function cursorToPromise(cursor, fn) {
    return new Promise((resolve, reject) => {
        const res = {};
        cursor.onsuccess = function(e) {
            const el = e.target.result;
            if (el) {
                if (fn(el.key, el.value)) {
                    res[el.key] = el.value;
                }
                el.continue();
            } else {
                resolve(res);
            }
        };
        cursor.onerror = function(e) {
            reject(e);
        };
    });
}
const crc32 = (() => {
    const table = [];
    const poly = 0xEDB88320;
    {
        let c, n, k;

        for (n = 0; n < 256; n += 1) {
            c = n;
            for (k = 0; k < 8; k += 1) {
                if (c & 1) {
                    c = poly ^ (c >>> 1);
                } else {
                    c = c >>> 1;
                }
            }
            table[n] = c >>> 0;
        }
    }
    function strToArr(str) {
        return Array.prototype.map.call(str, function(c) {
            return c.charCodeAt(0);
        });
    }
    function calcCRC(arr) {
        if (!arr) {
            return;
        }
        let crc = 0 ^ -1;
        for (let i = 0, l = arr.length; i < l; i += 1) {
            crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
        }
        return crc ^ -1;
    }
    return function crc32(val) {
        val = typeof val === "string" ? strToArr(val) : val;
        const ret = calcCRC(val);
        return ret >>> 0;
    }
})();
async function streamToBlob(stream, type) {
    const reader = stream.getReader();
    let done = false;
    const data = [];
    while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
            data.push(result.value);
        }
    }
    return new Blob(data, {type});
}
function writeStringToDataView(dataView, offset, str) {
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        dataView.setUint8(offset + i, char);
    }
}
function timeToDOS(timestamp = new Date()) {
    let fatTime = 0;
    fatTime |= timestamp.getSeconds() >> 1;
    fatTime |= timestamp.getMinutes() << 5;
    fatTime |= timestamp.getHours() << 11;
    return fatTime;
}
function dateToDOS(timestamp = new Date()) {
    let fatTime = 0;
    fatTime |= timestamp.getDate();
    fatTime |= (timestamp.getMonth() + 1) << 5;
    fatTime |= (timestamp.getFullYear() - 1980) << 9;
    return fatTime;
}
const createArchive = (() => {
    const SIG_FILE = 0x04034b50;
    const SIG_CDFH = 0x02014b50;
    const SIG_EOCD = 0x06054b50;
    const VERSION_NOW = 63;
    const VERSION_MIN = 20;
    const ATTR_FILE = 0x0020;
    async function createLocalFileEntry(file, fileHeaderOffset) {
        const rawData = await file.arrayBuffer();
        const rawStream = file.stream();
        const compressionStream = new CompressionStream("deflate-raw");
        const compressedStream = rawStream.pipeThrough(compressionStream);
        const bufferBlob = await streamToBlob(compressedStream);
        const compressedData = await bufferBlob.arrayBuffer();
        const lastModified = new Date(file.lastModified);
        const entry = {
            generalPurpose: 0,
            compressionMethod: 0x08,
            lastModifiedTime: timeToDOS(lastModified),
            lastModifiedDate: dateToDOS(lastModified),
            crc: crc32(rawData),
            compressedSize: compressedData.byteLength,
            uncompressedSize: rawData.byteLength,
            fileNameLength: file.name.length,
            extraLength: 0,
            fileName: file.name,
            extra: "",
            fileHeaderOffset,
            compressedData
        };
        const headerBuffer = new ArrayBuffer(30 + entry.fileNameLength + entry.extraLength);
        const dataView = new DataView(headerBuffer);
        dataView.setUint32(0, SIG_FILE, true);
        dataView.setUint16(4, VERSION_MIN, true);
        dataView.setUint16(6, entry.generalPurpose, true);
        dataView.setUint16(8, entry.compressionMethod, true);
        dataView.setUint16(10, entry.lastModifiedTime, true);
        dataView.setUint16(12, entry.lastModifiedDate, true);
        dataView.setUint32(14, entry.crc, true);
        dataView.setUint32(18, entry.compressedSize, true);
        dataView.setUint32(22, entry.uncompressedSize, true);
        dataView.setUint16(26, entry.fileNameLength, true);
        dataView.setUint16(28, entry.extraLength, true);
        writeStringToDataView(dataView, 30, entry.fileName);
        writeStringToDataView(dataView, 30 + entry.fileNameLength, entry.extra);
        entry.header = headerBuffer;
        return entry;
    }
    function createCentralDirectoryFileHeader(fileEntry) {
        const {
            generalPurpose,
            compressionMethod,
            lastModifiedTime,
            lastModifiedDate,
            crc,
            compressedSize,
            uncompressedSize,
            fileNameLength,
            extraLength,
            fileName,
            extra,
            fileHeaderOffset
        } = fileEntry;
        const fileCommentLength = 0;
        const fileComment = "";
        const diskNumber = 0;
        const internalAttributes = 0;
        const externalAttributes = ATTR_FILE;
        const headerBuffer = new ArrayBuffer(46 + fileNameLength + extraLength + fileCommentLength);
        const dataView = new DataView(headerBuffer);
        dataView.setUint32(0, SIG_CDFH, true);
        dataView.setUint16(4, VERSION_NOW, true);
        dataView.setUint16(6, VERSION_MIN, true);
        dataView.setUint16(8, generalPurpose, true);
        dataView.setUint16(10, compressionMethod, true);
        dataView.setUint16(12, lastModifiedTime, true);
        dataView.setUint16(14, lastModifiedDate, true);
        dataView.setUint32(16, crc, true);
        dataView.setUint32(20, compressedSize, true);
        dataView.setUint32(24, uncompressedSize, true);
        dataView.setUint16(28, fileNameLength, true);
        dataView.setUint16(30, extraLength, true);
        dataView.setUint16(32, fileCommentLength, true);
        dataView.setUint16(34, diskNumber, true);
        dataView.setUint16(36, internalAttributes, true);
        dataView.setUint32(38, externalAttributes, true);
        dataView.setUint32(42, fileHeaderOffset, true);
        writeStringToDataView(dataView, 46, fileName);
        writeStringToDataView(dataView, 46 + fileNameLength, extra);
        writeStringToDataView(dataView, 46 + fileNameLength + extraLength, fileComment);
        return headerBuffer;
    }
    function createEndOfCentralDirectory(centralDirectories, centralDirectoryOffset) {
        const numberOfDisks = 0;
        const centralDirectoryStartDisk = 0;
        const numberCentralDirectoryRecordsOnThisDisk = centralDirectories.length;
        const numberCentralDirectoryRecords = centralDirectories.length;
        const commentLength = 0;
        const comment = "";
        let centralDirectorySize = 0;
        for (const centralDirectory of centralDirectories) {
            centralDirectorySize += centralDirectory.byteLength;
        }
        const headerBuffer = new ArrayBuffer(22 + commentLength);
        const dataView = new DataView(headerBuffer);
        dataView.setUint32(0, SIG_EOCD, true);
        dataView.setUint16(4, numberOfDisks, true);
        dataView.setUint16(6, centralDirectoryStartDisk, true);
        dataView.setUint16(8, numberCentralDirectoryRecordsOnThisDisk, true);
        dataView.setUint16(10, numberCentralDirectoryRecords, true);
        dataView.setUint32(12, centralDirectorySize, true);
        dataView.setUint32(16, centralDirectoryOffset, true);
        dataView.setUint16(20, commentLength, true);
        writeStringToDataView(dataView, 22, comment);
        return headerBuffer;
    }
    return async function createArchive(files = []) {
        const blobData = [];
        const localFileEntries = [];
        const centralDirectoryFileHeaders = [];
        let offset = 0;
        for (const file of files) {
            const entry = await createLocalFileEntry(file, offset);
            offset += entry.header.byteLength + entry.compressedSize;
            localFileEntries.push(entry);
            blobData.push(entry.header);
            blobData.push(entry.compressedData);
        }
        for (const localFileEntry of localFileEntries) {
            const entry = createCentralDirectoryFileHeader(localFileEntry);
            centralDirectoryFileHeaders.push(entry);
            blobData.push(entry);
        }
        const eocdEntry = createEndOfCentralDirectory(centralDirectoryFileHeaders, offset);
        blobData.push(eocdEntry);
        return new Blob(blobData);
    }
})();
function formatDate(date, formatter) {
    return formatter.replace(/[YMDhmsz]/g, function(m) {
        switch (m) {
            case "Y": return date.getUTCFullYear();
            case "M": return `0${date.getUTCMonth() + 1}`.slice(-2);
            case "D": return `0${date.getUTCDate()}`.slice(-2);
            case "h": return `0${date.getUTCHours()}`.slice(-2);
            case "m": return `0${date.getUTCMinutes()}`.slice(-2);
            case "s": return `0${date.getUTCSeconds()}`.slice(-2);
            case "z": return `00${date.getUTCMilliseconds()}`.slice(-2);
        }
    });
}
class StateRecoveryModule {
    #dl = null;
    constructor() {
        this.#dl = document.createElement("a");
        this.#dl.style.position = "absolute !important";
        this.#dl.style.display = "none !important";
        this.#dl.style.opacity = "0 !important";
        this.#dl.style.visibility = "hidden !important";
    }
    static #openDB(name) {
        return new Promise(function(resolve, reject) {
            const request = indexedDB.open(name);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data");
                }
            };
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function(e) {
                reject(e);
            };
        });
    }
    async #getStoreReadonly(name) {
        const iDBinst = await StateRecoveryModule.#openDB(name);
        return iDBinst.transaction("data", "readonly").objectStore("data");
    }
    async #getAll(name, filter) {
        if (typeof filter != "string") {
            filter = "";
        }
        const transaction = await this.#getStoreReadonly(name);
        const request = transaction.openCursor();
        const result = await cursorToPromise(request, (key) => key.startsWith(filter));
        return result;
    }
    #save(data, fileName) {
        const url = window.URL.createObjectURL(new Blob([data], {type: "octet/stream"}));
        this.#dl.href = url;
        this.#dl.download = fileName;
        document.body.append(this.#dl);
        this.#dl.click();
        window.URL.revokeObjectURL(url);
        this.#dl.remove();
    }
    async downloadStates(name, filter) {
        const states = await this.#getAll(name, filter);
        const files = [];
        for (const stateName in states) {
            const data = states[stateName];
            const date = formatDate(new Date(data.timestamp || 0), "YMDhms");
            const fileName = `track-oot-state.${stateName.replace(/\//g, "_")}.${date}.json`;
            files.push(new File([JSON.stringify(data, null, 4)], fileName));
        }
        const archive = await createArchive(files);
        const archiveDate = formatDate(new Date(), "YMDhms");
        this.#save(archive, `track-oot-states.${archiveDate}.zip`);
    }
}
const StateRecovery = new StateRecoveryModule();
window.StateRecovery = StateRecovery;
export default StateRecovery;
