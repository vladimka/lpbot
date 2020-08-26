const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('config.json');
const db = low(adapter);

db.defaults({ 
	aliases : [],
	token : "",
	prefix : '.млп',
	rp_commands : []
}).write();

module.exports = db;