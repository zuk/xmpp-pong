require 'rubygems'
require 'xmpp4r/client'
require 'xmpp4r/roster'
require 'colored'
require 'pp'

include Jabber


Jabber.debug = true

$SUBS = []

jid = JID.new('overseer@carbon')
client = Client.new(jid)


client.add_message_callback do |msg|
  puts "message_callback".yellow
  puts msg 
end

client.add_presence_callback do |old_presence, new_presence|
  puts "presence_callback".yellow
  pp old_presence
  pp new_presence 
end

client.connect
client.auth("poop")

roster = Roster::Helper.new(client)
roster.add_subscription_request_callback do |item, pres|
  puts "accepting subscription request from #{pres.from}".yellow
  roster.accept_subscription(pres.from)
  pp item
  puts "sending subscription request to #{pres.from}...".green
  p = Presence.new
  p.set_type(:subscribe)
  p.set_to(pres.from)
  client.send(p)

end

client.send(Presence.new.set_type(:available))

Thread.stop
