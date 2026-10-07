import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected rendering error' };
  }

  componentDidCatch(error) {
    console.error('InternShield UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-8 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-cyber-orange mx-auto" />
          <h2 className="text-lg font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-slate-400">{this.state.message}</p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-cyber-blue text-white text-sm"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
