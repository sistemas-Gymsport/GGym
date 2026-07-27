import React, { useState, useEffect, useMemo, Fragment } from 'react';

export default function ChatbotWhatsAppViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeChatNumber, setActiveChatNumber] = useState(null);
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/chatbot-logs');
        
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status}`);
        }

        const data = await res.json();
        
        // Validación estricta: Si no es un array, asignamos un array vacío
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.error("La respuesta de la API no es un arreglo válido:", data);
          setLogs([]);
        }
      } catch (error) {
        console.error("Error al obtener los logs del chatbot:", error);
        setLogs([]); // Evita que el .forEach() rompa la página
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-[#111b21]' : 'bg-[#efeae2]';
  const bgSidebar = isDark ? 'bg-[#202c33]' : 'bg-white';
  const bgHeader = isDark ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';
  const bgSearch = isDark ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';
  const bgSearchInput = isDark ? 'bg-[#2a3942]' : 'bg-white';
  const textMain = isDark ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textMuted = isDark ? 'text-[#8696a0]' : 'text-[#667781]';
  const borderSidebar = isDark ? 'border-[#313d45]' : 'border-[#d1d7db]';
  const bgHover = isDark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]';
  const bgActive = isDark ? 'bg-[#2a3942]' : 'bg-[#f0f2f5]';
  const bubbleIn = isDark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const bubbleOut = isDark ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]';

  const groupedChats = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      if (!groups[log.numero]) {
        groups[log.numero] = {
          numero: log.numero,
          nombre: log.nombre || 'Desconocido',
          messages: [],
          lastDate: log.fecha
        };
      }
      groups[log.numero].messages.push(log);
      if (new Date(log.fecha) > new Date(groups[log.numero].lastDate)) {
        groups[log.numero].lastDate = log.fecha;
      }
    });

    return Object.values(groups).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
  }, [logs]);

  const filteredChats = useMemo(() => {
    if (!globalSearch.trim()) return groupedChats;
    const term = globalSearch.toLowerCase();
    
    return groupedChats.filter(chat => {
      const matchName = chat.nombre.toLowerCase().includes(term);
      const matchNumber = chat.numero.toLowerCase().includes(term);
      const matchMessages = chat.messages.some(msg => 
        (msg.mensaje_cliente && msg.mensaje_cliente.toLowerCase().includes(term)) ||
        (msg.mensaje_ia && msg.mensaje_ia.toLowerCase().includes(term))
      );
      return matchName || matchNumber || matchMessages;
    });
  }, [groupedChats, globalSearch]);

  const activeChat = useMemo(() => {
    return groupedChats.find(c => c.numero === activeChatNumber) || null;
  }, [groupedChats, activeChatNumber]);

  const filteredActiveMessages = useMemo(() => {
    if (!activeChat) return [];
    if (!chatSearch.trim()) return activeChat.messages;
    const term = chatSearch.toLowerCase();
    
    return activeChat.messages.filter(msg => 
      (msg.mensaje_cliente && msg.mensaje_cliente.toLowerCase().includes(term)) ||
      (msg.mensaje_ia && msg.mensaje_ia.toLowerCase().includes(term))
    );
  }, [activeChat, chatSearch]);

  const getInitials = (name, number) => {
    if (name && name !== 'Desconocido' && name !== '.') {
      return name.substring(0, 2).toUpperCase();
    }
    return number.substring(number.length - 2);
  };

  if (loading) {
    return (
      <div className={`w-full h-full min-h-[600px] flex justify-center items-center ${bgMain} ${textMain}`}>
        <span>Cargando interfaz...</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-[calc(100vh-100px)] flex font-sans ${bgMain} ${textMain} rounded-lg overflow-hidden border ${borderSidebar}`}>
      <div className={`w-1/3 h-full flex flex-col border-r ${borderSidebar} ${bgSidebar}`}>
        
        {showSettings ? (
          <div className="flex flex-col h-full">
            <div className={`h-28 flex items-end pb-4 px-6 ${bgHeader}`}>
              <button onClick={() => setShowSettings(false)} className="mr-6">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={textMain}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              <h1 className="text-xl font-medium">Ajustes</h1>
            </div>
            <div className={`flex-1 p-6 ${bgMain}`}>
              <div className={`flex items-center justify-between p-4 rounded-lg shadow-sm ${bgSidebar}`}>
                <span>Tema Oscuro</span>
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${isDark ? 'bg-green-600 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Fragment>
            <div className={`h-16 flex items-center justify-between px-4 py-2 ${bgHeader}`}>
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                GG
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowSettings(true)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={textMuted}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
              </div>
            </div>

            <div className={`p-2 border-b ${borderSidebar} ${bgSearch}`}>
              <div className={`flex items-center px-3 py-1.5 rounded-lg ${bgSearchInput}`}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={`${textMuted} mr-3`}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="Buscar chat, número o mensaje" 
                  className={`w-full bg-transparent outline-none text-sm ${textMain}`}
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {filteredChats.map((chat) => (
                <div 
                  key={chat.numero}
                  onClick={() => {
                    setActiveChatNumber(chat.numero);
                    setShowChatSearch(false);
                    setChatSearch('');
                  }}
                  className={`flex items-center px-3 py-3 cursor-pointer ${activeChatNumber === chat.numero ? bgActive : bgHover}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-white font-medium mr-3">
                    {getInitials(chat.nombre, chat.numero)}
                  </div>
                  <div className={`flex-1 border-b pb-3 pt-1 ${borderSidebar}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-base font-normal truncate pr-2">{chat.nombre !== '.' && chat.nombre !== 'Desconocido' ? chat.nombre : chat.numero}</span>
                      <span className={`text-xs ${textMuted}`}>{new Date(chat.lastDate).toLocaleDateString()}</span>
                    </div>
                    <div className={`text-sm truncate pr-2 ${textMuted}`}>
                      {chat.messages[chat.messages.length - 1].mensaje_cliente || chat.messages[chat.messages.length - 1].mensaje_ia}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Fragment>
        )}
      </div>

      <div className="w-2/3 h-full flex flex-col relative">
        {activeChat ? (
          <Fragment>
            <div className={`h-16 flex items-center justify-between px-4 py-2 border-b ${borderSidebar} ${bgHeader} z-10`}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium mr-3">
                  {getInitials(activeChat.nombre, activeChat.numero)}
                </div>
                <div>
                  <h2 className="text-base font-normal">{activeChat.nombre !== '.' && activeChat.nombre !== 'Desconocido' ? activeChat.nombre : activeChat.numero}</h2>
                  <p className={`text-xs ${textMuted}`}>{activeChat.numero}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowChatSearch(!showChatSearch)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={textMuted}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
            </div>

            {showChatSearch && (
              <div className={`p-3 border-b ${borderSidebar} ${bgSearch} z-10 flex items-center`}>
                <button onClick={() => {setShowChatSearch(false); setChatSearch('');}} className="mr-4">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={textMuted}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div className={`flex-1 flex items-center px-3 py-1.5 rounded-lg ${bgSearchInput}`}>
                  <input 
                    type="text" 
                    placeholder="Buscar mensaje en este chat" 
                    className={`w-full bg-transparent outline-none text-sm ${textMain}`}
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div 
              className="flex-1 overflow-y-auto p-8 relative"
              style={{
                backgroundImage: isDark 
                  ? 'linear-gradient(rgba(11, 20, 26, 0.9), rgba(11, 20, 26, 0.9)), url("https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png")'
                  : 'linear-gradient(rgba(229, 221, 213, 0.9), rgba(229, 221, 213, 0.9)), url("https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png")',
                backgroundRepeat: 'repeat',
                backgroundSize: '400px'
              }}
            >
              <div className="flex flex-col gap-2 max-w-3xl mx-auto pb-4">
                {filteredActiveMessages.map((msg, index) => (
                  <Fragment key={`${msg.id}-${index}`}>
                    {msg.mensaje_cliente && (
                      <div className="flex justify-start mb-1">
                        <div className={`max-w-[75%] rounded-lg p-2 text-sm shadow-sm relative ${bubbleIn} rounded-tl-none`}>
                          <p className="whitespace-pre-wrap break-words">{msg.mensaje_cliente}</p>
                          <span className={`text-[10px] float-right mt-1 ml-4 ${isDark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>
                            {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                    {msg.mensaje_ia && (
                      <div className="flex justify-end mb-1">
                        <div className={`max-w-[75%] rounded-lg p-2 text-sm shadow-sm relative ${bubbleOut} rounded-tr-none`}>
                          <p className="whitespace-pre-wrap break-words">{msg.mensaje_ia}</p>
                          <div className="flex items-center justify-end float-right mt-1 ml-4 gap-1">
                            <span className={`text-[10px] ${isDark ? 'text-[#85d1b3]' : 'text-[#667781]'}`}>
                              {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <svg viewBox="0 0 24 24" width="16" height="16" className={isDark ? "text-[#53bdeb]" : "text-[#53bdeb]"}><path fill="currentColor" d="M18.71,7.21a1,1,0,0,0-1.42,0L9.84,14.67,6.71,11.53A1,1,0,1,0,5.29,13l3.84,3.84a1,1,0,0,0,1.42,0l8.16-8.16A1,1,0,0,0,18.71,7.21Z"></path><path fill="currentColor" d="M22.71,7.21a1,1,0,0,0-1.42,0l-8.16,8.16a1,1,0,0,1-1.42,0L10.29,14A1,1,0,0,0,8.88,15.46l2.84,2.84a3,3,0,0,0,4.24,0l8.16-8.16A1,1,0,0,0,22.71,7.21Z"></path></svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </Fragment>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-b-8 border-green-500">
            <h1 className="text-3xl font-light mb-4">Chatbot de WhatsApp</h1>
            <p className={textMuted}>Selecciona un chat del panel lateral para ver el historial de mensajes de la IA.</p>
          </div>
        )}
      </div>
    </div>
  );
}