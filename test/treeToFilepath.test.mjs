import assert from 'assert'
import treeToFilepath from '../src/treeToFilepath.mjs'


describe(`treeToFilepath`, function() {

    let rti1 = [{ 'ns': 1, 'ts': ['root'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root', 'parentId': '', 'text': 'root', 'children': [{ 'ns': 2, 'ts': ['root', 'aaa'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa', 'parentId': 'root', 'text': 'aaa', 'children': [{ 'ns': 3, 'ts': ['root', 'aaa', 'mmm'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm', 'parentId': 'root❯aaa', 'text': 'mmm', 'children': [{ 'ns': 4, 'ts': ['root', 'aaa', 'mmm', 'z1.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }, { 'id': 'root❯aaa❯mmm❯z1.txt', 'name': 'z1.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm❯z1.txt', 'parentId': 'root❯aaa❯mmm', 'text': 'z1.txt', 'data': { 'type': 'file', 'path': '/aaa/mmm/z1.txt' } }], 'data': null }], 'data': { 'type': 'folder', 'path': '/aaa' } }], 'data': null }]
    // let rfps1 = treeToFilepath(rti1, {})
    let rfps1 = [
        { type: 'folder', path: '/aaa' },
        { type: 'folder', path: '/aaa/mmm' },
        { type: 'file', path: '/aaa/mmm/z1.txt' }
    ]
    it(`should return ${JSON.stringify(rfps1)} when input ${JSON.stringify(rti1)}`, function() {
        let r = treeToFilepath(rti1)
        let rr = rfps1
        assert.strict.deepStrictEqual(r, rr)
    })

    let rti2 = [{ 'ns': 1, 'ts': ['root'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root', 'parentId': '', 'text': 'root', 'children': [{ 'ns': 2, 'ts': ['root', 'aaa'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaa', 'parentId': 'root', 'text': 'aaa', 'children': [{ 'ns': 3, 'ts': ['root', 'aaa', 'aaammm'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaa>aaammm', 'parentId': 'root>aaa', 'text': 'aaammm', 'children': [{ 'ns': 4, 'ts': ['root', 'aaa', 'aaammm', 'abc'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc', 'parentId': 'root>aaa>aaammm', 'text': 'abc', 'children': [{ 'ns': 5, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcd'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcd', 'name': 'abcd' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcd', 'parentId': 'root>aaa>aaammm>abc', 'text': 'abcd', 'children': [{ 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcd', 'abcde.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcd', 'name': 'abcd' }, { 'id': 'root>aaa>aaammm>abc>abcd>abcde.txt', 'name': 'abcde.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcd>abcde.txt', 'parentId': 'root>aaa>aaammm>abc>abcd', 'text': 'abcde.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd/abcde.txt' } }], 'data': null }, { 'ns': 5, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde', 'parentId': 'root>aaa>aaammm>abc', 'text': 'abcde', 'children': [{ 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdef1.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdef1.txt', 'name': 'abcdef1.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdef1.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdef1.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef1.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdef2.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdef2.txt', 'name': 'abcdef2.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdef2.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdef2.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef2.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt', 'name': 'abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg01.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg01.txt', 'name': 'abcdefg01.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg01.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg01.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg01.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg02.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg02.txt', 'name': 'abcdefg02.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg02.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg02.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg02.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg03.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg03.txt', 'name': 'abcdefg03.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg03.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg03.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg03.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg04.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg04.txt', 'name': 'abcdefg04.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg04.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg04.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg04.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg05.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg05.txt', 'name': 'abcdefg05.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg05.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg05.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg05.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg06.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg06.txt', 'name': 'abcdefg06.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg06.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg06.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg06.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg07.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg07.txt', 'name': 'abcdefg07.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg07.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg07.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg07.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg08.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg08.txt', 'name': 'abcdefg08.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg08.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg08.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg08.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg09.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg09.txt', 'name': 'abcdefg09.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg09.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg09.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg09.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg10.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg10.txt', 'name': 'abcdefg10.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg10.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg10.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg10.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg11.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg11.txt', 'name': 'abcdefg11.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg11.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg11.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg11.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg12.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg12.txt', 'name': 'abcdefg12.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg12.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg12.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg12.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg13.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg13.txt', 'name': 'abcdefg13.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg13.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg13.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg13.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg14.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg14.txt', 'name': 'abcdefg14.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg14.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg14.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg14.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg15.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg15.txt', 'name': 'abcdefg15.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg15.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg15.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg15.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg16.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg16.txt', 'name': 'abcdefg16.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg16.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg16.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg16.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg17.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg17.txt', 'name': 'abcdefg17.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg17.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg17.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg17.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg18.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg18.txt', 'name': 'abcdefg18.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg18.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg18.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg18.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg19.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg19.txt', 'name': 'abcdefg19.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg19.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg19.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg19.txt' } }, { 'ns': 6, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcde', 'abcdefg20.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcde', 'name': 'abcde' }, { 'id': 'root>aaa>aaammm>abc>abcde>abcdefg20.txt', 'name': 'abcdefg20.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcde>abcdefg20.txt', 'parentId': 'root>aaa>aaammm>abc>abcde', 'text': 'abcdefg20.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg20.txt' } }], 'data': null }, { 'ns': 5, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcd1.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcd1.txt', 'name': 'abcd1.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcd1.txt', 'parentId': 'root>aaa>aaammm>abc', 'text': 'abcd1.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd1.txt' } }, { 'ns': 5, 'ts': ['root', 'aaa', 'aaammm', 'abc', 'abcd2.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>aaa>aaammm>abc>abcd2.txt', 'name': 'abcd2.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>abc>abcd2.txt', 'parentId': 'root>aaa>aaammm>abc', 'text': 'abcd2.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd2.txt' } }], 'data': null }, { 'ns': 4, 'ts': ['root', 'aaa', 'aaammm', 'aaammmccc.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>aaa>aaammm>aaammmccc.txt', 'name': 'aaammmccc.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm>aaammmccc.txt', 'parentId': 'root>aaa>aaammm', 'text': 'aaammmccc.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm/aaammmccc.txt' } }], 'data': { 'type': 'folder', 'path': '/aaa/aaammm' } }, { 'ns': 3, 'ts': ['root', 'aaa', 'aaammm.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa', 'name': 'aaa' }, { 'id': 'root>aaa>aaammm.txt', 'name': 'aaammm.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa>aaammm.txt', 'parentId': 'root>aaa', 'text': 'aaammm.txt', 'data': { 'type': 'file', 'path': '/aaa/aaammm.txt' } }], 'data': { 'type': 'folder', 'path': '/aaa' } }, { 'ns': 2, 'ts': ['root', 'aaaa'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaaa', 'name': 'aaaa' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaaa', 'parentId': 'root', 'text': 'aaaa', 'children': [{ 'ns': 3, 'ts': ['root', 'aaaa', 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaaa', 'name': 'aaaa' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'name': 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'parentId': 'root>aaaa', 'text': 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'children': [{ 'ns': 4, 'ts': ['root', 'aaaa', 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'ggg'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaaa', 'name': 'aaaa' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'name': 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>ggg', 'name': 'ggg' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>ggg', 'parentId': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'text': 'ggg', 'children': [{ 'ns': 5, 'ts': ['root', 'aaaa', 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'ggg', 'hhh.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaaa', 'name': 'aaaa' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'name': 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>ggg', 'name': 'ggg' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>ggg>hhh.txt', 'name': 'hhh.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>ggg>hhh.txt', 'parentId': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>ggg', 'text': 'hhh.txt', 'data': { 'type': 'file', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt' } }], 'data': null }, { 'ns': 4, 'ts': ['root', 'aaaa', 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'gfedcba.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaaa', 'name': 'aaaa' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'name': 'mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>gfedcba.txt', 'name': 'gfedcba.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff>gfedcba.txt', 'parentId': 'root>aaaa>mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff', 'text': 'gfedcba.txt', 'data': { 'type': 'file', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt' } }], 'data': { 'type': 'folder', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' } }], 'data': null }, { 'ns': 2, 'ts': ['root', 'mmm'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>mmm', 'name': 'mmm' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>mmm', 'parentId': 'root', 'text': 'mmm', 'children': [], 'data': { 'type': 'folder', 'path': '/mmm' } }, { 'ns': 2, 'ts': ['root', 'c:'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>c:', 'name': 'c:' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>c:', 'parentId': 'root', 'text': 'c:', 'children': [{ 'ns': 3, 'ts': ['root', 'c:', 'hhh'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>c:', 'name': 'c:' }, { 'id': 'root>c:>hhh', 'name': 'hhh' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>c:>hhh', 'parentId': 'root>c:', 'text': 'hhh', 'children': [], 'data': { 'type': 'folder', 'path': 'c:\\\\hhh' } }], 'data': null }, { 'ns': 2, 'ts': ['root', 'ccc'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>ccc', 'name': 'ccc' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>ccc', 'parentId': 'root', 'text': 'ccc', 'children': [{ 'ns': 3, 'ts': ['root', 'ccc', 'cccddd'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>ccc', 'name': 'ccc' }, { 'id': 'root>ccc>cccddd', 'name': 'cccddd' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>ccc>cccddd', 'parentId': 'root>ccc', 'text': 'cccddd', 'children': [{ 'ns': 4, 'ts': ['root', 'ccc', 'cccddd', 'cccdddeee.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>ccc', 'name': 'ccc' }, { 'id': 'root>ccc>cccddd', 'name': 'cccddd' }, { 'id': 'root>ccc>cccddd>cccdddeee.txt', 'name': 'cccdddeee.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>ccc>cccddd>cccdddeee.txt', 'parentId': 'root>ccc>cccddd', 'text': 'cccdddeee.txt', 'data': { 'type': 'file', 'path': '/ccc/cccddd/cccdddeee.txt' } }], 'data': null }], 'data': null }, { 'ns': 2, 'ts': ['root', 'd:'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>d:', 'name': 'd:' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>d:', 'parentId': 'root', 'text': 'd:', 'children': [{ 'ns': 3, 'ts': ['root', 'd:', '中文路徑1'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>d:', 'name': 'd:' }, { 'id': 'root>d:>中文路徑1', 'name': '中文路徑1' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>d:>中文路徑1', 'parentId': 'root>d:', 'text': '中文路徑1', 'children': [], 'data': { 'type': 'folder', 'path': 'd:\\\\中文路徑1' } }], 'data': null }, { 'ns': 2, 'ts': ['root', 'eee'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>eee', 'name': 'eee' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>eee', 'parentId': 'root', 'text': 'eee', 'children': [{ 'ns': 3, 'ts': ['root', 'eee', 'eeefff1'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>eee', 'name': 'eee' }, { 'id': 'root>eee>eeefff1', 'name': 'eeefff1' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>eee>eeefff1', 'parentId': 'root>eee', 'text': 'eeefff1', 'children': [], 'data': { 'type': 'folder', 'path': '/eee/eeefff1' } }, { 'ns': 3, 'ts': ['root', 'eee', 'eeefff2'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>eee', 'name': 'eee' }, { 'id': 'root>eee>eeefff2', 'name': 'eeefff2' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>eee>eeefff2', 'parentId': 'root>eee', 'text': 'eeefff2', 'children': [], 'data': { 'type': 'folder', 'path': '/eee/eeefff2' } }], 'data': { 'type': 'folder', 'path': '/eee' } }, { 'ns': 2, 'ts': ['root', 'ggg'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>ggg', 'name': 'ggg' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>ggg', 'parentId': 'root', 'text': 'ggg', 'children': [], 'data': { 'type': 'folder', 'path': '/ggg/' } }, { 'ns': 2, 'ts': ['root', '中文路徑2'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>中文路徑2', 'name': '中文路徑2' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>中文路徑2', 'parentId': 'root', 'text': '中文路徑2', 'children': [{ 'ns': 3, 'ts': ['root', '中文路徑2', 'aaa'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>中文路徑2', 'name': '中文路徑2' }, { 'id': 'root>中文路徑2>aaa', 'name': 'aaa' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>中文路徑2>aaa', 'parentId': 'root>中文路徑2', 'text': 'aaa', 'children': [{ 'ns': 4, 'ts': ['root', '中文路徑2', 'aaa', 'aaammm'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>中文路徑2', 'name': '中文路徑2' }, { 'id': 'root>中文路徑2>aaa', 'name': 'aaa' }, { 'id': 'root>中文路徑2>aaa>aaammm', 'name': 'aaammm' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>中文路徑2>aaa>aaammm', 'parentId': 'root>中文路徑2>aaa', 'text': 'aaammm', 'children': [{ 'ns': 5, 'ts': ['root', '中文路徑2', 'aaa', 'aaammm', 'abc'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>中文路徑2', 'name': '中文路徑2' }, { 'id': 'root>中文路徑2>aaa', 'name': 'aaa' }, { 'id': 'root>中文路徑2>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>中文路徑2>aaa>aaammm>abc', 'name': 'abc' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root>中文路徑2>aaa>aaammm>abc', 'parentId': 'root>中文路徑2>aaa>aaammm', 'text': 'abc', 'children': [{ 'ns': 6, 'ts': ['root', '中文路徑2', 'aaa', 'aaammm', 'abc', '測試.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>中文路徑2', 'name': '中文路徑2' }, { 'id': 'root>中文路徑2>aaa', 'name': 'aaa' }, { 'id': 'root>中文路徑2>aaa>aaammm', 'name': 'aaammm' }, { 'id': 'root>中文路徑2>aaa>aaammm>abc', 'name': 'abc' }, { 'id': 'root>中文路徑2>aaa>aaammm>abc>測試.txt', 'name': '測試.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>中文路徑2>aaa>aaammm>abc>測試.txt', 'parentId': 'root>中文路徑2>aaa>aaammm>abc', 'text': '測試.txt', 'data': { 'type': 'file', 'path': '/中文路徑2/aaa/aaammm/abc/測試.txt' } }], 'data': null }], 'data': null }], 'data': null }], 'data': { 'type': 'folder', 'path': '/中文路徑2' } }, { 'ns': 2, 'ts': ['root', 'aaa1.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa1.txt', 'name': 'aaa1.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa1.txt', 'parentId': 'root', 'text': 'aaa1.txt', 'data': { 'type': 'file', 'path': '/aaa1.txt' } }, { 'ns': 2, 'ts': ['root', 'aaa2.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root>aaa2.txt', 'name': 'aaa2.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root>aaa2.txt', 'parentId': 'root', 'text': 'aaa2.txt', 'data': { 'type': 'file', 'path': '/aaa2.txt' } }], 'data': null }]
    // let rfps2 = treeToFilepath(rti2, {})
    let rfps2 = [
        { type: 'folder', path: '/aaa' },
        { type: 'folder', path: '/aaa/aaammm' },
        { type: 'folder', path: '/aaa/aaammm/abc' },
        { type: 'folder', path: '/aaa/aaammm/abc/abcd' },
        { type: 'file', path: '/aaa/aaammm/abc/abcd/abcde.txt' },
        { type: 'folder', path: '/aaa/aaammm/abc/abcde' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdef1.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdef2.txt' },
        {
            type: 'file',
            path: '/aaa/aaammm/abc/abcde/abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt'
        },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg01.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg02.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg03.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg04.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg05.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg06.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg07.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg08.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg09.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg10.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg11.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg12.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg13.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg14.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg15.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg16.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg17.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg18.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg19.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcde/abcdefg20.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcd1.txt' },
        { type: 'file', path: '/aaa/aaammm/abc/abcd2.txt' },
        { type: 'file', path: '/aaa/aaammm/aaammmccc.txt' },
        { type: 'file', path: '/aaa/aaammm.txt' },
        { type: 'folder', path: '/aaaa' },
        {
            type: 'folder',
            path: '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff'
        },
        {
            type: 'folder',
            path: '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg'
        },
        {
            type: 'file',
            path: '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt'
        },
        {
            type: 'file',
            path: '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt'
        },
        { type: 'folder', path: '/mmm' },
        { type: 'folder', path: '/c:' },
        { type: 'folder', path: '/c:/hhh' },
        { type: 'folder', path: '/ccc' },
        { type: 'folder', path: '/ccc/cccddd' },
        { type: 'file', path: '/ccc/cccddd/cccdddeee.txt' },
        { type: 'folder', path: '/d:' },
        { type: 'folder', path: '/d:/中文路徑1' },
        { type: 'folder', path: '/eee' },
        { type: 'folder', path: '/eee/eeefff1' },
        { type: 'folder', path: '/eee/eeefff2' },
        { type: 'folder', path: '/ggg' },
        { type: 'folder', path: '/中文路徑2' },
        { type: 'folder', path: '/中文路徑2/aaa' },
        { type: 'folder', path: '/中文路徑2/aaa/aaammm' },
        { type: 'folder', path: '/中文路徑2/aaa/aaammm/abc' },
        { type: 'file', path: '/中文路徑2/aaa/aaammm/abc/測試.txt' },
        { type: 'file', path: '/aaa1.txt' },
        { type: 'file', path: '/aaa2.txt' }
    ]
    it(`should return ${JSON.stringify(rfps2)} when input ${JSON.stringify(rti2)}`, function() {
        let r = treeToFilepath(rti2)
        let rr = rfps2
        assert.strict.deepStrictEqual(r, rr)
    })

    let rti3 = [{ 'ns': 1, 'ts': ['root'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root', 'parentId': '', 'text': 'root', 'children': [{ 'ns': 2, 'ts': ['root', 'aaa'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa', 'parentId': 'root', 'text': 'aaa', 'children': [{ 'ns': 3, 'ts': ['root', 'aaa', 'mmm'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm', 'parentId': 'root❯aaa', 'text': 'mmm', 'children': [{ 'ns': 4, 'ts': ['root', 'aaa', 'mmm', 'z1.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }, { 'id': 'root❯aaa❯mmm❯z1.txt', 'name': 'z1.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm❯z1.txt', 'parentId': 'root❯aaa❯mmm', 'text': 'z1.txt', 'data': { 'type': 'file', 'path': '/aaa/mmm/z1.txt' } }, { 'ns': 4, 'ts': ['root', 'aaa', 'mmm', 'z10.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }, { 'id': 'root❯aaa❯mmm❯z10.txt', 'name': 'z10.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm❯z10.txt', 'parentId': 'root❯aaa❯mmm', 'text': 'z10.txt', 'data': { 'type': 'file', 'path': '/aaa/mmm/z10.txt' } }, { 'ns': 4, 'ts': ['root', 'aaa', 'mmm', 'z2.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }, { 'id': 'root❯aaa❯mmm❯z2.txt', 'name': 'z2.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm❯z2.txt', 'parentId': 'root❯aaa❯mmm', 'text': 'z2.txt', 'data': { 'type': 'file', 'path': '/aaa/mmm/z2.txt' } }], 'data': null }], 'data': null }, { 'ns': 2, 'ts': ['root', 'aaa1'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa1', 'name': 'aaa1' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa1', 'parentId': 'root', 'text': 'aaa1', 'children': [], 'data': { 'type': 'folder', 'path': '/aaa1' } }, { 'ns': 2, 'ts': ['root', 'aaa10'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa10', 'name': 'aaa10' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa10', 'parentId': 'root', 'text': 'aaa10', 'children': [], 'data': { 'type': 'folder', 'path': '/aaa10' } }, { 'ns': 2, 'ts': ['root', 'aaa2'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa2', 'name': 'aaa2' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa2', 'parentId': 'root', 'text': 'aaa2', 'children': [], 'data': { 'type': 'folder', 'path': '/aaa2' } }], 'data': null }]
    // let rfps3 = treeToFilepath(rti3, {})
    let rfps3 = [
        { type: 'folder', path: '/aaa' },
        { type: 'folder', path: '/aaa/mmm' },
        { type: 'file', path: '/aaa/mmm/z1.txt' },
        { type: 'file', path: '/aaa/mmm/z10.txt' },
        { type: 'file', path: '/aaa/mmm/z2.txt' },
        { type: 'folder', path: '/aaa1' },
        { type: 'folder', path: '/aaa10' },
        { type: 'folder', path: '/aaa2' }
    ]
    it(`should return ${JSON.stringify(rfps3)} when input ${JSON.stringify(rti3)}`, function() {
        let r = treeToFilepath(rti3)
        let rr = rfps3
        assert.strict.deepStrictEqual(r, rr)
    })

    let rti4 = [{ 'ns': 1, 'ts': ['root'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root', 'parentId': '', 'text': 'root', 'children': [{ 'ns': 2, 'ts': ['root', 'aaa'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa', 'parentId': 'root', 'text': 'aaa', 'children': [{ 'ns': 3, 'ts': ['root', 'aaa', 'mmm'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm', 'parentId': 'root❯aaa', 'text': 'mmm', 'children': [{ 'ns': 4, 'ts': ['root', 'aaa', 'mmm', 'z1.txt'], 'pathInfors': [{ 'id': 'root', 'name': 'root' }, { 'id': 'root❯aaa', 'name': 'aaa' }, { 'id': 'root❯aaa❯mmm', 'name': 'mmm' }, { 'id': 'root❯aaa❯mmm❯z1.txt', 'name': 'z1.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'root❯aaa❯mmm❯z1.txt', 'parentId': 'root❯aaa❯mmm', 'text': 'z1.txt', 'data': { 'type': 'file', 'path': '/aaa/mmm/z1.txt' } }], 'data': null }], 'data': { 'type': 'folder', 'path': '/aaa' } }], 'data': null }]
    // let rfps4 = treeToFilepath(rti4, { delimiter: '>' })
    let rfps4 = [
        { type: 'folder', path: '>aaa' },
        { type: 'folder', path: '>aaa>mmm' },
        { type: 'file', path: '>aaa>mmm>z1.txt' }
    ]
    it(`should return ${JSON.stringify(rfps4)} when input ${JSON.stringify(rti4)}`, function() {
        let r = treeToFilepath(rti4, { delimiter: '>' })
        let rr = rfps4
        assert.strict.deepStrictEqual(r, rr)
    })

    let rti5 = [{ 'ns': 1, 'ts': ['ROOT'], 'pathInfors': [{ 'id': 'ROOT', 'name': 'ROOT' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'ROOT', 'parentId': '', 'text': 'ROOT', 'children': [{ 'ns': 2, 'ts': ['ROOT', 'aaa'], 'pathInfors': [{ 'id': 'ROOT', 'name': 'ROOT' }, { 'id': 'ROOT❯aaa', 'name': 'aaa' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'ROOT❯aaa', 'parentId': 'ROOT', 'text': 'aaa', 'children': [{ 'ns': 3, 'ts': ['ROOT', 'aaa', 'mmm'], 'pathInfors': [{ 'id': 'ROOT', 'name': 'ROOT' }, { 'id': 'ROOT❯aaa', 'name': 'aaa' }, { 'id': 'ROOT❯aaa❯mmm', 'name': 'mmm' }], '_type': 'folder', 'type': 'array', 'numOfChilren': -1, 'id': 'ROOT❯aaa❯mmm', 'parentId': 'ROOT❯aaa', 'text': 'mmm', 'children': [{ 'ns': 4, 'ts': ['ROOT', 'aaa', 'mmm', 'z1.txt'], 'pathInfors': [{ 'id': 'ROOT', 'name': 'ROOT' }, { 'id': 'ROOT❯aaa', 'name': 'aaa' }, { 'id': 'ROOT❯aaa❯mmm', 'name': 'mmm' }, { 'id': 'ROOT❯aaa❯mmm❯z1.txt', 'name': 'z1.txt' }], '_type': 'file', 'type': 'node', 'numOfChilren': -1, 'id': 'ROOT❯aaa❯mmm❯z1.txt', 'parentId': 'ROOT❯aaa❯mmm', 'text': 'z1.txt', 'data': { 'type': 'file', 'path': '/aaa/mmm/z1.txt' } }], 'data': null }], 'data': { 'type': 'folder', 'path': '/aaa' } }], 'data': null }]
    // let rfps5 = treeToFilepath(rti5, { bindRoot: 'ROOT' })
    let rfps5 = [
        { type: 'folder', path: '/aaa' },
        { type: 'folder', path: '/aaa/mmm' },
        { type: 'file', path: '/aaa/mmm/z1.txt' }
    ]
    it(`should return ${JSON.stringify(rfps5)} when input ${JSON.stringify(rti5)}`, function() {
        let r = treeToFilepath(rti5, { bindRoot: 'ROOT' })
        let rr = rfps5
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = treeToFilepath([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    //使用者2026-11-03(dspec〈輸入參數之檢測機制〉§11 第221項 待決第6項, 「都A」; 排程第492項第1批落實): data非陣列throw、元素非物件throw並指出第幾個(訊息不帶值, V19/V20); []與無_type之物件節點照舊
    //ws492h(第492項第7批, 使用者2026-11-16「W-16:乙」): data為第1參數, 非陣列一律回輸出型別之空結果[], 不拋錯(原R25為throw invalid data); 陣列之元素非物件(元素層)依第二批維持throw並指出第幾個
    //  對應規格: dspec〈輸入參數之檢測機制〉§11「C7結構運算之第1參數(使用者2026-11-16 W-16:乙)」
    describe(`data非陣列回[]、元素非物件拋錯(R25: 使用者2026-11-03; ws492h W-16乙: data非陣列改回[])`, function() {

        //[名稱, 輸入]
        let notArrs = [
            [`''`, ''],
            [`'x'`, 'x'],
            [`{}`, {}],
            [`{ length: 1, 0: {} }`, { length: 1, 0: {} }],
            [`null`, null],
            [`undefined`, undefined],
            [`NaN`, NaN],
            [`0`, 0],
            [`123`, 123],
            [`true`, true],
            [`function`, () => []],
            [`Symbol`, Symbol('s')],
            [`new Map`, new Map()],
        ]
        for (let [name, v] of notArrs) {
            it(`should return [] (no throw) when data is ${name}`, function() {
                let r = treeToFilepath(v)
                assert.strict.deepStrictEqual(r, [])
                assert.ok(Array.isArray(r))
            })
        }

        it(`should return [] (no throw) for a non-array even when opt is given`, function() {
            assert.strict.deepStrictEqual(treeToFilepath('x', { delimiter: '>' }), [])
            assert.strict.deepStrictEqual(treeToFilepath(null, { bindRoot: 'ROOT' }), [])
        })

        //[名稱, 輸入, 預期訊息]
        let badElems = [
            [`[1]`, [1], 'invalid data[0]: must be an object'],
            [`['a']`, ['a'], 'invalid data[0]: must be an object'],
            [`[null]`, [null], 'invalid data[0]: must be an object'],
            [`[undefined]`, [undefined], 'invalid data[0]: must be an object'],
            [`[[]]`, [[]], 'invalid data[0]: must be an object'],
            [`[true]`, [true], 'invalid data[0]: must be an object'],
            [`[function]`, [() => ({})], 'invalid data[0]: must be an object'],
            [`[{}, 1]`, [{}, 1], 'invalid data[1]: must be an object'],
            [`[{}, {}, 'x']`, [{}, {}, 'x'], 'invalid data[2]: must be an object'],
            [`[{}, 1, null] (first bad element is reported)`, [{}, 1, null], 'invalid data[1]: must be an object'],
            [`sparse [<hole>, {}]`, [, {}], 'invalid data[0]: must be an object'], // eslint-disable-line no-sparse-arrays
        ]
        for (let [name, v, msg] of badElems) {
            it(`should throw '${msg}' when data is ${name}`, function() {
                assert.throws(() => treeToFilepath(v), (err) => err instanceof Error && err.message === msg)
            })
        }

        it(`should not echo the input value in the message (V20)`, function() {
            let secret = 'SECRET-VALUE-9f3a'
            let msgs = []
            for (let v of [secret, [secret], [{}, secret], [{ a: 1 }, 12345678]]) {
                try {
                    treeToFilepath(v)
                    msgs.push('NOTHROW')
                }
                catch (err) {
                    msgs.push(err.message)
                }
            }
            assert.strict.deepStrictEqual(msgs, ['NOTHROW', 'invalid data[0]: must be an object', 'invalid data[1]: must be an object', 'invalid data[1]: must be an object'])
            for (let m of msgs) {
                assert.ok(m.indexOf('SECRET') < 0 && m.indexOf('12345678') < 0, m)
            }
        })

        it(`should return [] at once as data and throw as an element for an object that fakes an Array by Symbol.toStringTag, without iterating its length (terra #7; R-OBJ-ITER-01 rule 2)`, function() {
            let fake = { [Symbol.toStringTag]: 'Array', 0: { _type: 'file', pathInfors: [{ name: 'a' }] }, length: Number.MAX_SAFE_INTEGER }
            let t0 = Date.now()
            assert.strict.deepStrictEqual(treeToFilepath(fake), [])
            //元素為偽稱Array之物件或真陣列: 非物件
            assert.throws(() => treeToFilepath([{}, fake]), { message: 'invalid data[1]: must be an object' })
            let real = [1]
            Object.defineProperty(real, Symbol.toStringTag, { value: 'Object' }) //真陣列偽稱Object, 作為元素仍非物件
            assert.throws(() => treeToFilepath([real]), { message: 'invalid data[0]: must be an object' })
            assert.ok(Date.now() - t0 < 1000)
        })

        it(`should keep returning [] for [] and for object nodes without a valid _type (unchanged)`, function() {
            assert.strict.deepStrictEqual(treeToFilepath([]), [])
            assert.strict.deepStrictEqual(treeToFilepath([{}]), [])
            assert.strict.deepStrictEqual(treeToFilepath([{}, {}]), [])
            assert.strict.deepStrictEqual(treeToFilepath([{ a: 1 }]), [])
            assert.strict.deepStrictEqual(treeToFilepath([{ _type: 'other', pathInfors: [{ name: 'x' }] }]), [])
            assert.strict.deepStrictEqual(treeToFilepath([{ _type: 123 }]), [])
        })

        it(`should keep converting valid nodes when some top-level elements are objects without _type`, function() {
            let r = treeToFilepath([{}, { _type: 'file', pathInfors: [{ name: 'root' }, { name: 'a.txt' }] }, { x: 1 }])
            assert.strict.deepStrictEqual(r, [{ type: 'file', path: '/a.txt' }])
        })

        it(`should only check the top-level elements (children are walked as before and a non-object child is skipped)`, function() {
            let r = treeToFilepath([{ _type: 'folder', pathInfors: [{ name: 'root' }, { name: 'a' }], children: [1, null, 'x', { _type: 'file', pathInfors: [{ name: 'root' }, { name: 'a' }, { name: 'b.txt' }] }] }])
            assert.strict.deepStrictEqual(r, [{ type: 'folder', path: '/a' }, { type: 'file', path: '/a/b.txt' }])
        })

        it(`should accept array-like-length objects only as elements, never as data`, function() {
            //data帶length鍵之物件不是陣列(isarr為false)
            assert.strict.deepStrictEqual(treeToFilepath({ length: 1, 0: { _type: 'file' } }), [])
            //元素帶length鍵之物件仍是物件
            assert.strict.deepStrictEqual(treeToFilepath([{ length: 2 }]), [])
        })

    })

})
