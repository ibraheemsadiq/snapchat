module.exports = Device

var debug = require('debug')('snapchat:device')

var constants = require('../lib/constants')
var StringUtils = require('../lib/string-utils')

/**
 * Snapchat wrapper for chat-related API calls.
 *
 * @param {Object} opts
 */
function Device (client, opts) {
  var self = this
  if (!(self instanceof Device)) return new Device(client, opts)
  if (!opts) opts = {}

  self.client = client
}

/**
 * Sends the "app did open" event to Snapchat.
 *
 * @param {function} cb
 */
Device.prototype.sendDidOpenAppEvent = function (cb) {
  var self = this
  debug('Device.sendDidOpenAppEvent')

  self.client.updateSession(function (err) {
    if (err) {
      return cb(err)
    }

    var uuid = StringUtils.uniqueIdentifer()
    var friendCount = -1

    self.client.currentSession.friends.forEach(function (friend) {
      if (friend.privacy === constants.SnapPrivacy.Friends) {
        ++friendCount
      }
    })

    var unimplemented = 'Unimplemented'
    var timestamp = StringUtils.timestamp()

    self.client.sendEvents({
      'common_params': JSON.stringify({
        'user_id': StringUtils.md5HashToHex(self.client.username),
        'city': unimplemented,
        'sc_user_agent': constants.core.userAgent,
        'session_id': "00000000-0000-0000-0000-000000000000",
        'region': unimplemented,
        'latlon': unimplemented,
        'friend_count': friendCount,
        'country': unimplemented
      }),
      'events': JSON.stringify([
        JSON.stringify({
          'event_name': 'APP_OPEN',
          'event_timestamp': timestamp,
          'event_params': JSON.stringify({
            'open_state': 'NORMAL',
            'intent_action': 'NULL'
          })
        })
      ]),
      'batch_id': uuid + '-' + constants.core.userAgent.replace(/\w+/, '') + timestamp
    }, null, cb)
  })
}

/**
 * Sends the "app did close" event to Snapchat.
 *
 * @param {function} cb
 */
Device.prototype.sendDidCloseAppEvent = function (cb) {
  var self = this
  debug('Device.sendDidCloseAppEvent')

  self.client.sendEvents([
    {
      'eventName': 'CLOSE',
      'params': { },
      'ts': StringUtils.timestamp()
    }
  ], null, cb)
}