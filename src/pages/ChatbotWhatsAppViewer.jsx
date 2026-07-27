import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatbotWhatsAppViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeChatNumber, setActiveChatNumber] = useState(null);
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot-logs');
      if (!res.ok) {
        throw new Error('Server error');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';
  const bgApp = isDark ? 'bg-[#0a1014]' : 'bg-[#d1d7db]';
  const bgMain = isDark ? 'bg-[#111b21]' : 'bg-[#efeae2]';
  const bgSidebar = isDark ? 'bg-[#111b21]' : 'bg-white';
  const bgHeader = isDark ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';
  const bgSearch = isDark ? 'bg-[#111b21]' : 'bg-white';
  const bgSearchInput = isDark ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';
  const textMain = isDark ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textMuted = isDark ? 'text-[#8696a0]' : 'text-[#667781]';
  const borderSidebar = isDark ? 'border-[#313d45]' : 'border-[#e9edef]';
  const bgHover = isDark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]';
  const bgActive = isDark ? 'bg-[#2a3942]' : 'bg-[#f0f2f5]';
  const bubbleIn = isDark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const bubbleOut = isDark ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]';

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatListTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1 || (days === 0 && now.getDate() !== date.getDate())) {
      return 'Ayer';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    return date.toLocaleDateString();
  };

  const groupedChats = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const numStr = log.numero ? String(log.numero) : 'Sin Numero';
      const nomStr = log.nombre ? String(log.nombre) : 'Desconocido';
      
      if (!groups[numStr]) {
        groups[numStr] = {
          numero: numStr,
          nombre: nomStr,
          messages: [],
          lastDate: log.fecha || new Date().toISOString()
        };
      }
      groups[numStr].messages.push(log);
      if (log.fecha && new Date(log.fecha) > new Date(groups[numStr].lastDate)) {
        groups[numStr].lastDate = log.fecha;
      }
    });

    return Object.values(groups).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
  }, [logs]);

  const filteredChats = useMemo(() => {
    if (!globalSearch.trim()) return groupedChats;
    const term = globalSearch.toLowerCase();
    
    return groupedChats.filter(chat => {
      const matchName = String(chat.nombre).toLowerCase().includes(term);
      const matchNumber = String(chat.numero).toLowerCase().includes(term);
      const matchMessages = chat.messages.some(msg => 
        (msg.mensaje_cliente && String(msg.mensaje_cliente).toLowerCase().includes(term)) ||
        (msg.mensaje_ia && String(msg.mensaje_ia).toLowerCase().includes(term))
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
      (msg.mensaje_cliente && String(msg.mensaje_cliente).toLowerCase().includes(term)) ||
      (msg.mensaje_ia && String(msg.mensaje_ia).toLowerCase().includes(term))
    );
  }, [activeChat, chatSearch]);

  const getInitials = (name, number) => {
    const strName = name ? String(name).trim() : '';
    const strNum = number ? String(number).trim() : '';

    if (strName && strName !== 'Desconocido' && strName !== '.') {
      return strName.substring(0, 2).toUpperCase();
    }
    if (strNum && strNum !== 'Sin Numero') {
      return strNum.slice(-2);
    }
    return 'GG';
  };

  if (loading && logs.length === 0) {
    return (
      <div className={`w-full h-screen flex justify-center items-center ${bgMain} ${textMain}`}>
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-[#00a884] mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Cargando WhatsApp...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen flex ${bgApp} p-0 sm:p-4 md:p-6 font-sans overflow-hidden`}>
      <div className={`w-full h-full flex ${bgMain} ${textMain} sm:rounded-md shadow-lg overflow-hidden border ${borderSidebar}`}>
        
        <div className={`w-full md:w-[350px] lg:w-[400px] h-full flex flex-col border-r ${borderSidebar} ${bgSidebar} flex-shrink-0`}>
          
          {showSettings ? (
            <div className="flex flex-col h-full z-20">
              <div className={`h-[108px] flex items-end pb-4 px-6 ${bgHeader} text-white`}>
                <button onClick={() => setShowSettings(false)} className="mr-6 mb-1">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={textMain}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h1 className="text-xl font-medium">Ajustes</h1>
              </div>
              <div className={`flex-1 p-6 ${bgMain}`}>
                <div className={`flex items-center justify-between p-4 rounded-lg shadow-sm ${bgSidebar}`}>
                  <span className="text-base">Tema Oscuro</span>
                  <button 
                    onClick={toggleTheme}
                    className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${isDark ? 'bg-[#00a884] justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Fragment>
              <div className={`h-[59px] flex items-center justify-between px-4 py-2 ${bgHeader} flex-shrink-0`}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg tracking-wide">WhatsApp</span>
                </div>
                <div className="flex gap-4 items-center">
                  <button onClick={() => navigate('/admin')} title="Volver al Dashboard" className="p-1 rounded-full hover:bg-black/10 transition-colors">
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={textMuted}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </button>
                  <button title="Comunidades" className="p-1">
                    <svg viewBox="0 0 24 24" width="24" height="24" className={textMuted} fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4.5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm4.5 5.5c0-1.93-3.166-3-4.5-3s-4.5 1.07-4.5 3v1h9v-1z"></path></svg>
                  </button>
                  <button title="Estados" className="p-1">
                    <svg viewBox="0 0 24 24" width="24" height="24" className={textMuted} fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-2.5-9.5c0 .827-.673 1.5-1.5 1.5S6.5 11.327 6.5 10.5 7.173 9 8 9s1.5.673 1.5 1.5zm5 0c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5zm1.5 4.5h-8v-1h8v1z"></path></svg>
                  </button>
                  <button title="Nuevo chat" className="p-1">
                    <svg viewBox="0 0 24 24" width="24" height="24" className={textMuted} fill="currentColor"><path d="M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z"></path><path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z"></path></svg>
                  </button>
                  <button onClick={() => setShowSettings(true)} title="Menú" className="p-1">
                    <svg viewBox="0 0 24 24" width="24" height="24" className={textMuted} fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                  </button>
                </div>
              </div>

              <div className={`p-2 border-b ${borderSidebar} ${bgSearch} flex flex-col gap-2 flex-shrink-0`}>
                <div className={`flex items-center px-3 py-1.5 rounded-lg ${bgSearchInput} h-[35px]`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" className={`${textMuted} mr-3`} fill="currentColor"><path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"></path></svg>
                  <input 
                    type="text" 
                    placeholder="Buscar un chat o iniciar uno nuevo" 
                    className={`w-full bg-transparent outline-none text-sm ${textMain} placeholder:text-[14px]`}
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                  />
                </div>
                <div className="flex px-2 py-1">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-[#202c33] text-[#8696a0]' : 'bg-[#f0f2f5] text-[#54656f]'}`}>
                    Todos
                  </span>
                </div>
              </div>

              <div 
                className={`flex items-center px-4 py-4 cursor-pointer ${bgSearchInput} mb-2 flex-shrink-0 border-b ${borderSidebar}`}
                onClick={fetchLogs}
              >
                <div className={`mr-4 ${textMuted}`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </div>
                <div className="flex-1">
                  <span className="text-base font-normal">Actualizar para ver los cambios</span>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto overflow-x-hidden ${bgSidebar}`}>
                {filteredChats.map((chat) => {
                  const lastMessage = chat.messages[chat.messages.length - 1];
                  const lastText = lastMessage.mensaje_cliente || lastMessage.mensaje_ia;
                  const isIncoming = !!lastMessage.mensaje_cliente;
                  
                  return (
                    <div 
                      key={chat.numero}
                      onClick={() => {
                        setActiveChatNumber(chat.numero);
                        setShowChatSearch(false);
                        setChatSearch('');
                      }}
                      className={`flex items-stretch h-[72px] cursor-pointer ${activeChatNumber === chat.numero ? bgActive : bgHover}`}
                    >
                      <div className="w-[77px] flex items-center justify-center flex-shrink-0 pl-3">
                        <div className="w-[49px] h-[49px] rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#111b21] font-medium text-lg">
                          {getInitials(chat.nombre, chat.numero)}
                        </div>
                      </div>
                      <div className={`flex-1 flex flex-col justify-center pr-4 border-b ${borderSidebar}`}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[17px] font-normal truncate pr-2 leading-snug">
                            {chat.nombre !== '.' && chat.nombre !== 'Desconocido' ? chat.nombre : chat.numero}
                          </span>
                          <span className={`text-xs ${textMuted} flex-shrink-0`}>
                            {formatChatListTime(chat.lastDate)}
                          </span>
                        </div>
                        <div className="flex items-center w-full mt-0.5">
                          {!isIncoming && (
                            <svg viewBox="0 0 16 15" width="16" height="15" className="mr-1 text-[#53bdeb]" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                          )}
                          <span className={`text-sm truncate w-full ${textMuted}`}>
                            {lastText}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Fragment>
          )}
        </div>

        <div className={`flex-1 h-full flex flex-col relative ${bgMain}`}>
          {activeChat ? (
            <Fragment>
              <div className={`h-[59px] flex items-center justify-between px-4 py-2 border-b ${borderSidebar} ${bgHeader} z-10 flex-shrink-0`}>
                <div className="flex items-center cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#111b21] font-medium mr-4">
                    {getInitials(activeChat.nombre, activeChat.numero)}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-[16px] font-normal leading-tight">
                      {activeChat.nombre !== '.' && activeChat.nombre !== 'Desconocido' ? activeChat.nombre : activeChat.numero}
                    </h2>
                    <p className={`text-[13px] ${textMuted} leading-tight`}>
                      Envía mensajes a este mismo número.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 pr-2">
                  <button onClick={() => setShowChatSearch(!showChatSearch)} title="Buscar">
                    <svg viewBox="0 0 24 24" width="24" height="24" className={textMuted} fill="currentColor"><path d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path></svg>
                  </button>
                  <button title="Menú">
                    <svg viewBox="0 0 24 24" width="24" height="24" className={textMuted} fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                  </button>
                </div>
              </div>

              <div 
                className="flex-1 overflow-y-auto p-4 sm:p-8 relative flex flex-col"
                style={{
                  backgroundImage: isDark 
                    ? 'linear-gradient(rgba(11, 20, 26, 0.93), rgba(11, 20, 26, 0.93)), url("https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png")'
                    : 'linear-gradient(rgba(229, 221, 213, 0.9), rgba(229, 221, 213, 0.9)), url("https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png")',
                  backgroundRepeat: 'repeat',
                  backgroundSize: '400px'
                }}
              >
                <div className="flex flex-col gap-[2px] max-w-4xl mx-auto w-full pb-4 mt-auto">
                  {filteredActiveMessages.slice().reverse().map((msg, index) => (
                    <Fragment key={`${msg.id || index}-${index}`}>
                      {msg.mensaje_cliente && (
                        <div className="flex justify-start mb-1">
                          <div className={`max-w-[85%] sm:max-w-[65%] rounded-lg px-2 pt-1.5 pb-2 text-[14.2px] shadow-sm relative ${bubbleIn} rounded-tl-md`}>
                            <p className="whitespace-pre-wrap break-words leading-[19px] pr-12">{msg.mensaje_cliente}</p>
                            <span className={`text-[11px] absolute right-2 bottom-1 ${isDark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>
                              {formatMessageTime(msg.fecha)}
                            </span>
                          </div>
                        </div>
                      )}
                      {msg.mensaje_ia && (
                        <div className="flex justify-end mb-1">
                          <div className={`max-w-[85%] sm:max-w-[65%] rounded-lg px-2 pt-1.5 pb-2 text-[14.2px] shadow-sm relative ${bubbleOut} rounded-tr-md`}>
                            <p className="whitespace-pre-wrap break-words leading-[19px] pr-16">{msg.mensaje_ia}</p>
                            <div className="flex items-center absolute right-2 bottom-1 gap-1">
                              <span className={`text-[11px] ${isDark ? 'text-[#85d1b3]' : 'text-[#667781]'}`}>
                                {formatMessageTime(msg.fecha)}
                              </span>
                              <svg viewBox="0 0 16 15" width="16" height="15" className="text-[#53bdeb]" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>

              {showChatSearch && (
                <div className={`absolute top-[59px] right-0 w-[300px] h-[calc(100%-59px)] border-l ${borderSidebar} ${bgSidebar} z-20 flex flex-col shadow-lg`}>
                  <div className={`h-[59px] flex items-center px-4 py-2 border-b ${borderSidebar} ${bgHeader}`}>
                    <button onClick={() => {setShowChatSearch(false); setChatSearch('');}} className="mr-4">
                      <svg viewBox="0 0 24 24" width="24" height="24" className={textMuted} fill="currentColor"><path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path></svg>
                    </button>
                    <span className="text-base font-normal">Buscar mensajes</span>
                  </div>
                  <div className={`p-2 border-b ${borderSidebar} ${bgSearch}`}>
                    <div className={`flex items-center px-3 py-1.5 rounded-lg ${bgSearchInput} h-[35px]`}>
                      <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className={`w-full bg-transparent outline-none text-sm ${textMain}`}
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center pt-10">
                    <span className={`text-sm ${textMuted} text-center px-4`}>
                      {chatSearch.trim() === '' ? 'Busca mensajes en este chat.' : `Resultados filtrados en la vista principal.`}
                    </span>
                  </div>
                </div>
              )}
            </Fragment>
          ) : (
            <div className={`h-full flex flex-col items-center justify-center border-b-4 sm:border-b-8 border-[#00a884] ${bgMain}`}>
              <div className="max-w-md text-center flex flex-col items-center">
                <svg width="320" height="200" viewBox="0 0 320 200" fill="none" className="mb-8 opacity-60">
                   <rect width="320" height="200" fill="transparent"/>
                   <circle cx="160" cy="100" r="60" stroke={isDark ? "#313d45" : "#d1d7db"} strokeWidth="2"/>
                   <path d="M140 100 L155 115 L185 85" stroke={isDark ? "#00a884" : "#00a884"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className={`text-[32px] font-light mb-4 ${textMain}`}>WhatsApp Web</h1>
                <p className={`text-[14px] leading-relaxed ${textMuted}`}>Envía y recibe mensajes sin mantener tu teléfono conectado.<br/>Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}