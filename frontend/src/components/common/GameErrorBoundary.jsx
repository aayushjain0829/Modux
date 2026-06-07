import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryFallback extends React.Component {
  render() {
    const { error, resetError } = this.props;
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💥</div>
          <h1 style={{ color: '#dc3545', margin: '0 0 15px 0', fontSize: '1.5rem' }}>Oops! Something went wrong.</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            The game encountered an unexpected error.
          </p>
          
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            textAlign: 'left',
            overflowX: 'auto',
            marginBottom: '30px',
            border: '1px solid #f5c6cb'
          }}>
            <code style={{ whiteSpace: 'pre-wrap' }}>
              {error?.toString() || 'Unknown error'}
            </code>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={resetError}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#5a6fd6'}
              onMouseOut={(e) => e.target.style.background = '#667eea'}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#5a6268'}
              onMouseOut={(e) => e.target.style.background = '#6c757d'}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error Boundary caught an error:', error, errorInfo);
  }
  
  resetError = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;
