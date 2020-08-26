function showAliases(aliases){
	let answer = ['Ваши алиасы', ''];

	if(aliases.length == 0)
		return answer.push('У вас нету алиасов. Создайте один командой +алиас');
	else{
		aliases.forEach((alias, i) => {
			answer.push(`${i+1}. ${alias.name} (${alias.from} -> ${alias.to})`);
		});

		return answer.join('\n');
	}
}

module.exports = {
	async list(ctx){
		let aliases = ctx.db.get('aliases').value();
		
		await ctx.edit(showAliases(aliases));
	},
	async add(ctx, match){
		let { name, from, to } = match.groups;

		if(ctx.db.get('aliases').find({name}).value() != undefined)
			return await ctx.sendError(`Алиаc "${name}" уже создан`);

		ctx.db.get("aliases").push({ name, from, to }).write();

		await ctx.sendSuccess(`Алиас "${name}" создан`);
	},
	async remove(ctx, match){
		let { name, from, to } = match.groups;

		if(ctx.db.get('aliases').find({name}).value() == undefined)
			return await ctx.sendError(`Алиас "${name}" не найден`);

		ctx.db.get("aliases").remove({ name }).write();

		await ctx.sendSuccess(`Алиас "${name}" удален`);
	},
	async edit(ctx, match){
		let { name, to } = match.groups;

		if(ctx.db.get('aliases').find({name}).value() == undefined)
			return await ctx.sendError(`Алиас "${name}" не найден`);

		ctx.db.get("aliases").find({ name })
			.assign({to})
			.write();

		await ctx.sendSuccess(`Алиас "${name}" изменен`);
	}
}