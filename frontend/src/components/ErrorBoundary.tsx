import React, { ReactNode, ReactElement } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error): void {
    console.error('ErrorBoundary caught:', error)
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>⚠️ Something went wrong</h1>
            <p>We're sorry, but something unexpected happened.</p>
            <p className="error-message">{this.state.error?.message}</p>
            <button
              className="btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children as ReactElement
  }
}
