import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsSrlog from './src/fsSrlog.mjs'
import dig from './src/dig.mjs'
import genPm from './src/genPm.mjs'
import delay from './src/delay.mjs'
import genIDSeq from './src/genIDSeq.mjs'


let id = genIDSeq()
console.log('id', id)

//node g.mjs
