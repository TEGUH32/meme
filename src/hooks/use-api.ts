import { useState, useEffect } from 'react'

export interface Meme {
  id: string
  title: string
  imageUrl: string
  caption?: string
  category: string
  author: {
    id: string
    name: string
    image?: string | null
  }
  votes: number
  _count?: {
    comments: number
    votes: number
  }
  createdAt: string
  viralScore?: number
}

export interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
  coins: number
  level: number
}

export interface Comment {
  id: string
  content: string
  memeId: string
  userId: string
  user: {
    id: string
    name: string
    image?: string | null
  }
  createdAt: string
}

export function useMemes(options?: {
  category?: string | null
  search?: string
  type?: 'foryou' | 'fresh' | 'viral'
}) {
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMemes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (options?.category && options.category !== 'all') {
        params.append('category', options.category)
      }
      if (options?.search) {
        params.append('search', options.search)
      }
      if (options?.type) {
        params.append('type', options.type)
      }

      const response = await fetch(`/api/memes?${params}`)
      const data = await response.json()

      if (data.success) {
        setMemes(data.data)
      } else {
        setError(data.error || 'Failed to fetch memes')
      }
    } catch (err) {
      setError('Error fetching memes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemes()
  }, [options?.category, options?.search, options?.type])

  return { memes, loading, error, refetch: fetchMemes }
}

export function useMeme(id: string) {
  const [meme, setMeme] = useState<Meme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeme = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/memes/${id}`)
        const data = await response.json()

        if (data.success) {
          setMeme(data.data)
        } else {
          setError(data.error || 'Failed to fetch meme')
        }
      } catch (err) {
        setError('Error fetching meme')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMeme()
    }
  }, [id])

  return { meme, loading, error }
}

export function useComments(memeId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const fetchComments = async () => {
    if (!memeId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/comments?memeId=${memeId}`)
      const data = await response.json()

      if (data.success) {
        setComments(data.data)
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [memeId])

  const addComment = async (content: string) => {
    if (!memeId) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, memeId, userId: 'demo-user' })
      })
      const data = await response.json()

      if (data.success) {
        setComments(prev => [data.data, ...prev])
        return true
      }
      return false
    } catch (err) {
      console.error('Error adding comment:', err)
      return false
    }
  }

  return { comments, loading, addComment, refetch: fetchComments }
}

export function useVotes() {
  const [loading, setLoading] = useState(false)

  const vote = async (memeId: string, type: 'up' | 'down', userId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId, type, userId })
      })
      const data = await response.json()

      if (data.success) {
        return data.data
      }
      return null
    } catch (err) {
      console.error('Error voting:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { vote, loading }
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()

        if (data.success) {
          setUsers(data.data)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return { users, loading }
}

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users?id=${userId}`)
        const data = await response.json()

        if (data.success) {
          setUser(data.data)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  return { user, loading }
}

export function useCreateMeme() {
  const [loading, setLoading] = useState(false)

  const createMeme = async (memeData: {
    title: string
    imageUrl: string
    caption?: string
    category: string
    authorId: string
  }) => {
    try {
      setLoading(true)
      const response = await fetch('/api/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memeData)
      })
      const data = await response.json()

      if (data.success) {
        return data.data
      }
      return null
    } catch (err) {
      console.error('Error creating meme:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createMeme, loading }
}
