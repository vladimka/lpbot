const core = require('./core/core.js');
const aliases = require('./commands/aliases.js');
const rp = require('./commands/rp.js');
const basic = require('./commands/basic.js');
const settings = require('./commands/settings.js');
const fun = require('./commands/fun.js');

core.addCommand({
	regexp : /^инфо/m,
	name : 'инфо',
	handler : basic.info
});

core.addCommand({
	regexp : /~префикс\s+(.+)/,
	name : '~префикс',
	handler : basic.prefix
})

core.addCommand({
	regexp : /алиасы/,
	name : 'алиасы',
	handler : aliases.list
});

core.addCommand({
	regexp : /\+алиас\s+(?<name>.+)\s*\/\s*(?<from>.+)\s*\/\s*(?<to>.+)/,
	name : '+алиас',
	handler : aliases.add
});

core.addCommand({
	regexp : /\-алиас\s+(?<name>.+)/,
	name : '-алиас',
	handler : aliases.remove
});

core.addCommand({
	regexp : /\~алиас\s+(?<name>.+)\s*\/\s*(?<to>.+)/,
	name : '~алиас',
	handler : aliases.edit
});

core.addCommand({
	regexp : /смсинфо/, 
	name : 'смсинфо',
	handler : basic.smsinfo
});

core.addCommand({
	name : 'рп',
	regexp : /^рп\s+(?<name>.+)/m,
	handler : rp.execute
});

core.addCommand({
	name : '+рп',
	regexp : /\+рп\s+(?<name>.+)\s*\/\s*(?<sticker>.+)\s*\/\s*(?<action>.+)/,
	handler : rp.add
});

core.addCommand({
	name : '-рп',
	regexp : /\-рп\s+(?<name>.+)/,
	handler : rp.remove
});

core.addCommand({
	name : 'рп список',
	regexp : /рп$/m,
	handler : rp.list
});

core.addCommand({
	regexp : /(js|жс)\s+(?<code>.+)/,
	name : 'js',
	handler : basic.js
});

core.addCommand({
	regexp : /^пинг$/m,
	name : 'пинг',
	handler : basic.ping
});

core.addCommand({
	regexp : /^юзеринфо$/m,
	name : 'юзеринфо',
	handler : basic.userinfo
});

core.addCommand({
	regexp : /н(айстройки)?$/m,
	name : 'список настроек',
	handler : settings.list
});

core.addCommand({
	regexp : /н(айстройки)?\s+(\d+)\s(.+)/,
	name : 'установка настройки',
	handler : settings.set
});

core.addCommand({
	regexp : /инфа\s*.+/,
	name : 'инфа',
	handler : fun.info
});

core.addCommand({
	regexp : /дд(\s+(?<offset>\d+)(\s+(?<count>\d+))?)?/,
	name : 'дд',
	handler : basic.deleteMessages
});

core.addCommand({
	regexp : /рр(\s+(?<offset>\d+)(\s+(?<count>\d+))?(\s+(?<text>.+))?)?/,
	name : 'рр',
	handler : basic.editMessages
});

core.addCommand({
	regexp : /рр\-(\s+(?<offset>\d+)(\s+(?<count>\d+))?(\s+(?<text>.+))?)?/,
	name : 'рр-',
	handler : basic.editAndDeleteMessages
});

core.addCommand({
	regexp : /тайп\s+(?<duration>\d+)\s+(?<text>.+)/,
	name : 'тайп',
	handler : fun.typing
});

core.startPolling();