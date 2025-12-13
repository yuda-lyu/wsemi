import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsIsFile from './src/fsIsFile.mjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsIsFolder from './src/fsIsFolder.mjs'
import fsCleanFolder from './src/fsCleanFolder.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsWriteText from './src/fsWriteText.mjs'
import fsWriteJson from './src/fsWriteJson.mjs'
import html2str from './src/html2str.mjs'


let h = `
  <!DOCTYPE html>
  <html>
 
  <body>
      <h1>My First Heading</h1>
      <p>My first paragraph.</p>
  </body>
 
  </html>
  `

let c = html2str(h)
console.log(c)
// MY FIRST HEADING
//
// My first paragraph.

//node g.mjs
