const { User } = require('../../../../../Global/Settings/Schemas')
const { ChannelType } = require("discord.js");
const Staffs = require('../../../../../Global/Base/Staff')
const { Staff, Servers } = require('../../../../../Global/Settings/Schemas')

module.exports = async function staffHandler(client, message) {
    if (!(await Staffs.checkStaff(message.member)) && !(await Staffs.checkPointStaff(message.member))) return;
    if (message.author.bot || !message.guild || message.webhookID || message.channel.type === ChannelType.DM || message.content.includes('owo') || client.system.Main.Prefix.some(x => message.content.startsWith(x))) return;

    const document = await Staff.findOne({ id: message.author.id })

    if (message.guild.settings.maxStaffs.some(x => message.member.roles.cache.has(x))) {
        if (!document?.tasks.length) return;
        await Staffs.checkTasks({
            document,
            spesificType: 'MESSAGE',
            count: 1
        })
        await Staffs.checkRole(message.member, document, 'rank')
    } else {
        await Staffs.addPoint(message.member, 'message')
        await Staffs.checkRole(message.member, document, 'point')
    }
    await document.save()
}