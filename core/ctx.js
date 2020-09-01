module.exports = function Ctx(vk, message, db, user){
	this.api = vk.api;
	this.message = message;
	this.db = db;
	this.user = user;
	this.settings = this.db.get("settings").value();

	this.edit = async (text, id) => {
		id = id || this.message.id;

		this.api.messages.edit({
			peer_id : this.message.peer_id,
			message_id : id,
			message : text,
			keep_forward_messages : 1
		})
			.catch(err => console.error(err));
	}

	this.delete = async (id, is_for_all) => {
		id = id || this.message.id;
		is_for_all = is_for_all || 1;

		if(this.message.peer_id == this.user.id)
			is_for_all = 0;

		await this.api.messages.delete({
			peer_id : this.message.peer_id,
			message_id : id,
			delete_for_all : is_for_all
		});
	}

	this.answer = async (emoji, text) => {
		this.edit(`${emoji} ${text}`);

		if(this.db.get('settings.deleteAnswers').value() == true)
			setTimeout(() => this.delete(), this.db.get('settings.deleteAnswersDelay').value() * 1000);
	}

	this.sendSuccess = async text => {
		await this.answer('✅', text);
	}

	this.sendError = async text => {
		await this.answer('⚠', text);
	}

	this.sendRp = async (memberId, rpName) => {
		let rp = this.db.get('rp_commands').find({ name : rpName }).value();
		let memberName;

		if(memberId < 0){
			let member = await this.api.groups.getById({
				group_ids : Math.abs(memberId)
			});
			member = member[0];
			memberName = `@${member.screen_name} (${member.name})`;
		}else{
			let member = await this.api.users.get({
				user_ids : memberId,
				fields : 'domain'
			});
			member = member[0];
			memberName = `@${member.domain} (${member.first_name} ${member.last_name})`;
		}

		let username = `@id${this.user.id} (${this.user.first_name} ${this.user.last_name})`;

		await this.edit(`${rp.sticker}| ${username} ${rp.action} ${memberName}`);
	}
}