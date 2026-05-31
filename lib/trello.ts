const BASE = 'https://api.trello.com/1'

export function trelloAuthUrl(returnUrl: string): string {
  const params = new URLSearchParams({
    expiration: 'never',
    scope: 'read,write',
    response_type: 'token',
    name: 'BugReport Manager',
    key: process.env.TRELLO_API_KEY!,
    return_url: returnUrl,
    callback_method: 'fragment',
  })
  return `https://trello.com/1/authorize?${params}`
}

export type TrelloBoard = { id: string; name: string }
export type TrelloList  = { id: string; name: string }
export type TrelloCard  = { id: string; shortUrl: string }

async function trelloGet<T>(path: string, token: string): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('key', process.env.TRELLO_API_KEY!)
  url.searchParams.set('token', token)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Trello API error (${res.status}): ${await res.text()}`)
  return res.json() as Promise<T>
}

export async function getBoards(token: string): Promise<TrelloBoard[]> {
  return trelloGet<TrelloBoard[]>('/members/me/boards?filter=open&fields=id,name', token)
}

export async function getLists(token: string, boardId: string): Promise<TrelloList[]> {
  return trelloGet<TrelloList[]>(`/boards/${boardId}/lists?filter=open&fields=id,name`, token)
}

export async function createCard(token: string, params: {
  listId: string
  name: string
  desc: string
}): Promise<TrelloCard> {
  const url = new URL(`${BASE}/cards`)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idList: params.listId,
      name: params.name,
      desc: params.desc,
      key: process.env.TRELLO_API_KEY!,
      token,
    }),
  })
  if (!res.ok) throw new Error(`Trello create card failed (${res.status}): ${await res.text()}`)
  return res.json() as Promise<TrelloCard>
}
