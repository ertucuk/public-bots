const { Collection, roleMention, EmbedBuilder, Colors, inlineCode } = require('discord.js')
const ms = require('ms')
const { Staff, Servers, Tasks, Points  } = require('../Settings/Schemas')
const ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = class PointUtils {
  static async checkStaff(member) {
    const data = await Tasks.find({})
    return data.some((r) => member?.roles.cache.has(r.ROLE))
  }

  static async checkPointStaff(member) {
    const data = await Points.find({})
    return data.some((r) => member?.roles.cache.has(r.ROLE))
  }

  static async getRank(roles) {
    const data = await Tasks.find({})
    if (!data) return { currentRole: undefined, newRole: undefined }

    const sortedRoles = data.sort()
    const currentIndex = sortedRoles.findIndex((r) => roles.includes(r.ROLE))
    return {
      currentRole: sortedRoles[currentIndex] || undefined,
      currentIndex,
      newRole: sortedRoles[currentIndex + 1] || undefined,
      newIndex: currentIndex + 1
    }
  }

  static async getPointRank(roles) {
    const data = await Points.find({})
    if (!data) return { currentRole: undefined, newRole: undefined }

    const sortedRoles = data.sort((a, b) => a.POSITION - b.POSITION)
    const currentIndex = sortedRoles.findIndex((r) => roles.includes(r.ROLE))
    return {
      currentRole: sortedRoles[currentIndex] || undefined,
      currentIndex,
      newRole: sortedRoles[currentIndex + 1] || undefined,
      newIndex: currentIndex + 1
    }
  }

  static async addVoiceStat(member, channel, diff) {
    const settings = await Servers.findOne({ serverID: member.guild.id })
    const document = await Staff.findOne({ id: member.id })
    if (!document) return;

    let type = ''

    if (channel.parentId === settings.streamerParent) {
      type = 'STREAMER'
    } else if (channel.parentId === settings.publicParent && channel.id !== settings.afkChannel) {
      type = 'PUBLIC'
    } else if (channel.id === settings.afkChannel) {
      type = 'AFK'
    }

    await PointUtils.checkTasks({
      document,
      spesificType: type,
      count: diff
    });

    await PointUtils.checkRole(member, document, 'rank')
    await document.save()
  }

  static async addPoint(member, type, count, data) {

    const settings = await Servers.findOne({ serverID: member.guild.id })

    const document = await Staff.findOne({ id: member.id })
    if (!document) new Staff({ id: member.id }).save()

    if (type === 'message') {
      document.messagePoints += 1
      document.totalPoints += 1
      document.markModified('messagePoints totalPoints')

    } else if (type === 'voice') {

      const minutes = Math.max(Math.floor(count / (1000 * 60)), 1)
      let points = minutes
      let key = 'otherPoints'

      if (data.parentId === settings.publicParent && data.id !== settings.afkChannel) {
        key = 'publicPoints'
        points = minutes * 3
      }

      if (data.id === settings.afkChannel) {
        key = 'otherPoints'
        points = minutes * 2
      }

      document[key] += points
      document.totalPoints += points
      document.markModified(`${key} totalPoints`)
     
    } else if (type === 'invite') {

      document.invitedUsers.push(data.inviter.id)
      document.totalPoints += 50
      document.invitePoints += 50
      document.markModified('invitedUsers totalPoints')

    } else if (type === 'staff') {

      document.staffPoints += 20
      document.totalPoints += 20
      document.markModified('staffPoints totalPoints')

    } else if (type === 'tag') {

      document.tagPoints += 20
      document.totalPoints += 20
      document.markModified('tagPoints totalPoints')

    } else if (type === 'register') {

      document.registerPoints += 50
      document.totalPoints += 50
      document.markModified('registerPoints totalPoints')

    } else if (type === 'responsibility') {

      document.responsibilityPoints += 50
      document.totalPoints += 50
      document.markModified('responsibilityPoints totalPoints')

    }
    await document.save()
  }

  static async checkTasks({ document, spesificType, count }) {
    if (!document || !document.tasks) return;

    const findedTask = spesificType ? { TYPE: spesificType } : undefined
    if (!findedTask) return

    const task = document.tasks.find((t) => t.type === findedTask.TYPE)
    if (!task || task.completed) return

    task.currentCount += count
    task.completed = task.currentCount >= task.requiredCount
    document.markModified('tasks')
  }

  static async checkRole(member, document, type) {
    if (member.user.bot) return;

    const logChannel = await client.getChannel('staff-log', member);
    if (!logChannel) return;

    if (type === 'rank') {

      if (!document && !document.tasks) return;

      const { currentRole, newRole } = await PointUtils.getRank(member.roles.cache.map((r) => r.id))
      if (!currentRole || !newRole) return

      const completedTasks = document.tasks.filter((t) => t.completed == true && !t.name.includes('RESPONSIBILITY'))
      if (document.tasks.length === 0) return;
      if (completedTasks !== document.tasks.length) return;

      if (completedTasks >= document.tasks.length) {
        logChannel.send({ content: `${member} adlı kullanıcı ${roleMention(currentRole.ROLE)} rolünün görevlerini bitirdi. Tebrikler!` });
      }
      
    } else if (type === 'point') {

      const { currentRole, newRole } = await PointUtils.getPointRank(member.roles.cache.map((r) => r.id))
      if (!currentRole) return

      if (document?.totalPoints >= currentRole.POINT) {

        if (newRole) logChannel.send({ content: `${member} adlı kullanıcı toplamda ${document.totalPoints} puana ulaşarak ${roleMention(currentRole.ROLE)} yetkisinden ${roleMention(newRole.ROLE)} yetkisine geçti.` });
        document.oldRoles.push({ timestamp: Date.now(), roles: [newRole?.ROLE, newRole?.EXTRA_ROLE] });
        document.roleStarted = Date.now();
        document.invitedUsers = [];
        document.tasks = [];
        document.task = '';
        document.totalPoints = 0;
        document.registerPoints = 0;
        document.invitePoints = 0;
        document.otherPoints = 0;
        document.messagePoints = 0;
        document.responsibilityPoints = 0;
        document.staffPoints = 0;
        document.tagPoints = 0;
        document.publicPoints = 0;
        document.bonusPoints = 0;
        document.markModified('oldRoles roleStarted invitedUsers tasks staffTakes task totalPoints registerPoints invitePoints otherPoints messagePoints responsibilityPoints staffPoints tagPoints publicPoints bonusPoints')
        await document.save()

        const taskDocument = await Tasks.find({})
        const sortedRanks = taskDocument.sort((a, b) => a.POSITION - b.POSITION)

        if (!newRole) {
          sortedRanks[0].EXTRA_ROLE.forEach((r) => member.roles.add(r))
          await member.roles.add(sortedRanks[0].ROLE)
          await member.roles.remove(currentRole.ROLE)
          currentRole.EXTRA_ROLE.forEach((r) => member.roles.remove(r))
          logChannel.send({ content: `${member} adlı kullanıcı toplamda ${currentRole.POINT} puana ulaşarak ${roleMention(currentRole.ROLE)} yetkisinden ${roleMention(sortedRanks[0].ROLE)} yetkisine geçti.` });
          document.oldRoles.push({ timestamp: Date.now(), roles: [sortedRanks[0].ROLE, sortedRanks[0].EXTRA_ROLE] })
          await document.save()
          return;
        }

        await member.roles.remove(currentRole.ROLE);
        currentRole.EXTRA_ROLE.forEach((r) => member.roles.remove(r));
        await member.roles.add(newRole.ROLE);
        newRole.EXTRA_ROLE.forEach((r) => member.roles.add(r))
      }
    }
  }
}