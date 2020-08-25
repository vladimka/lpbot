module.exports = function Ctx(vk, message, db, user){
	this.api = vk.api;
	this.message = message;
	this.db = db;
	this.user = user;
	this.settings = this.db.get("settings").value();

	this.edit = async text => {
		this.api.messages.edit({
			peer_id : this.message.peer_id,
			message_id : this.message.id,
			message : text,
			keep_forward_messages : 1
		})
			.catch(err => console.error(err));
	}

	this.delete = async (id, is_for_all) => {
		id = id || this.message.id;
		is_for_all = is_for_all || 1;

		await this.api.messages.delete({
			peer_id : this.message.peer_id,
			message_id : id,
			delete_for_all : is_for_all
		});
	}

	this.sendSuccess = async (text) => {
		await this.edit('✅ ' + text);
	}

	this.sendRp = async (memberId, rpName) => {
		let rp = this.db.get('rp_commands').find({ name : rpName }).value();
		let memberName;

		if(memberId < 0){
			let member = await this.api.groups.getById({
				group_id : memberId
			});
			member = member[0];
			memberName = member.name;
		}else{
			let member = await this.api.users.get({
				user_id : memberId
			});
			member = member[0];
			memberName = memberName.last_name + " " + memberName.first_name;
		}

		let username = `${this.user.last_name} ${this.user.first_name}`;

		await this.edit(`${rp.sticker}| @id${this.user.id} (${username}) ${rp.action} @id${memberId} (${memberName})`);
	}
}