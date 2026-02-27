import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserConversations, getOwnerConversations, getMessagesByConversation, sendMessage, startConversation, getProductById, getUserById } from '../services/api';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryConv = searchParams.get('c');
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(queryConv ? Number(queryConv) : null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeContext, setActiveContext] = useState(null); // { property, otherUser }
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem('token-37c');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) { return null; }
  };

  const loadConversations = async () => {
    try {
      const me = getCurrentUser();
      const res = me?.role === 'owner' ? await getOwnerConversations() : await getUserConversations();
      console.log('loadConversations response', res?.data);
      const convs = res.data?.conversations || [];
      // enrich conversations with product title and other user name lazily
      const enriched = await Promise.all(convs.map(async (c) => {
        const product = c.property_id ? (await getProductById(c.property_id).catch(()=>({ data: {} }))).data?.product : null;
        const otherId = (me?.role === 'owner') ? c.user_id : c.owner_id;
        const other = otherId ? (await getUserById(otherId).catch(()=>({ data: {} }))).data?.user : null;
        return {
          ...c,
          property_title: product?.title || `Property #${c.property_id}`,
          other_name: other?.name || other?.email || (otherId ? `User ${otherId}` : 'Unknown'),
        };
      }));
      setConversations(enriched);
    } catch (err) {
      console.error('Error loading conversations', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (err.response?.status === 401) {
        toast.error(serverMsg || 'Not authenticated — please log in');
      } else {
        toast.error(serverMsg || 'Failed to load conversations');
      }
      setConversations([]);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv);
  }, [activeConv]);

  // when messages change, auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const res = await getMessagesByConversation(conversationId);
      console.log('loadMessages response', res?.data);
      const msgs = res.data?.messages || [];
      setMessages(msgs);
      // load context (property and other user)
      const conv = conversations.find((c) => c.id === conversationId) || {};
      let property = null;
      let otherUser = null;
      try { if (conv.property_id) property = (await getProductById(conv.property_id)).data?.product; } catch (e) { property = null; }
      try {
        const me = getCurrentUser();
        const otherId = me?.role === 'owner' ? conv.user_id : conv.owner_id;
        if (otherId) otherUser = (await getUserById(otherId)).data?.user;
      } catch (e) { otherUser = null; }
      setActiveContext({ property, otherUser });
    } catch (err) {
      console.error('Error loading messages', err);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    try {
      const res = await sendMessage({ conversation_id: activeConv, message_text: text });
      console.log('sendMessage response', res?.data);
      if (res.data?.success) {
        setText('');
        await loadMessages(activeConv);
        await loadConversations();
      } else {
        toast.error(res.data?.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message', err);
      const msg = err.response?.data?.message || err.message || 'Failed to send message';
      toast.error(msg);
    }
  };

  // If a property/owner link provided via query (ownerId & property), start or reuse conversation
  const tryStartFromQuery = async () => {
    try {
      const ownerId = searchParams.get('owner');
      const propertyId = searchParams.get('product');
      if (ownerId && propertyId) {
        const res = await startConversation({ owner_id: Number(ownerId), property_id: Number(propertyId) });
        console.log('startConversation response', res?.data);
        const conv = res.data?.conversation;
        if (conv) {
          setActiveConv(conv.id);
          await loadConversations();
          // load messages for the new conversation
          await loadMessages(conv.id);
        } else {
          toast.error('Could not start conversation');
        }
      }
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { tryStartFromQuery(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="min-h-screen p-5 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-4 rounded shadow flex flex-col">
          <h3 className="font-bold mb-3">Conversations</h3>
          {conversations.length === 0 ? (
            <div className="text-sm text-slate-500">No messages yet. Start conversation from property page.</div>
          ) : (
            <div className="overflow-y-auto space-y-2">
              {conversations.map((c) => (
                <button key={c.id} onClick={() => setActiveConv(c.id)} className={`w-full text-left p-3 rounded flex items-start gap-3 ${activeConv === c.id ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm">{c.property_title || `Property #${c.property_id}`}</div>
                      <div className="text-xs text-slate-400">{c.last_message_at ? new Date(c.last_message_at).toLocaleString() : ''}</div>
                    </div>
                    <div className="text-xs text-slate-500">{c.other_name || 'Unknown'}</div>
                    <div className="text-sm text-slate-600 truncate mt-1">{c.last_message || '—'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded shadow flex flex-col">
          {!activeConv ? (
            <div className="text-center text-slate-500 py-12">Select a conversation to view messages</div>
          ) : (
            <div className="flex flex-col h-[70vh]">
              {/* Property / other user context */}
              <div className="border-b pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600">{activeContext?.property ? 'Property' : ''}</div>
                    <div className="font-semibold">{activeContext?.property?.title || `Property #${conversations.find(c=>c.id===activeConv)?.property_id || ''}`}</div>
                    <div className="text-xs text-slate-500">With: {activeContext?.otherUser?.name || activeContext?.otherUser?.email || conversations.find(c=>c.id===activeConv)?.other_name || 'Unknown'}</div>
                  </div>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-3 px-1">
                {loading ? (
                  <div className="text-center text-slate-500 py-8">Loading...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">No messages yet. Start conversation from property page.</div>
                ) : (
                  <div className="flex flex-col gap-3 px-2">
                    {messages.map((m) => {
                      const mine = m.sender_id === getCurrentUser()?.id;
                      return (
                        <div key={m.id} className={`max-w-[80%] ${mine ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                          <div className={`${mine ? 'bg-teal-600 text-white' : 'bg-gray-100 text-slate-800'} inline-block px-4 py-2 rounded-2xl`}>{m.message_text}</div>
                          <div className="text-xs text-slate-400 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex gap-2">
                  <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a message" />
                  <button onClick={handleSend} className="px-4 py-2 bg-teal-600 text-white rounded">Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
