'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  /** Rendered instead of the children when loading the model throws. */
  fallback: ReactNode
  /** Notified once so the shell can surface a message outside the canvas. */
  onError?: (message: string) => void
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * A missing or malformed GLB throws during render (react-three-fiber surfaces
 * loader rejections through Suspense). Without a boundary that would blank the
 * whole tab, so we swap in the procedural home instead and let the shell show
 * a non-blocking notice.
 */
export class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[3D viewer] failed to load model', error, info.componentStack)
    this.props.onError?.(error.message)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
