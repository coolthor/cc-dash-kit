declare module 'claude-code' {
  interface PluginState {
    'image-peek': {
      // Thumbnails per user message, keyed by the message uuid
      shots: Record<string, { png: string; width: number; height: number }[]>
      // The latest prompt and when it arrived
      lastPrompt: { uuid: string; at: number } | null
      // Images from an attachment row that arrived before its prompt
      pending: { at: number; shots: { png: string; width: number; height: number }[] } | null
    }
  }
}
