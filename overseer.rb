require 'rubygems'
require 'xmpp4r/client'
require 'xmpp4r/roster'

include Jabber


Jabber.debug = true

$SUBS = []

jid = JID.new('overseer@ubu')
client = Client.new(jid)


client.add_message_callback do |msg|
  puts msg 
end

client.add_presence_callback do |old_presence, new_presence|
  puts "#{old_presence} ==> #{new_presence}"
end

client.connect
client.auth("poop")

roster = Roster::Helper.new(client)
roster.add_subscription_request_callback do |item, pres|
  roster.accept_subscription(pres.from)
end

client.send(Presence.new.set_type(:available))

