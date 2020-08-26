module.exports = {
	async list(ctx){
		let answer = ['Ваши рп', ''];

		let rp_commands = await ctx.db.get('rp_commands').value();

		rp_commands.forEach((rp, i) => {
			answer.push(`${i+1}. ${rp.name}/${rp.sticker}/${rp.action}`);
		});

		if(rp_commands.length == 0)
			answer.push('У вас нету РП комманд. Создайте их командой +рп');

		await ctx.edit(answer.join('\n'));
	},
	async add(ctx, match){
		let { name, sticker, action } = match.groups;
		let rp = ctx.db.get('rp_commands').find({name}).value();

		if(rp != undefined)
			return await ctx.sendError(`РП "${name}" уже существует`);

		await ctx.db.get('rp_commands')
			.push({ name, sticker, action })
			.write();

		await ctx.sendSuccess(`РП команда "${name}" создана`);
	},
	async remove(ctx, match){
		let { name } = match.groups;

		if(ctx.db.get('rp_commands').find({name}).value() == undefined)
			return await ctx.sendError(`РП "${name}" не существует`);

		await ctx.db.get('rp_commands')
			.remove({ name})
			.write();

		await ctx.sendSuccess(`РП команда "${name}" удалена`);
	},
	async execute(ctx, match){
		let name = match.groups.name;
		let rp = ctx.db.get('rp_commands').find({name:name}).value();

		if(!ctx.message.reply_message)
			return await ctx.sendError("Необходим реплай");

		if(rp == undefined)
			return await ctx.sendError(`РП "${name}" не существует`);

		await ctx.sendRp(ctx.message.reply_message.from_id, name);
	}
}