import { useState, useEffect, useCallback, useRef } from 'react';

export function useGameSocket(appName, sessionId, userId, username) {
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [secretCard, setSecretCard] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isComponentMounted = useRef(true);

  const sendMessageRaw = useCallback((wsInstance, message) => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify(message));
    } else {
      console.warn("Cannot send message, WebSocket is not open");
    }
  }, []);

  const connect = useCallback(() => {
    if (!sessionId || !userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // For local development, assuming backend runs on port 8000
    // For production, connect to the deployed Render backend
    const host = isLocalhost ? `${window.location.hostname}:8000` : 'modux.onrender.com';
    const wsUrl = `${protocol}//${host}/ws/${appName}/${sessionId}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (!isComponentMounted.current) return;
      setIsConnected(true);
      // Automatically join game on connect
      sendMessageRaw(ws, {
        action: 'join_game',
        user_id: userId,
        username: username
      });
      
      // Clear any reconnect timeout if we connected successfully
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      if (!isComponentMounted.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'state_update') {
          setGameState(data.data);
        } else if (data.type === 'secret_update') {
          setSecretCard(data.secret_card || data.data?.coordinate);
        }
      } catch (error) {
        console.error("Error parsing websocket message", error);
      }
    };

    ws.onclose = () => {
      if (!isComponentMounted.current) return;
      setIsConnected(false);
      
      // Auto-reconnection logic
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isComponentMounted.current) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
      // Don't close manually here, let it trigger onclose naturally
    };

    wsRef.current = ws;
  }, [appName, sessionId, userId, username, sendMessageRaw]);

  useEffect(() => {
    isComponentMounted.current = true;
    connect();

    return () => {
      isComponentMounted.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendAction = useCallback((action, payload = {}) => {
    sendMessageRaw(wsRef.current, {
      action,
      user_id: userId,
      ...payload
    });
  }, [userId, sendMessageRaw]);

  return {
    gameState,
    isConnected,
    secretCard,
    sendMessage: sendAction
  };
}
