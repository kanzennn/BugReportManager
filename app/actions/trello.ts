'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getBoards, getLists, createCard } from '@/lib/trello'
import { getAppRole, canEdit, isOwner } from '@/lib/access'
import { revalidatePath } from 'next/cache'

async function requireOwner(userId: string, appId: string) {
  const role = await getAppRole(userId, appId)
  if (!role || !isOwner(role)) throw new Error('Only the application owner can manage integrations.')
}

export async function saveTrelloTokenAction(appId: string, token: string) {
  const { userId } = await requireAuth()
  await requireOwner(userId, appId)

  await prisma.application.update({
    where: { id: appId },
    data: {
      trelloToken: token,
      trelloBoardId: null,
      trelloBoardName: null,
      trelloListId: null,
      trelloListName: null,
    },
  })
  revalidatePath(`/dashboard/applications/${appId}/integrations`)
}

export async function saveTrelloListAction(
  appId: string,
  boardId: string,
  boardName: string,
  listId: string,
  listName: string,
) {
  const { userId } = await requireAuth()
  await requireOwner(userId, appId)

  await prisma.application.update({
    where: { id: appId },
    data: { trelloBoardId: boardId, trelloBoardName: boardName, trelloListId: listId, trelloListName: listName },
  })
  revalidatePath(`/dashboard/applications/${appId}/integrations`)
}

export async function disconnectTrelloAction(appId: string) {
  const { userId } = await requireAuth()
  await requireOwner(userId, appId)

  await prisma.application.update({
    where: { id: appId },
    data: {
      trelloToken: null,
      trelloBoardId: null,
      trelloBoardName: null,
      trelloListId: null,
      trelloListName: null,
    },
  })
  revalidatePath(`/dashboard/applications/${appId}/integrations`)
}

export async function fetchTrelloBoardsAction(appId: string) {
  const { userId } = await requireAuth()
  await requireOwner(userId, appId)

  const app = await prisma.application.findUnique({ where: { id: appId }, select: { trelloToken: true } })
  if (!app?.trelloToken) throw new Error('No Trello token found.')
  return getBoards(app.trelloToken)
}

export async function fetchTrelloListsAction(appId: string, boardId: string) {
  const { userId } = await requireAuth()
  await requireOwner(userId, appId)

  const app = await prisma.application.findUnique({ where: { id: appId }, select: { trelloToken: true } })
  if (!app?.trelloToken) throw new Error('No Trello token found.')
  return getLists(app.trelloToken, boardId)
}

export async function pushBugToTrelloAction(bugId: string): Promise<{ url: string }> {
  const { userId } = await requireAuth()

  const bug = await prisma.bugReport.findFirst({
    where: {
      id: bugId,
      application: { OR: [{ userId }, { members: { some: { userId } } }] },
    },
    select: {
      id: true, title: true, description: true, priority: true,
      status: true, appVersion: true, deviceInfo: true, stackTrace: true,
      applicationId: true, trelloCardUrl: true,
    },
  })
  if (!bug) throw new Error('Bug report not found.')

  const role = await getAppRole(userId, bug.applicationId)
  if (!role || !canEdit(role)) throw new Error('You do not have permission to push to Trello.')

  const app = await prisma.application.findUnique({
    where: { id: bug.applicationId },
    select: { trelloToken: true, trelloListId: true },
  })
  if (!app?.trelloToken || !app.trelloListId) {
    throw new Error('Trello is not configured for this application.')
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const desc = [
    `**Priority:** ${bug.priority}`,
    `**Status:** ${bug.status}`,
    bug.appVersion ? `**App Version:** ${bug.appVersion}` : null,
    bug.deviceInfo  ? `**Device:** ${bug.deviceInfo}` : null,
    '',
    '**Description:**',
    bug.description,
    bug.stackTrace ? `\n**Stack Trace:**\n\`\`\`\n${bug.stackTrace}\n\`\`\`` : null,
    '',
    `---`,
    `[View in BugReport Manager](${baseUrl}/dashboard/bugs/${bug.id})`,
  ].filter(Boolean).join('\n')

  const card = await createCard(app.trelloToken, {
    listId: app.trelloListId,
    name: bug.title,
    desc,
  })

  await prisma.bugReport.update({
    where: { id: bugId },
    data: { trelloCardUrl: card.shortUrl },
  })

  revalidatePath(`/dashboard/bugs/${bugId}`)
  return { url: card.shortUrl }
}
