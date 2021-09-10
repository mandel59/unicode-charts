/**
Copyright 2021 Ryusei Yamaguchi

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const fs = require("fs/promises")
const path = require("path")
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js")

const version = process.env.UNICODE_VERSION ?? "14.0.0"

async function main() {
    const file = await fs.readFile(path.join(__dirname, "public/charts", version, "CodeCharts.pdf"))
    const pdf = await pdfjs.getDocument(file).promise
    const entries = []
    const pageNumBegin = /** @type {number} */ 2
    const pageNumEnd = /** @type {number} */ pdf.numPages
    for (let pageNum = pageNumBegin; pageNum <= pageNumEnd; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const codePoints = textContent.items
            .filter(item => item.transform[5] >= 710 && /^[0-9A-F]{4,6}$/.test(item.str))
            .map(item => parseInt(item.str, 16))
        entries.push([Math.min(...codePoints), Math.max(...codePoints), pageNum])
    }
    await fs.writeFile(path.join(__dirname, "public/charts", version, "index.json"), Buffer.from(JSON.stringify(entries)))
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
