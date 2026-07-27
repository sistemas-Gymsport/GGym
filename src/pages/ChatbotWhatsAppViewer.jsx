import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotWhatsAppViewer.css';

export default function ChatbotWhatsAppViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeChatNumber, setActiveChatNumber] = useState(null);
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setIsRefreshing(true);
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
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

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

  const sortedActiveMessages = useMemo(() => {
    return [...filteredActiveMessages].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [filteredActiveMessages]);

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

  const handleDownloadTXT = () => {
    if (!activeChat) return;
    setShowMenu(false);
    let content = `Historial de Chat - GEO GYM\nNombre: ${activeChat.nombre}\nNúmero: ${activeChat.numero}\n\n`;
    
    sortedActiveMessages.forEach(msg => {
      const time = new Date(msg.fecha).toLocaleString();
      if (msg.mensaje_cliente) {
        content += `[${time}] Cliente: ${msg.mensaje_cliente}\n`;
      }
      if (msg.mensaje_ia) {
        content += `[${time}] GEO Gym IA: ${msg.mensaje_ia}\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chat_${activeChat.numero}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!activeChat) return;
    setShowMenu(false);
    const printWindow = window.open('', '', 'height=800,width=800');
    
    let html = `
      <html>
        <head>
          <title>Chat ${activeChat.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: #f9f9f9; }
            .header { border-bottom: 2px solid #53bdeb; padding-bottom: 10px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #111b21; }
            .header p { color: #667781; margin: 5px 0 0 0; }
            .msg { margin-bottom: 20px; padding: 15px; border-radius: 8px; max-width: 75%; line-height: 1.5; font-size: 14px; position: relative; }
            .cliente { background: #ffffff; border: 1px solid #e0e0e0; margin-right: auto; }
            .ia { background: #d9fdd3; border: 1px solid #c1f0b9; margin-left: auto; }
            .time { display: block; font-size: 11px; color: #888; margin-top: 8px; text-align: right; }
            .sender { font-weight: bold; margin-bottom: 5px; display: block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Registro de Chat GEO GYM</h1>
            <p><strong>Cliente:</strong> ${activeChat.nombre !== '.' ? activeChat.nombre : activeChat.numero}</p>
            <p><strong>Teléfono:</strong> ${activeChat.numero}</p>
          </div>
    `;

    sortedActiveMessages.forEach(msg => {
      const time = new Date(msg.fecha).toLocaleString();
      if (msg.mensaje_cliente) {
        html += `
          <div class="msg cliente">
            <span class="sender">Cliente</span>
            ${msg.mensaje_cliente}
            <span class="time">${time}</span>
          </div>`;
      }
      if (msg.mensaje_ia) {
        html += `
          <div class="msg ia">
            <span class="sender">GEO Gym IA</span>
            ${msg.mensaje_ia}
            <span class="time">${time}</span>
          </div>`;
      }
    });

    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  let lastDateRendered = '';

  if (loading && logs.length === 0) {
    return (
      <div className="wa-wrapper" data-theme={theme} style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <svg style={{animation: 'spin 1s linear infinite', height: '40px', width: '40px', color: '#00a884', marginBottom: '16px'}} viewBox="0 0 24 24">
            <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span style={{fontSize: '14px', fontWeight: 500, color: 'var(--wa-text-main)'}}>Cargando WhatsApp...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wa-wrapper" data-theme={theme} onClick={() => { if(showMenu) setShowMenu(false); }}>
      <div className="wa-container">
        
        <div className="wa-sidebar">
          <Fragment>
            <div className="wa-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span style={{fontWeight: 700, fontSize: '18px', letterSpacing: '0.025em'}}>WhatsApp</span>
              </div>
              <div className="wa-header-actions">
                <button onClick={() => navigate('/admin')} title="Volver al Dashboard" className="wa-icon-btn">
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </button>
                <button onClick={toggleTheme} title={isDark ? "Modo Claro" : "Modo Oscuro"} className="wa-icon-btn">
                  {isDark ? (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="wa-search-container">
              <div className="wa-search-box">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="wa-icon-btn" style={{padding:0}}><path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Buscar un chat, número o mensaje" 
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
              <div>
                <span className="wa-filter-badge">Todos</span>
              </div>
            </div>

            <div className="wa-update-btn" onClick={fetchLogs}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={isRefreshing ? "spin-animation" : ""} style={{marginRight: '16px'}}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              <span style={{fontSize: '15px'}}>Actualizar para ver los cambios</span>
            </div>

            <div className="wa-chat-list">
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
                      setShowMenu(false);
                    }}
                    className={`wa-chat-item ${activeChatNumber === chat.numero ? 'active' : ''}`}
                  >
                    <div className="wa-avatar-container">
                      <div className="wa-avatar">
                        {getInitials(chat.nombre, chat.numero)}
                      </div>
                    </div>
                    <div className="wa-chat-info">
                      <div className="wa-chat-row">
                        <span className="wa-chat-name">
                          {chat.nombre !== '.' && chat.nombre !== 'Desconocido' ? chat.nombre : chat.numero}
                        </span>
                        <span className="wa-chat-time">
                          {formatChatListTime(chat.lastDate)}
                        </span>
                      </div>
                      <div className="wa-chat-msg">
                        {!isIncoming && (
                          <svg viewBox="0 0 16 15" width="16" height="15" fill="var(--wa-icon-active)" style={{marginRight:'4px', flexShrink:0}}><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                        )}
                        <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{lastText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Fragment>
        </div>

        <div className="wa-main-area">
          {activeChat ? (
            <Fragment>
              <div className="wa-header">
                <div style={{display:'flex', alignItems:'center'}}>
                  <div className="wa-avatar" style={{width:'40px', height:'40px', marginRight:'16px'}}>
                    {getInitials(activeChat.nombre, activeChat.numero)}
                  </div>
                  <div className="wa-chat-header-info">
                    <span className="wa-header-title">
                      {activeChat.nombre !== '.' && activeChat.nombre !== 'Desconocido' ? activeChat.nombre : activeChat.numero}
                    </span>
                    <span className="wa-chat-header-subtitle">Historial de solo lectura</span>
                  </div>
                </div>
                <div className="wa-header-actions">
                  <button onClick={() => setShowChatSearch(!showChatSearch)} className="wa-icon-btn" title="Buscar mensaje">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path></svg>
                  </button>
                  
                  <div style={{position: 'relative'}}>
                    <button 
                      className="wa-icon-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                      title="Opciones de descarga"
                    >
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                    </button>
                    
                    {showMenu && (
                      <div className="wa-dropdown-menu">
                        <div className="wa-dropdown-item" onClick={handleDownloadPDF}>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          Descargar en PDF
                        </div>
                        <div className="wa-dropdown-item" onClick={handleDownloadTXT}>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          Descargar en TXT
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div className="wa-messages-area">
                <div className="wa-messages-wrapper">
                  {sortedActiveMessages.map((msg, index) => {
                    const msgDateObj = msg.fecha ? new Date(msg.fecha) : new Date();
                    const msgDateStr = msgDateObj.toLocaleDateString();
                    const showSeparator = lastDateRendered !== msgDateStr;
                    
                    if (showSeparator) {
                      lastDateRendered = msgDateStr;
                    }

                    return (
                      <Fragment key={`${msg.id || index}-${index}`}>
                        
                        {showSeparator && (
                          <div className="wa-date-separator">
                            <span className="wa-date-badge">
                              {formatChatListTime(msg.fecha)}
                            </span>
                          </div>
                        )}

                        {msg.mensaje_cliente && (
                          <div className="wa-msg-row incoming">
                            <div className="wa-bubble">
                              <p className="wa-msg-text">{msg.mensaje_cliente}</p>
                              <div className="wa-msg-meta">
                                <span>{formatMessageTime(msg.fecha)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {msg.mensaje_ia && (
                          <div className="wa-msg-row outgoing">
                            <div className="wa-bubble">
                              <p className="wa-msg-text">{msg.mensaje_ia}</p>
                              <div className="wa-msg-meta">
                                <span>{formatMessageTime(msg.fecha)}</span>
                                <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              {showChatSearch && (
                <div className="wa-chat-search-pane">
                  <div className="wa-chat-search-header">
                    <button onClick={() => {setShowChatSearch(false); setChatSearch('');}} className="wa-icon-btn" style={{marginRight:'16px'}}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path></svg>
                    </button>
                    <span style={{fontSize: '16px'}}>Buscar mensajes</span>
                  </div>
                  <div className="wa-search-container" style={{borderBottom:'none', padding: '16px 12px'}}>
                    <div className="wa-search-box">
                      <input 
                        type="text" 
                        placeholder="Buscar..." 
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          ) : (
            <div className="wa-empty-state">
              <svg width="320" height="200" viewBox="0 0 320 200" fill="none" style={{opacity:0.6}}>
                 <circle cx="160" cy="100" r="60" stroke="var(--wa-border)" strokeWidth="2"/>
                 <path d="M140 100 L155 115 L185 85" stroke="var(--wa-icon-active)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="wa-empty-title">WhatsApp Web</h1>
              <p className="wa-empty-text">Envía y recibe mensajes sin mantener tu teléfono conectado.<br/>Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}