import { Suspense } from 'react';
import { LoadingProgress } from '@/components/loader';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  console.error('Component loading error:', error);
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h3>Something went wrong loading this page</h3>
      <p>Please try refreshing the page or contact support if the issue persists.</p>
      <button 
        onClick={resetErrorBoundary}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Try Again
      </button>
    </div>
  );
};

const Loadable = Component => props => {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Loadable component error:', error, errorInfo);
      }}
      onReset={() => {
        // Reload the page on reset
        window.location.reload();
      }}
    >
      <Suspense fallback={<LoadingProgress />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Loadable;