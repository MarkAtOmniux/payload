'use client'

import React, { useEffect, useState } from 'react'

import type { User } from '../../packages/payload/src/auth'
import type { UIField } from '../../packages/payload/src/fields/config/types'

import { useAuth } from '../../packages/ui'

export const AuthDebug: React.FC<UIField> = () => {
  const [state, setState] = useState<User | null | undefined>()
  const { user } = useAuth()

  useEffect(() => {
    const fetchUser = async () => {
      const userRes = await fetch(`/api/users/${user?.id}`)?.then((res) => res.json())
      setState(userRes)
    }

    void fetchUser()
  }, [user])

  return (
    <div id="auth-debug">
      <div id="use-auth-result">{user?.custom as string}</div>
      <div id="users-api-result">{state?.custom as string}</div>
    </div>
  )
}
